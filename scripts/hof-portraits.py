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
  GOLD       The school burns each inductee's name into the photo in gold
             cursive. That lettering is KEPT IN COLOUR over the monochrome
             portrait — the board's call, and it suits a page whose accent
             colour is already gold. The mask that finds it has to be tight,
             because a sepia print sits in the same hue band: what separates
             them is saturation, since toning is a wash and lettering is
             pigment.
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
    python3 scripts/hof-portraits.py --process --no-gold   # grayscale the gold lettering too

    # two SEPARATE files whose order you already know (the committee's deck):
    python3 scripts/hof-portraits.py --compose OLD.png NOW.png --name meaney --process
    # one photo, for an inductee with no current picture — sidebarred to match:
    python3 scripts/hof-portraits.py --single PHOTO.jpg --name durant --process

EVERY OUTPUT IS THE SAME SIZE (816x520), because a wall of cards that each
took their proportions from their own two originals read as a scrapbook
rather than a set. See `fit_to_box`.

Requires Pillow (`pip install pillow`). OpenCV is OPTIONAL and worth having:
`pip install opencv-python-headless` enables the face pass that decides where
each photograph is cropped. Without it the framing falls back to a centred
crop — worse, but never wrong. Deliberately not ImageMagick: the per-half
analysis below needs pixel access, and a shell pipeline of that shape would
be far harder to read than it is to write.
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

# EVERY CARD IS THE SAME SHAPE (#230). Sizing each pair from its own two
# originals is what made the class row look like a scrapbook: no two cards
# agreed on proportion, and a face could land twice the size of the face
# beside it. So the frame is fixed and the photographs are fitted into it.
#
# 400x520 per half is chosen against the DISPLAY, not against the sources. A
# card is about 340 CSS px wide, so a half shows at ~162 px — 324 device px
# on a 2x screen. 400 clears that with room to spare, and asking for more
# would only mean upscaling small originals further for pixels nobody sees.
HALF_W, HALF_H = 400, 520
PAIR_W = HALF_W * 2 + GUTTER_PX  # 816
PAIR_H = HALF_H

# How much of the frame's height a face should occupy. Portrait convention,
# and the second half of what "normalize" means here: matching the frames
# without matching the subjects inside them still reads as a scrapbook.
FACE_TARGET_SHARE = 0.26
# Eyes about two fifths down rather than dead centre — the standard portrait
# placement, and it leaves headroom instead of a haircut.
FACE_VERTICAL_ANCHOR = 0.40
# How far the FRAME may enlarge a weak source to fill its half. Generous on
# purpose. The instinct is to cap this hard and pad the leftovers, and that
# instinct is wrong here: the card shows a half at ~162 CSS px, so a 105px
# original is being enlarged past 3x by the BROWSER no matter what this
# script writes. Padding therefore buys no sharpness at all and costs the
# uniformity that is the whole point — one inset half beside one full-bleed
# half is exactly the scrapbook look.
MAX_UPSCALE = 4.0
# How far the face-zoom may tighten in. Separate from the fill cap, and
# tighter: filling a frame from a weak source is forced, but cropping further
# INTO one is a choice, and there is no reason to make a bad original worse.
MAX_ZOOM = 2.6

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


# The burned-in inductee names are gold cursive. Kept in colour against an
# otherwise monochrome portrait (Erik's call), which suits a page whose accent
# colour is already gold.
#
# THE TRAP, AND IT IS THE WHOLE REASON THESE THRESHOLDS ARE TIGHT: a sepia
# print occupies the SAME HUE BAND as gold. Masking on hue alone would keep
# the entire vintage half in colour and defeat the conversion. What separates
# them is saturation — toning is a wash (typically S < 0.3), lettering is
# pigment (S > 0.45) — so the mask demands high saturation as well as hue, and
# a value floor keeps dark warm shadows out.
GOLD_HUE_DEG = (30, 68)
GOLD_SAT_MIN = 0.45
GOLD_VAL_MIN = 0.35


