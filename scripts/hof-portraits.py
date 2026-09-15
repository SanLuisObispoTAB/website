#!/usr/bin/env python3
"""Restore the Hall of Fame inductee portraits scraped from the school site.

WHY THIS EXISTS, AND WHY IT IS NOT A `magick` ONE-LINER
The rest of the repo resizes photos with the `magick` incantation in
CLAUDE.md, and `photo-intake.mjs` is the right tool for an ordinary action
shot. These are not ordinary. The school's Hall of Fame page publishes each
inductee as a SIDE-BY-SIDE PAIR — their playing-days photo next to a current
one — and two things are wrong with them as published:

  1. The quality is poor and uneven. Scans of decades-old prints, re-saved
     JPEGs, mixed white balance, visible grain and blocking.
  2. The pair order is inconsistent. Some run old-left/current-right, others
     the reverse, so a visitor scanning the page has to re-orient at every
     card.

Both are fixable without inventing detail that was never there, which is the
whole design constraint here. Nothing below sharpens a face into existence:

  ORDER      Each half is scored for age and the pair is rebuilt older-left,
             current-right. Every decision is reported with the votes behind
             it, and a thin margin is flagged rather than quietly applied —
             printing somebody's photos backwards is worse than asking.
  GRAYSCALE  JPEG stores colour at half resolution (4:2:0 chroma
             subsampling), so on a bad scan the colour channels carry most of
             the damage: blotches, bleed, and a colour cast that differs
             between the two halves of the same card. Discarding chroma
             discards that damage outright, and it makes a 1974 print and a
             2026 phone photo sit together as one object instead of two
             clashing eras. This is the single biggest visible win.
  DOWNSIZE   Averaging several source pixels into one is real noise
             reduction: grain and 8x8 JPEG blocking shrink below the
             threshold of visibility. Detail is not added — it is that the
             damage stops being resolvable.
  LEVELS     Faded scans are low-contrast. A clipped percentile stretch
             restores black and white points without crushing either end.
  SHARPEN    Unsharp mask AFTER the downsize, never before: sharpening first
             would amplify exactly the grain the downsize is there to remove.

Order matters throughout — denoise, resize, level, sharpen — and each step is
deliberately mild. The goal is a portrait that reads cleanly at card size,
not a portrait that looks processed.

USAGE
    python3 scripts/hof-portraits.py                 # audit photo-inbox/, write nothing
    python3 scripts/hof-portraits.py --process       # write into public/photos/
    python3 scripts/hof-portraits.py --process --no-pair   # treat inputs as single portraits

Requires Pillow (`pip install pillow`). Deliberately not ImageMagick: the
per-half analysis below needs pixel access, and a shell pipeline of that
shape would be far harder to read than it is to write.
"""

from __future__ import annotations

import argparse
import math
import re
import sys
from dataclasses import dataclass
from pathlib import Path

try:
    from PIL import Image, ImageChops, ImageFilter, ImageOps, ImageStat
except ImportError:  # pragma: no cover - guidance, not logic
    sys.exit("Pillow is required:  pip install pillow")

REPO_ROOT = Path(__file__).resolve().parent.parent
INBOX = REPO_ROOT / "photo-inbox"
OUT_DIR = REPO_ROOT / "public" / "photos"

# 1200px wide / q82 / metadata stripped is the repo-wide convention
# (CLAUDE.md). A two-up pair keeps the same total width, so each face lands
# near 590px — ample for a card that displays at a few hundred.
TARGET_WIDTH = 1200
JPEG_QUALITY = 88  # a touch above the repo's 82: faces show banding first
GUTTER_PX = 16  # white rule between the two halves, applied uniformly

# Below this margin the age vote is too close to trust. Such a pair is
# reported and passed through in its ORIGINAL order rather than swapped on a
# coin flip — a wrong swap is a factual error about a person.
CONFIDENCE_FLOOR = 0.14

SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


# ---------------------------------------------------------------- measuring


