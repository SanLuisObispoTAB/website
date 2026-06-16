#!/usr/bin/env node
// Photo intake helper for the SLOTAB photo library.
//
// Audits images dropped into `photo-inbox/` (a gitignored staging folder at
// the repo root) and — with --process — resizes the conformant ones into
// `public/photos/` using the house convention (1200px wide / 82% JPEG /
// metadata stripped).
//
// WHY THIS EXISTS: photos used to be dropped straight into `public/photos/`,
// which is the served + tracked directory. Misnamed multi-MB raws piled up
// there and a few nearly got deployed (see decisions #74–#76). Routing drops
// through a gitignored inbox keeps raws out of the served tree until they've
// been checked for duplicates and convention-correct names.
//
// USAGE
//   node scripts/photo-intake.mjs                 # audit only (default)
//   node scripts/photo-intake.mjs --rename        # interactively rename the misnamed drops to
//                                                 # the convention (suggests sport + gender), then audit
//   node scripts/photo-intake.mjs --process       # resize conformant drops into public/photos
//   node scripts/photo-intake.mjs --process --keep-originals
//                                                 # also archive each full-res source to
//                                                 # public/photos/originals/<stem>-original.<ext>
//   node scripts/photo-intake.mjs --process --force
//                                                 # allow overwriting an existing public/photos file
//                                                 # of the SAME name but different content
//
// CONVENTION (see CLAUDE.md): <b|g|c><sport>-<descriptor>.<jpg|png>
//   b/g/c = boys / girls / co-ed. Lowercase, except established sport tokens
//   like `XC`. Examples: gvball-ahopple.jpg, bXC-team-2025.jpg, ctrack-2.jpg.
//
// Requires ImageMagick (`magick`) on PATH — already the repo's standard for
// photo work (CLAUDE.md documents the resize incantation).

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import * as readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const INBOX = path.join(REPO_ROOT, "photo-inbox");
const PHOTOS = path.join(REPO_ROOT, "public/photos");
const ORIGINALS = path.join(PHOTOS, "originals");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png"]);
const TARGET_WIDTH = 1200;
const JPEG_QUALITY = 82;

const args = new Set(process.argv.slice(2));
const DO_PROCESS = args.has("--process");
const KEEP_ORIGINALS = args.has("--keep-originals");
const FORCE = args.has("--force");
const RENAME = args.has("--rename");

// ── tiny ANSI helpers (no deps) ───────────────────────────────────────────
const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function fail(msg) {
  console.error(c.red(`✗ ${msg}`));
  process.exit(1);
}