def gold_mask(rgb: Image.Image) -> Image.Image:
    """Mask of pixels that read as gold lettering rather than warm photo."""
    h, s, v = rgb.convert("HSV").split()
    lo = int(GOLD_HUE_DEG[0] / 360 * 255)
    hi = int(GOLD_HUE_DEG[1] / 360 * 255)
    in_hue = h.point(lambda p: 255 if lo <= p <= hi else 0)
    in_sat = s.point(lambda p: 255 if p >= GOLD_SAT_MIN * 255 else 0)
    in_val = v.point(lambda p: 255 if p >= GOLD_VAL_MIN * 255 else 0)
    mask = ImageChops.multiply(ImageChops.multiply(in_hue, in_sat), in_val)

    # OPEN BEFORE DILATING — erode, then grow back. Dilating the raw mask
    # sprayed orange specks around the edge of a face: skin sits just outside
    # the gold band, but its anti-aliased and JPEG-ringed boundary pixels
    # stray inside it, and growing the mask turned each stray pixel into a
    # visible dot. An erosion deletes anything thinner than the kernel, which
    # is every one of those specks, while a letter stroke — continuous and
    # several pixels wide — survives and is restored by the dilation after it.
    mask = mask.filter(ImageFilter.MinFilter(size=3))
    mask = mask.filter(ImageFilter.MaxFilter(size=3))

    # Then grow a hair and feather, so anti-aliased stroke edges are not cut
    # off mid-letter.
    mask = mask.filter(ImageFilter.MaxFilter(size=3))
    return mask.filter(ImageFilter.GaussianBlur(radius=0.6))


def keep_gold_over(mono: Image.Image, colour: Image.Image) -> Image.Image:
    """Composite the gold lettering back over the monochrome portrait."""
    colour = colour.convert("RGB").resize(mono.size, Image.Resampling.LANCZOS)
    return Image.composite(colour, mono.convert("RGB"), gold_mask(colour))


def restore(img: Image.Image, target_width: int, *, keep_gold: bool = True) -> Image.Image:
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
    if keep_gold:
        # Composited last, from the ORIGINAL colour pixels, so the lettering
        # never picks up the denoise, the level stretch or the sharpening
        # applied to the photograph underneath it.
        return keep_gold_over(work, img)
    return work


_CASCADES: list | None = None


def _cascades():
    """Haar cascades, loaded once. Optional: no OpenCV means no face pass.

    The fit below degrades to a centred crop with a top bias without them,
    which is a worse frame but never a wrong one — so a missing dependency
    costs quality, not correctness.
    """
    global _CASCADES
    if _CASCADES is None:
        try:
            import cv2  # noqa: PLC0415 - optional, and only wanted if present

            d = cv2.data.haarcascades
            _CASCADES = [
                cv2.CascadeClassifier(d + n)
                for n in (
                    "haarcascade_frontalface_alt2.xml",
                    "haarcascade_frontalface_default.xml",
                    "haarcascade_profileface.xml",
                )
            ]
        except Exception:  # pragma: no cover - absence is a supported state
            _CASCADES = []
    return _CASCADES