def _colorfulness(img: Image.Image) -> float:
    """Hasler-Süsstrunk colourfulness, normalized to roughly 0..1.

    Chosen over mean saturation because it is not fooled by a uniform sepia
    wash: a toned print is *tinted*, not colourful, and this metric says so
    while mean saturation reports a healthy number.
    """
    small = img.convert("RGB").resize((160, 160), Image.Resampling.BILINEAR)
    px_r, px_g, px_b = [c.tobytes() for c in small.split()]
    # The metric's two opponent-colour axes: rg = R - G, yb = 0.5(R + G) - B.
    rg_vals = [px_r[i] - px_g[i] for i in range(len(px_r))]
    yb_vals = [0.5 * (px_r[i] + px_g[i]) - px_b[i] for i in range(len(px_r))]

    def mean_std(vals: list[float]) -> tuple[float, float]:
        n = len(vals)
        m = sum(vals) / n
        var = sum((v - m) ** 2 for v in vals) / n
        return m, math.sqrt(var)

    m_rg, s_rg = mean_std(rg_vals)
    m_yb, s_yb = mean_std(yb_vals)
    std_root = math.sqrt(s_rg**2 + s_yb**2)
    mean_root = math.sqrt(m_rg**2 + m_yb**2)
    return (std_root + 0.3 * mean_root) / 110.0


def _sharpness(img: Image.Image) -> float:
    """High-frequency energy, normalized for size.

    An old print that has been scanned and re-JPEGed has had its fine detail
    filtered away twice over; a phone photo has not. Measured on a fixed-size
    copy so a physically larger source does not score as a sharper one.
    """
    gray = img.convert("L").resize((256, 256), Image.Resampling.BILINEAR)
    edges = gray.filter(ImageFilter.FIND_EDGES)
    return ImageStat.Stat(edges).stddev[0] / 64.0


def _warmth(img: Image.Image) -> float:
    """Mean (R - B), the sepia/fade signature. Positive is warm."""
    small = img.convert("RGB").resize((160, 160), Image.Resampling.BILINEAR)
    r, g, b = ImageStat.Stat(small).mean
    del g
    return (r - b) / 64.0


def _contrast(img: Image.Image) -> float:
    """Tonal spread. Faded prints are flat; recent digital photos are not."""
    return ImageStat.Stat(img.convert("L")).stddev[0] / 64.0


@dataclass
class HalfMetrics:
    colorfulness: float
    sharpness: float
    warmth: float
    contrast: float

    @classmethod
    def measure(cls, img: Image.Image) -> "HalfMetrics":
        return cls(
            colorfulness=_colorfulness(img),
            sharpness=_sharpness(img),
            warmth=_warmth(img),
            contrast=_contrast(img),
        )


@dataclass
class AgeVerdict:
    left_is_older: bool
    margin: float
    votes: list[str]

    @property
    def confident(self) -> bool:
        return self.margin >= CONFIDENCE_FLOOR


def judge_age(left: Image.Image, right: Image.Image) -> AgeVerdict:
    """Decide which half is the older photograph.

    Four independent signals, each voting on a RELATIVE comparison rather
    than an absolute threshold — what matters is which of these two is older,
    and the pair was shot decades apart, so the gap is wide even when the
    absolute numbers are unusual. Signals are weighted by how hard they are
    to fool:

      colourfulness  heaviest. A monochrome or toned print beside a colour
                     photo is close to decisive on its own.
      contrast       fade is the most common damage on an old print.
      sharpness      reliable unless the recent photo is itself a bad crop.
      warmth         lightest. Tungsten light and warm filters produce the
                     same signature on a modern photo, so it only breaks
                     near-ties.
    """
    lm, rm = HalfMetrics.measure(left), HalfMetrics.measure(right)
    signals = [
        ("colour", lm.colorfulness, rm.colorfulness, 0.40, True),
        ("contrast", lm.contrast, rm.contrast, 0.25, True),
        ("sharpness", lm.sharpness, rm.sharpness, 0.25, True),
        ("warmth", lm.warmth, rm.warmth, 0.10, False),
    ]
    score = 0.0
    votes: list[str] = []
    for name, lv, rv, weight, lower_is_older in signals:
        scale = max(abs(lv), abs(rv), 1e-6)
        delta = (rv - lv) / scale  # >0 means right scores higher
        contribution = weight * (delta if lower_is_older else -delta)
        score += contribution
        # A signal "votes left is older" when it pushes the score positive.
        if abs(contribution) > 0.01:
            votes.append(f"{name}:{'L' if contribution > 0 else 'R'}")
    return AgeVerdict(left_is_older=score > 0, margin=abs(score), votes=votes)


# ---------------------------------------------------------------- splitting