function haveMagick() {
  try {
    execFileSync("magick", ["-version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

function md5(file) {
  return crypto.createHash("md5").update(fs.readFileSync(file)).digest("hex");
}

function dimsOf(file) {
  try {
    // stdin: "ignore" so the child never consumes our stdin (the --rename
    // prompt reads from it; an inherited stdin would eat the user's answers).
    const out = execFileSync("magick", ["identify", "-format", "%wx%h", file], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.trim();
  } catch {
    return "?";
  }
}

function human(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}K`;
  return `${(bytes / 1024 / 1024).toFixed(1)}M`;
}

// Recursively list image files under a dir (skips the originals/ archive's
// gitignored raw-dump subfolders, which are large and irrelevant here).
function listImages(dir, { recurse = true } = {}) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recurse && !entry.name.startsWith("SLOHS Sports Photographs-part-")) {
        out.push(...listImages(full, { recurse }));
      }
      continue;
    }
    if (IMAGE_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

// Structural convention check. Returns an array of human-readable problems
// (empty = conformant). Deliberately loose on sport tokens (new sports get
// added) but strict on the structural shape.
function nameProblems(filename) {
  const problems = [];
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  if (/\s/.test(filename)) problems.push("has spaces");
  // .jpeg is fine — it's normalized to .jpg on output, so don't block on it.

  // <b|g|c> prefix, a sport token, a hyphen, then a descriptor.
  if (!/^[bgc][A-Za-z0-9]*-[A-Za-z0-9][A-Za-z0-9-]*$/.test(base)) {
    problems.push("expected <b|g|c><sport>-<descriptor>");
  } else if (!/^[bgc]/.test(base)) {
    problems.push("must start with b, g, or c (boys/girls/co-ed)");
  }
  return problems;
}

// ── name suggestion (for --rename) ─────────────────────────────────────────
// Keyword → sport-token rules, most-specific first. Tokens match the house
// convention documented in CLAUDE.md (bfball, gvball, bbball, bbaseball, …).
const SPORT_RULES = [
  [/beach.?v|\bbvb\b/i, "bvball"], // beach volleyball → gbvball
  [/flag/i, "flag"],
  [/field.?hockey|\bfh\b/i, "fieldhockey"],
  [/lacrosse|\blax\b/i, "lacrosse"],
  [/wrestl/i, "wrestling"],
  [/comp(etitive)?.?cheer/i, "compcheer"],
  [/cheer/i, "cheer"],
  [/stunt/i, "stunt"],
  [/tennis|\b[bg]ten\b/i, "tennis"],
  [/cross.?country|\bxc\b/i, "XC"],
  [/track/i, "track"],
  [/swim|div(e|ing)/i, "swim"],
  [/water.?polo|\bwpolo\b/i, "wpolo"],
  [/soccer/i, "soccer"],
  [/softball/i, "sball"],
  [/baseball/i, "bbaseball"],
  [/basket|\bbball\b/i, "bball"],
  [/volley|\bv-?ball\b|\b[bg]v\b/i, "vball"],
  [/foot.?ball/i, "fball"],
];

// Sports with an inherent/established prefix (single-gender or co-ed) so we can
// fill it in without asking. Everything else needs an explicit boys/girls hint.
const FIXED_PREFIX = {
  track: "c",
  stunt: "c",
  cheer: "c",
  compcheer: "c",
  flag: "g",
  fieldhockey: "g",
  sball: "g",
  bvball: "g",
};

function detectSport(name) {
  for (const [re, token] of SPORT_RULES) if (re.test(name)) return token;
  return null;
}

function detectGender(name) {
  if (/\bgirls?\b|\bwomen|\bgv\b|\bgten\b|\bgw\b/i.test(name)) return "g";
  if (/\bboys?\b|\bmen\b|\bmens\b|\bbv\b|\bbten\b|\bbw\b/i.test(name)) return "b";
  return null;
}

// Best-effort descriptor: strip the filename of dates, sequence/camera codes,
// gender + sport words, and boilerplate, then slugify what's left. Often comes
// back empty — that's fine, the user fills it in.
function slugifyDescriptor(name) {
  return path
    .basename(name, path.extname(name))
    .replace(/\b\d{4}-\d{2}-\d{2}\b/g, " ") // ISO dates
    .replace(/\b\d{5,}\b/g, " ") // long sequence/camera codes
    .replace(/[_#]/g, " ")
    .replace(
      /\b(slohs|slo|hs|high|school|varsity|jv|frosh|team|edited?|copy|final|photo|pic|picture|image|girls?|boys?|womens?|mens?|co-?ed)\b/gi,
      " ",
    )
    .replace(
      /\b(foot|basket|base|soft|volley|beach|water|polo|wpolo|wrestl\w*|tennis|soccer|swim\w*|div\w*|golf|track|cross|country|xc|cheer\w*|comp|stunt|dance|lacrosse|lax|field|hockey|flag|ball)\b/gi,
      " ",
    )
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

// Returns { prefix, sport, descriptor, suggestion } — suggestion is "" when we
// can't determine prefix+sport (user must type the whole thing).
function suggestName(name) {
  const sport = detectSport(name);
  let prefix = detectGender(name);
  if (!prefix && sport) prefix = FIXED_PREFIX[sport] ?? null;
  const descriptor = slugifyDescriptor(name);
  const suggestion = prefix && sport ? `${prefix}${sport}-${descriptor || ""}` : "";
  return { prefix, sport, descriptor, suggestion };
}

// Normalize an inbox filename to its published name (.jpeg → .jpg).
function publishedName(filename) {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  const normExt = ext.toLowerCase() === ".jpeg" ? ".jpg" : ext.toLowerCase();
  return `${base}${normExt}`;
}

function resizeInto(src, dest) {
  const isJpeg = /\.jpe?g$/i.test(dest);
  const argv = [src, "-resize", `${TARGET_WIDTH}x>`];
  if (isJpeg) argv.push("-quality", String(JPEG_QUALITY));
  argv.push("-strip", dest);
  execFileSync("magick", argv, { stdio: ["ignore", "ignore", "inherit"] });
}

// ── main ──────────────────────────────────────────────────────────────────
if (!haveMagick()) {
  fail("ImageMagick `magick` not found on PATH. Install it (brew install imagemagick).");
}

if (!fs.existsSync(INBOX)) {
  fs.mkdirSync(INBOX, { recursive: true });
}

let drops = listImages(INBOX, { recurse: false });

if (drops.length === 0) {
  console.log(c.dim(`photo-inbox/ is empty — drop photos there, then re-run.`));
  console.log(c.dim(`  ${path.relative(process.cwd(), INBOX)}/`));
  process.exit(0);
}

// Build a content-hash index of everything already in public/photos (incl.
// originals/), so we can spot exact duplicates of files already in the repo.
const existing = listImages(PHOTOS, { recurse: true });
const hashIndex = new Map(); // md5 -> repo-relative path
for (const f of existing) {
  const h = md5(f);
  if (!hashIndex.has(h)) hashIndex.set(h, path.relative(REPO_ROOT, f));
}
const byName = new Map(); // basename -> abs path (top-level public/photos only)
for (const f of listImages(PHOTOS, { recurse: false })) {
  byName.set(path.basename(f), f);
}

// ── interactive rename (--rename) ───────────────────────────────────────────
// Walk the misnamed, non-duplicate drops; suggest a convention name inferred
// from the original filename; rename in place once the user confirms.
if (RENAME) {
  const candidates = drops
    .filter((f) => !hashIndex.has(md5(f)) && nameProblems(path.basename(f)).length > 0)
    .sort();
  if (candidates.length === 0) {
    console.log(c.dim("\nNothing to rename — no misnamed (non-duplicate) drops.\n"));
  } else {
    console.log(
      c.bold(`\nRename ${candidates.length} misnamed drop(s)`) +
        c.dim("  — Enter accepts the suggestion · type a name to override · 's' skips\n"),
    );
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: Boolean(process.stdin.isTTY),
    });
    // Pull lines via the async iterator rather than rl.question(): question()
    // only resolves once against non-TTY piped stdin, whereas iterating works
    // for both interactive terminals and `printf ... | npm run …` pipes.
    const lineIter = rl[Symbol.asyncIterator]();
    const ask = async (q) => {
      process.stdout.write(q);
      const { value, done } = await lineIter.next();
      return done ? null : value; // null == EOF / no more input
    };

    let eof = false;
    for (const src of candidates) {
      if (eof) break;
      const name = path.basename(src);
      const { suggestion, descriptor } = suggestName(name);
      const hint = suggestion
        ? descriptor
          ? c.green(`${suggestion}.jpg`)
          : c.yellow(`${suggestion}<descriptor>.jpg`) + c.dim(" (add a descriptor)")
        : c.dim("(couldn't detect sport — type the full name)");
      console.log(`  ${c.cyan(name)}  ${c.dim(dimsOf(src))}\n    suggested: ${hint}`);

      // Loop until we get a valid name, a skip, or an accepted complete suggestion.
      while (true) {
        const raw = await ask("    new name: ");
        if (raw === null) {
          console.log(c.dim("\n    (no more input — stopping)\n"));
          eof = true;
          break;
        }
        let answer = raw.trim();
        if (answer.toLowerCase() === "s") {
          console.log(c.dim("    skipped\n"));
          break;
        }
        if (!answer) {
          if (suggestion && descriptor) answer = `${suggestion}.jpg`;
          else {
            console.log(c.yellow("    needs a name (suggestion is incomplete) — type one or 's' to skip"));
            continue;
          }
        }
        if (!path.extname(answer)) answer += ".jpg";
        const finalName = publishedName(answer);
        const probs = nameProblems(finalName);
        if (probs.length) {
          console.log(c.red(`    ✗ ${probs.join("; ")} — try again`));
          continue;
        }
        const destAbs = path.join(INBOX, finalName);
        if (fs.existsSync(destAbs) && destAbs !== src) {
          console.log(c.red(`    ✗ ${finalName} already exists in photo-inbox/ — pick another`));
          continue;
        }
        fs.renameSync(src, destAbs);
        console.log(`    ${c.green("✓")} renamed → ${c.cyan(finalName)}\n`);
        break;
      }
    }
    rl.close();
    drops = listImages(INBOX, { recurse: false }); // pick up the new names
  }
}

console.log(
  c.bold(`\nPhoto intake — ${drops.length} file(s) in photo-inbox/`) +
    c.dim(DO_PROCESS ? "  (processing)\n" : "  (audit only — pass --process to act)\n"),
);

const plan = []; // { src, action, ... }

for (const src of drops.sort()) {
  const name = path.basename(src);
  const size = human(fs.statSync(src).size);
  const dims = dimsOf(src);
  const hash = md5(src);
  const dup = hashIndex.get(hash);
  const problems = nameProblems(name);
  const pub = publishedName(name);
  const nameClash = byName.has(pub) && (!dup || hashIndex.get(hash) !== `public/photos/${pub}`);

  let label, action;
  if (dup) {
    label = c.yellow(`DUPLICATE of ${dup}`);
    action = "skip-dup";
  } else if (problems.length) {
    label = c.red(`RENAME — ${problems.join("; ")}`);
    action = "needs-rename";
  } else if (nameClash && !FORCE) {
    label = c.yellow(`NAME EXISTS (different content) → public/photos/${pub} — rename or --force`);
    action = "name-clash";
  } else {
    label = c.green(`READY → public/photos/${pub}`);
    action = "ready";
  }

  console.log(
    `  ${c.cyan(name)}  ${c.dim(`${dims} ${size}`)}\n    ${label}`,
  );
  plan.push({ src, name, pub, action });
}

// ── audit summary ──────────────────────────────────────────────────────────
const counts = plan.reduce((m, p) => ((m[p.action] = (m[p.action] || 0) + 1), m), {});
console.log(
  c.bold("\nSummary: ") +
    [
      counts.ready ? c.green(`${counts.ready} ready`) : null,
      counts["needs-rename"] ? c.red(`${counts["needs-rename"]} need rename`) : null,
      counts["name-clash"] ? c.yellow(`${counts["name-clash"]} name-clash`) : null,
      counts["skip-dup"] ? c.yellow(`${counts["skip-dup"]} duplicate`) : null,
    ]
      .filter(Boolean)
      .join(c.dim(" · ")) || c.dim("nothing actionable"),
);

if (!DO_PROCESS) {
  console.log(
    c.dim(
      "\nRe-run with --process to resize the READY files into public/photos/." +
        "\nDuplicates can be deleted from photo-inbox/. Rename the flagged ones to the convention first.\n",
    ),
  );
  process.exit(0);
}

// ── process mode ────────────────────────────────────────────────────────────
let processed = 0;
fs.mkdirSync(ORIGINALS, { recursive: true });
console.log("");
for (const p of plan) {
  if (p.action !== "ready") {
    console.log(c.dim(`  skip ${p.name} (${p.action})`));
    continue;
  }
  const dest = path.join(PHOTOS, p.pub);
  resizeInto(p.src, dest);
  let note = `→ public/photos/${p.pub} (${dimsOf(dest)})`;
  if (KEEP_ORIGINALS) {
    const ext = path.extname(p.pub);
    const stem = path.basename(p.pub, ext);
    const origDest = path.join(ORIGINALS, `${stem}-original${ext}`);
    fs.copyFileSync(p.src, origDest);
    note += c.dim(` + originals/${stem}-original${ext}`);
  }
  console.log(`  ${c.green("✓")} ${c.cyan(p.name)} ${note}`);
  processed++;
}

console.log(
  c.bold(`\nProcessed ${processed} file(s).`) +
    c.dim(
      "\nThe inbox copies are left in place (photo-inbox/ is gitignored) — delete them once you've" +
        "\nconfirmed the results. Review `git status public/photos/`, then commit.\n",
    ),
);