def find_face(img: Image.Image) -> tuple[int, int, int, int] | None:
    """The largest face in the image, or None.

    Largest rather than first: these are portraits with one subject, and the
    other detections are teammates, spectators and the occasional false
    positive on a bit of background texture. Profiles are run on the mirror
    image too, because the cascade only knows one direction.
    """
    cascades = _cascades()
    if not cascades:
        return None
    try:
        import cv2  # noqa: PLC0415
        import numpy as np  # noqa: PLC0415
    except Exception:  # pragma: no cover
        return None

    # Haar wants pixels. Several of the deck's originals are barely 100px
    # wide, and the same face that is missed at native size is found reliably
    # on a 2x copy — so small sources get enlarged for the DETECTION only.
    # Nothing downstream sees the enlarged copy; only the box comes back.
    k = 2 if img.size[0] < 300 else 1
    probe = img.convert("RGB")
    if k > 1:
        probe = probe.resize((probe.size[0] * k, probe.size[1] * k), Image.Resampling.LANCZOS)

    gray = cv2.cvtColor(np.array(probe), cv2.COLOR_RGB2GRAY)
    gray = cv2.equalizeHist(gray)
    found: list[tuple[int, int, int, int]] = []
    for c in cascades:
        found += [tuple(map(int, r)) for r in c.detectMultiScale(gray, 1.05, 3, minSize=(20, 20))]
    mirrored = cv2.flip(gray, 1)
    for x, y, w, h in cascades[-1].detectMultiScale(mirrored, 1.05, 3, minSize=(20, 20)):
        found.append((int(gray.shape[1] - x - w), int(y), int(w), int(h)))

    # Back to source coordinates, then discard the implausible. Loosening the
    # cascade parameters above is what finds the faces in the small sources;
    # it also invites specks. A real portrait subject's face is a meaningful
    # fraction of the frame, and the 12px hits on somebody's shin are not —
    # rejecting them is what keeps the fallback (a centred crop) in play
    # instead of framing the picture around a shoe.
    iw = img.size[0]
    plausible = [
        (x // k, y // k, w // k, h // k)
        for (x, y, w, h) in found
        if 0.10 * iw * k <= w <= 0.85 * iw * k
    ]
    return max(plausible, key=lambda r: r[2] * r[3]) if plausible else None


def fit_to_box(img: Image.Image, box_w: int, box_h: int) -> Image.Image:
    """Frame one photograph into a fixed box, around its subject's face.

    THIS REPLACES the crop-or-pad rule of #226, and it is worth saying why,
    because #226 was right about the danger it named. Cropping two halves to
    a common height decapitated people when the halves' proportions differed
    wildly, and the fix then was to stop cropping and pad instead. That is
    safe and it is ugly: every card ended up a different shape, and the class
    row read as a scrapbook.

    The real problem was never the crop — it was cropping BLIND. A crop that
    knows where the face is can be tight and safe at the same time, so:

      * the crop window is the target aspect, sized so the face fills about
        `FACE_TARGET_SHARE` of the height — which normalizes the SUBJECTS,
        not just the frames;
      * it is placed with the face centred horizontally and its centre
        `FACE_VERTICAL_ANCHOR` down, the ordinary portrait placement;
      * it is then pushed back inside the image, and widened if it would
        clip the detected face at all. The face is a hard constraint: the
        window grows or slides, never cuts.

    With no face found it falls back to the largest centred crop with a top
    bias, since a head is nearly always in the upper half of a photograph.

    It WILL enlarge a small source, which the restore path deliberately never
    does — uniform frames are not obtainable otherwise. Past `MAX_UPSCALE` it
    gives up and pads: a blurred smear is worse than a smaller picture.
    """
    iw, ih = img.size
    aspect = box_w / box_h
    face = find_face(img)

    if face:
        fx, fy, fw, fh = face
        want_h = fh / FACE_TARGET_SHARE
        want_w = want_h * aspect
        # Never ask for more than the image has, and keep the aspect exact.
        scale = min(1.0, iw / want_w, ih / want_h)
        crop_w, crop_h = want_w * scale, want_h * scale
        # Nor ask for so little that the fit has to enlarge past the cap.
        floor_w = min(iw, box_w / MAX_ZOOM)
        if crop_w < floor_w:
            grow = min(floor_w / crop_w, iw / crop_w, ih / crop_h)
            crop_w, crop_h = crop_w * grow, crop_h * grow
        cx = fx + fw / 2
        cy = fy + fh / 2
        left = cx - crop_w / 2
        top = cy - crop_h * FACE_VERTICAL_ANCHOR
        # The face is a hard constraint, so widen before sliding: a window
        # that cannot contain it at this size is the wrong size.
        need = max(
            (fx + fw) - (left + crop_w), left - fx,
            (fy + fh) - (top + crop_h), top - fy,
        )
        if need > 0:
            grow = min((crop_w + 2 * need) / crop_w, iw / crop_w, ih / crop_h)
            crop_w, crop_h = crop_w * grow, crop_h * grow
            left, top = cx - crop_w / 2, cy - crop_h * FACE_VERTICAL_ANCHOR
        left = max(0.0, min(left, iw - crop_w))
        top = max(0.0, min(top, ih - crop_h))
    else:
        scale = min(iw / aspect, ih) if (iw / ih) > aspect else min(iw, ih * aspect)
        crop_w = min(iw, ih * aspect)
        crop_h = min(ih, iw / aspect)
        left = (iw - crop_w) / 2
        top = (ih - crop_h) * 0.38  # heads sit above centre

    cut = img.crop((round(left), round(top), round(left + crop_w), round(top + crop_h)))

    # Cap the enlargement, then letterbox whatever is left over.
    upscale = box_w / cut.size[0]
    if upscale > MAX_UPSCALE:
        w = max(1, round(cut.size[0] * MAX_UPSCALE))
        h = max(1, round(cut.size[1] * MAX_UPSCALE))
    else:
        w, h = box_w, box_h
    cut = cut.resize((w, h), Image.Resampling.LANCZOS)
    if (w, h) == (box_w, box_h):
        return cut
    fill = (255, 255, 255) if cut.mode == "RGB" else 255
    canvas = Image.new(cut.mode, (box_w, box_h), fill)
    canvas.paste(cut, ((box_w - w) // 2, (box_h - h) // 2))
    return canvas


def prepare_half(img: Image.Image, *, keep_gold: bool = True) -> Image.Image:
    """Frame one photograph, then restore it — in that order, deliberately.

    The crop happens at the SOURCE's full resolution, so the framing decision
    is made with every pixel the original has, and the single resample down
    to the half box does the noise averaging that `restore` would otherwise
    do itself. Restoring first would mean cropping an image that had already
    been thrown away down to 400px wide.
    """
    return restore(fit_to_box(img, HALF_W, HALF_H), HALF_W, keep_gold=keep_gold)


def compose_pair(left: Image.Image, right: Image.Image, total_width: int = PAIR_W) -> Image.Image:
    """Two prepared halves, side by side, with the gutter between."""
    l_fit = left if left.size == (HALF_W, HALF_H) else fit_to_box(left, HALF_W, HALF_H)
    r_fit = right if right.size == (HALF_W, HALF_H) else fit_to_box(right, HALF_W, HALF_H)
    mode = "RGB" if "RGB" in (l_fit.mode, r_fit.mode) else "L"
    fill = (255, 255, 255) if mode == "RGB" else 255
    canvas = Image.new(mode, (PAIR_W, PAIR_H), fill)
    canvas.paste(l_fit.convert(mode), (0, 0))
    canvas.paste(r_fit.convert(mode), (HALF_W + GUTTER_PX, 0))
    return canvas


def compose_single(img: Image.Image) -> Image.Image:
    """One photograph on the same canvas as a pair, with sidebars.

    For the inductee who has no current photo. Framing it to one HALF and
    centring it — rather than letting it span the full width — is the point:
    his face then lands at the same size as everybody else's, and his card is
    the same shape as its neighbours. Stretching the single photo across the
    whole frame would match the outline while doubling the face.
    """
    fitted = img if img.size == (HALF_W, HALF_H) else fit_to_box(img, HALF_W, HALF_H)
    mode = fitted.mode if fitted.mode in ("RGB", "L") else "RGB"
    fill = (255, 255, 255) if mode == "RGB" else 255
    canvas = Image.new(mode, (PAIR_W, PAIR_H), fill)
    canvas.paste(fitted.convert(mode), ((PAIR_W - HALF_W) // 2, 0))
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


def process_one(
    src: Path, out_dir: Path, *, pair: bool, write: bool, keep_gold: bool = True
) -> Result:
    with Image.open(src) as raw:
        raw = ImageOps.exif_transpose(raw)  # honour rotation before stripping it
        raw.load()
        seam = find_seam(raw) if pair else None

        if seam is None:
            final = compose_single(prepare_half(raw, keep_gold=keep_gold))
            verdict, swapped, paired = None, False, False
        else:
            left, right = split_pair(raw, seam)
            verdict = judge_age(left, right)
            # Swap only on a confident verdict that the order is wrong.
            swapped = verdict.confident and not verdict.left_is_older
            if swapped:
                left, right = right, left
            final = compose_pair(
                prepare_half(left, keep_gold=keep_gold),
                prepare_half(right, keep_gold=keep_gold),
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
    ap.add_argument(
        "--no-gold",
        action="store_true",
        help="convert the burned-in gold lettering to grayscale along with the photo",
    )
    ap.add_argument(
        "--compose",
        nargs=2,
        metavar=("OLDER", "CURRENT"),
        help=(
            "compose two SEPARATE files into one pair, older first. For sources "
            "that never were a composite — the committee's slide deck holds each "
            "photo as its own image — where the order is known rather than "
            "guessed, so the age vote is skipped entirely."
        ),
    )
    ap.add_argument(
        "--single",
        metavar="PHOTO",
        help=(
            "frame ONE photo onto the same canvas a pair gets, centred with "
            "sidebars. For an inductee with no current photo: the card then "
            "matches its neighbours in shape AND in how big the face reads, "
            "which spanning the single photo across the full width would not."
        ),
    )
    ap.add_argument(
        "--name", help="output slug for --compose / --single (written as hof-<name>.jpg)"
    )
    ap.add_argument("--in", dest="in_dir", default=str(INBOX), help="source directory")
    ap.add_argument("--out", dest="out_dir", default=str(OUT_DIR), help="destination directory")
    args = ap.parse_args()

    out_dir = Path(args.out_dir)

    if args.single:
        if not args.name:
            sys.exit("--single requires --name")
        src = Path(args.single)
        if not src.is_file():
            sys.exit(f"No such file: {src}")
        with Image.open(src) as im:
            im = ImageOps.exif_transpose(im)
            im.load()
            final = compose_single(prepare_half(im, keep_gold=not args.no_gold))
        dest = out_dir / f"hof-{args.name}.jpg"
        print(f"{src.name}  ->  {final.size[0]}x{final.size[1]}  (single, sidebarred)")
        if args.process:
            save(final, dest)
            print(f"  wrote {dest}")
        else:
            print("  (audit only — re-run with --process to write)")
        return 0

    if args.compose:
        # Explicit pairing. The caller states which half is older, so nothing is
        # inferred: judge_age exists for composites whose order is unknown, and
        # using it here would be second-guessing a fact already in hand.
        if not args.name:
            sys.exit("--compose requires --name")
        older_p, current_p = (Path(x) for x in args.compose)
        for q in (older_p, current_p):
            if not q.is_file():
                sys.exit(f"No such file: {q}")
        with Image.open(older_p) as a, Image.open(current_p) as b:
            a, b = ImageOps.exif_transpose(a), ImageOps.exif_transpose(b)
            a.load(); b.load()
            final = compose_pair(
                prepare_half(a, keep_gold=not args.no_gold),
                prepare_half(b, keep_gold=not args.no_gold),
            )
        dest = out_dir / f"hof-{args.name}.jpg"
        print(f"{older_p.name}  +  {current_p.name}  ->  {final.size[0]}x{final.size[1]}")
        if args.process:
            save(final, dest)
            print(f"  wrote {dest}")
        else:
            print("  (audit only — re-run with --process to write)")
        return 0

    in_dir = Path(args.in_dir)
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
        r = process_one(
            src,
            out_dir,
            pair=not args.no_pair,
            write=args.process,
            keep_gold=not args.no_gold,
        )
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