def _column_energy(gray: Image.Image, lo: int, hi: int) -> list[tuple[float, int]]:
    """Vertical detail per column in [lo, hi). A gutter column has almost none."""
    h = gray.size[1]
    strip = gray.crop((lo, 0, hi, h))
    px = strip.load()
    step = max(1, h // 200)
    out: list[tuple[float, int]] = []
    for x in range(strip.size[0]):
        total = 0.0
        count = 0
        for y in range(0, h - step, step):
            total += abs(px[x, y] - px[x, y + step])
            count += 1
        out.append((total / max(count, 1), x + lo))
    return out


def find_seam(img: Image.Image) -> int | None:
    """Locate the vertical join in a side-by-side pair.

    Looks for the column of lowest detail nearest the middle — the gutter
    between two photos is flat, whether it is white paper, a black rule, or
    a hard edge between two images. Searching only the central third keeps a
    plain background at the outside of the frame from winning.

    Returns None when the image is not plausibly a pair (too tall for its
    width, or no flat column stands out), which is the signal to treat the
    file as a single portrait rather than butcher it.
    """
    w, h = img.size
    if w < h * 1.15:  # a pair is meaningfully wider than it is tall
        return None

    gray = img.convert("L")
    lo, hi = int(w * 0.34), int(w * 0.66)
    energies = _column_energy(gray, lo, hi)

    best_energy, best_x = min(energies, key=lambda t: t[0])
    median_energy = sorted(e for e, _ in energies)[len(energies) // 2]
    # The flattest column must be clearly flatter than typical, or there is
    # no real gutter and this is one wide photograph.
    if median_energy > 1e-6 and best_energy > median_energy * 0.6:
        return None
    return best_x


def find_gutter(img: Image.Image, seam: int) -> tuple[int, int]:
    """Widen a seam column into the full band of gutter that surrounds it.

    Cutting at a single column is not enough, and the first render proved
    it: when the cut lands a few pixels off, a slice of the NEIGHBOURING
    photo survives on the inside edge. Converted to grayscale that slice
    became a dark strip, and the contrast stretch then drove it to solid
    black — a black bar down the edge of somebody's portrait.

    So grow outward from the seam for as long as columns stay flat, and cut
    at the outside of that whole band. Whatever the divider is made of —
    white paper, a black rule, or the hard join between two photos — it
    leaves with the cut.
    """
    w, h = img.size
    gray = img.convert("L")
    span = max(6, int(w * 0.05))
    lo, hi = max(0, seam - span), min(w, seam + span + 1)
    energies = dict((x, e) for e, x in _column_energy(gray, lo, hi))
    flat_ceiling = max(energies.get(seam, 0.0) * 3.0, 1.5)

    start = end = seam
    while start - 1 >= lo and energies.get(start - 1, 1e9) <= flat_ceiling:
        start -= 1
    while end + 1 < hi and energies.get(end + 1, 1e9) <= flat_ceiling:
        end += 1
    # A hairline safety margin either side: a one-pixel bleed is invisible in
    # the source and glaring once contrast is stretched.
    margin = max(2, int(w * 0.004))
    return max(0, start - margin), min(w, end + 1 + margin)


def split_pair(img: Image.Image, seam: int) -> tuple[Image.Image, Image.Image]:
    """Cut either side of the gutter band so no foreign pixels survive."""
    w, h = img.size
    start, end = find_gutter(img, seam)
    left = img.crop((0, 0, max(1, start), h))
    right = img.crop((min(w - 1, end), 0, w, h))
    return left, right


# --------------------------------------------------------------- restoring


def to_monochrome(img: Image.Image) -> Image.Image:
    """Convert to grayscale with a portrait-friendly channel mix.

    Not Pillow's default luma. Rec.709 weights green heavily, and on a noisy
    scan green carries the sensor/scanner noise while red carries the
    smoothest rendition of skin — the same reason black-and-white portrait
    photographers reach for a red or orange filter. Leaning toward red
    softens blemishes and grain in faces at no cost to structure. Blue is
    kept low: it is the noisiest channel and the least flattering.
    """
    rgb = img.convert("RGB")
    px_r, px_g, px_b = [c.tobytes() for c in rgb.split()]
    mixed = bytes(
        min(255, int(0.45 * px_r[i] + 0.42 * px_g[i] + 0.13 * px_b[i]))
        for i in range(len(px_r))
    )
    return Image.frombytes("L", rgb.size, mixed)


def restore(img: Image.Image, target_width: int) -> Image.Image:
    """Denoise, downsize, re-level, sharpen — in that order, all of it mild.

    NEVER upscales. Enlarging a poor scan is the exact inverse of what is
    wanted: it magnifies the grain and blocking, costs bytes, and adds no
    detail. A source narrower than the target is simply cleaned at its own
    size, so the worst originals stay small and honest.
    """
    target_width = min(target_width, img.size[0])
    work = to_monochrome(img)

    # Denoise BEFORE the downsize, but only as much as the source needs.
    # Keying this off the size ratio alone was wrong: a small, heavily
    # grained scan got no denoise at all, and the contrast stretch below then
    # amplified every speck. Measure the grain instead.
    #
    # A 3x3 median blurred by 1px, differenced against the original, isolates
    # single-pixel-scale energy — which on a scanned print is grain and JPEG
    # noise rather than detail, because real detail survives a 1px blur.
    probe = work.resize((200, 200), Image.Resampling.BILINEAR)
    grain = ImageStat.Stat(
        ImageChops.difference(probe, probe.filter(ImageFilter.MedianFilter(size=3)))
    ).mean[0]
    if grain > 4.0:
        # Heavy scanner grain. One 3x3 median leaves plenty behind — the first
        # render showed the survivors getting *amplified* by the stretch below,
        # so the old half came out noisier than it went in. Two passes plus a
        # half-pixel blur takes it down without touching facial structure,
        # which lives at a coarser scale than single-pixel speckle.
        work = work.filter(ImageFilter.MedianFilter(size=3))
        work = work.filter(ImageFilter.MedianFilter(size=3))
        work = work.filter(ImageFilter.GaussianBlur(radius=0.5))
    elif grain > 1.2 or work.size[0] > target_width * 1.6:
        work = work.filter(ImageFilter.MedianFilter(size=3))

    if work.size[0] != target_width:
        ratio = target_width / work.size[0]
        new_size = (target_width, max(1, round(work.size[1] * ratio)))
        # Lanczos: the best-detail-per-artifact resampler Pillow offers, and
        # the averaging is what actually removes the grain and blocking.
        work = work.resize(new_size, Image.Resampling.LANCZOS)

    # Clipped percentile stretch, applied at PARTIAL strength.
    #
    # Full autocontrast was too violent on these: a faded portrait is mostly
    # light midtones, so stretching to the full range drove faces to blank
    # white and lost the modelling that makes a face read as a face. Blending
    # 70% of the stretch against the original recovers the contrast a fade
    # cost without inventing a harshness the print never had. cutoff=(0.5,
    # 0.5) keeps one dust speck or blown highlight from setting either end.
    stretched = ImageOps.autocontrast(work, cutoff=(0.5, 0.5))
    work = Image.blend(work, stretched, 0.70)

    # Unsharp last. radius 1.4 / 55% is a restrained "restore what the
    # resample softened" setting, not a sharpening effect; threshold 3 leaves
    # flat areas (skin, sky, paper) untouched so residual grain stays down.
    work = work.filter(ImageFilter.UnsharpMask(radius=1.4, percent=55, threshold=3))
    return work


def compose_pair(left: Image.Image, right: Image.Image, total_width: int) -> Image.Image:
    """Rebuild the two-up at a uniform height with a clean gutter.

    Both halves are set to the SAME width — the narrower of the two, capped
    at half the target — so neither is upscaled and the pair reads as one
    object rather than a big photo next to a small one. The published width
    therefore floats down to whatever the weaker source can honestly carry.
    """
    half_w = min((total_width - GUTTER_PX) // 2, left.size[0], right.size[0])

    def fit(im: Image.Image) -> Image.Image:
        ratio = half_w / im.size[0]
        return im.resize((half_w, max(1, round(im.size[1] * ratio))), Image.Resampling.LANCZOS)

    l_fit, r_fit = fit(left), fit(right)
    # Crop both to the SHORTER height rather than padding the shorter one.
    # Padding left white bands above and below one face while the other ran
    # full-bleed, which looked like a layout bug. Trimming from the top and
    # bottom equally keeps each face centred and gives a flush two-up.
    height = min(l_fit.size[1], r_fit.size[1])

    def crop_center(im: Image.Image) -> Image.Image:
        top = (im.size[1] - height) // 2
        return im.crop((0, top, im.size[0], top + height))

    l_fit, r_fit = crop_center(l_fit), crop_center(r_fit)
    width = half_w * 2 + GUTTER_PX
    canvas = Image.new("L", (width, height), 255)
    canvas.paste(l_fit, (0, 0))
    canvas.paste(r_fit, (half_w + GUTTER_PX, 0))
    return canvas


def save(img: Image.Image, dest: Path) -> None:
    """Write a stripped, progressive JPEG. `save` writes no EXIF unless asked."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "JPEG", quality=JPEG_QUALITY, optimize=True, progressive=True)


# -------------------------------------------------------------------- main


@dataclass
class Result:
    src: Path
    dest: Path
    paired: bool
    swapped: bool
    verdict: AgeVerdict | None
    size: tuple[int, int]


def process_one(src: Path, out_dir: Path, *, pair: bool, write: bool) -> Result:
    with Image.open(src) as raw:
        raw = ImageOps.exif_transpose(raw)  # honour rotation before stripping it
        raw.load()
        seam = find_seam(raw) if pair else None

        if seam is None:
            final = restore(raw, TARGET_WIDTH)
            verdict, swapped, paired = None, False, False
        else:
            left, right = split_pair(raw, seam)
            verdict = judge_age(left, right)
            # Swap only on a confident verdict that the order is wrong.
            swapped = verdict.confident and not verdict.left_is_older
            if swapped:
                left, right = right, left
            half_target = (TARGET_WIDTH - GUTTER_PX) // 2
            final = compose_pair(
                restore(left, half_target), restore(right, half_target), TARGET_WIDTH
            )
            paired = True

    # Namespaced `hof-` rather than the repo's `<b|g|c><sport>-<descriptor>`
    # convention (CLAUDE.md). That convention encodes a sport and a gender,
    # and an inductee portrait has neither to encode — a coach inducted as a
    # contributor would have to be filed under a sport they never played. A
    # distinct prefix also keeps these out of the way of `photo-usage`'s
    # duplicate detection, which is tuned for action shots.
    slug = re.sub(r"[^a-z0-9]+", "-", src.stem.lower()).strip("-")
    slug = re.sub(r"^hof-", "", slug)
    dest = out_dir / f"hof-{slug}.jpg"
    if write:
        save(final, dest)
    return Result(src, dest, paired, swapped, verdict, final.size)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--process", action="store_true", help="write output (default: audit only)")
    ap.add_argument("--no-pair", action="store_true", help="treat every input as a single portrait")
    ap.add_argument("--in", dest="in_dir", default=str(INBOX), help="source directory")
    ap.add_argument("--out", dest="out_dir", default=str(OUT_DIR), help="destination directory")
    args = ap.parse_args()

    in_dir, out_dir = Path(args.in_dir), Path(args.out_dir)
    if not in_dir.is_dir():
        sys.exit(f"No such directory: {in_dir}")

    sources = sorted(
        p for p in in_dir.iterdir() if p.suffix.lower() in SUFFIXES and p.is_file()
    )
    if not sources:
        print(f"No images in {in_dir}/ — drop the scraped portraits there first.")
        return 0

    print(f"{'WRITING' if args.process else 'AUDIT (no files written)'} — {len(sources)} image(s)\n")
    needs_eyes: list[Result] = []
    for src in sources:
        r = process_one(src, out_dir, pair=not args.no_pair, write=args.process)
        if not r.paired:
            print(f"  {src.name}\n      single portrait -> {r.size[0]}x{r.size[1]}")
        else:
            order = "SWAPPED to older-left" if r.swapped else "already older-left"
            v = r.verdict
            assert v is not None
            if not v.confident:
                order = "TOO CLOSE TO CALL - left as-is"
                needs_eyes.append(r)
            print(
                f"  {src.name}\n"
                f"      pair -> {r.size[0]}x{r.size[1]}  |  {order}\n"
                f"      margin {v.margin:.2f} (floor {CONFIDENCE_FLOOR})  votes {' '.join(v.votes)}"
            )
        if args.process:
            # `--out` may point outside the repo (it does in the test run), so
            # relative_to(REPO_ROOT) is not safe here.
            try:
                shown = r.dest.resolve().relative_to(REPO_ROOT)
            except ValueError:
                shown = r.dest
            print(f"      wrote {shown}")

    if needs_eyes:
        print(
            f"\n{len(needs_eyes)} pair(s) were too close to call and were NOT reordered.\n"
            "Open these and check by eye — a wrong swap misstates which photo is which:"
        )
        for r in needs_eyes:
            print(f"  - {r.src.name}")

    if not args.process:
        print("\nRe-run with --process to write the results into public/photos/.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
