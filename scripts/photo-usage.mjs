#!/usr/bin/env node
// Photo library audit for public/photos.
//
// Answers three questions the intake script can't, because they're about the
// library as a whole rather than a single dropped file:
//
//   1. WHICH PHOTOS ARE UNUSED?  Photos have repeatedly been sitting in
//      public/photos while the page that wants them renders nothing — the
//      girls-volleyball JV/Frosh portraits and four of the five flag-football
//      action shots were both found that way (decisions #110, #112).
//   2. WHICH ARE THE SAME IMAGE UNDER TWO NAMES?  bwpolo-2.jpg and
//      bwpolo-teitge-2022.jpg are byte-different but pixel-identical, and both
//      sat in the same gallery, so the page showed one photo twice (#112).
//   3. DOES ANY ONE PAGE REPEAT A PHOTO?  Same file — or same image under two
//      names — in a hero and its own gallery.
//
// Duplicate detection downscales each image to a 16x16 grayscale signature, so
// it catches re-crops and re-exports, not just byte-identical copies.
//
// USAGE
//   node scripts/photo-usage.mjs           # full report
//   node scripts/photo-usage.mjs --unused  # just the unused list
//   npm run photo-usage

import { readFileSync, readdirSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, extname, basename } from "node:path";

const PHOTOS = "public/photos";
const SEARCH_DIRS = ["src", "public/admin"];
const IMG = /\.(jpe?g|png|webp|avif)$/i;

/** Every file that could reference a photo path. */
function sourceFiles(dir, acc = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) sourceFiles(p, acc);
    else if (/\.(tsx?|jsx?|json|ya?ml|css|md)$/i.test(e.name)) acc.push(p);
  }
  return acc;
}

const corpus = SEARCH_DIRS.flatMap((d) => sourceFiles(d))
  .map((f) => readFileSync(f, "utf8"))
  .join("\n");

const photos = readdirSync(PHOTOS)
  .filter((f) => IMG.test(f) && statSync(join(PHOTOS, f)).isFile())
  .sort();

/** 16x16 grayscale signature — catches re-crops and re-exports. */
function signature(file) {
  try {
    const out = execFileSync(
      "magick",
      [file, "-colorspace", "gray", "-resize", "16x16!", "-depth", "8", "txt:-"],
      { encoding: "utf8", maxBuffer: 1 << 24 },
    );
    return out.split("\n").slice(1).join("|");
  } catch {
    return null;
  }
}

const rows = photos.map((f) => {
  const used = corpus.includes(`/photos/${f}`);
  return { file: f, used, sig: signature(join(PHOTOS, f)) };
});

// --- unused -----------------------------------------------------------------
const unused = rows.filter((r) => !r.used);

// --- duplicate images (same signature, different filename) ------------------
const bySig = new Map();
for (const r of rows) {
  if (!r.sig) continue;
  if (!bySig.has(r.sig)) bySig.set(r.sig, []);
  bySig.get(r.sig).push(r.file);
}
const dupes = [...bySig.values()].filter((g) => g.length > 1);

// --- a single page using the same image twice -------------------------------
const sigOf = new Map(rows.map((r) => [r.file, r.sig]));
const TEAM_DIR = "src/app/data/teams";
const repeats = [];
for (const f of readdirSync(TEAM_DIR).filter((f) => f.endsWith(".json"))) {
  const t = JSON.parse(readFileSync(join(TEAM_DIR, f), "utf8"));
  const slots = [];
  if (t.heroPhoto) slots.push(["heroPhoto", t.heroPhoto]);
  // Same normalisation as team-audit: a captioned entry is an object, and
  // basename() on an object would silently produce a bogus signature.
  (t.gallery ?? []).forEach((g, i) =>
    slots.push([`gallery[${i}]`, typeof g === "string" ? g : g.photo]),
  );
  const portraits = t.teamPhotos ?? (t.teamPhoto ? [{ photo: t.teamPhoto }] : []);
  portraits.forEach((p, i) => slots.push([`teamPhotos[${i}]`, p.photo]));

  const seen = new Map();
  for (const [slot, path] of slots) {
    const name = basename(path);
    const sig = sigOf.get(name) ?? `missing:${name}`;
    if (seen.has(sig)) {
      repeats.push({
        slug: t.slug,
        a: seen.get(sig),
        b: `${slot} (${name})`,
        identical: seen.get(sig).includes(name),
      });
    } else seen.set(sig, `${slot} (${name})`);
  }
}

// --- report -----------------------------------------------------------------
const onlyUnused = process.argv.includes("--unused");

console.log(`\nPhoto library: ${photos.length} files in ${PHOTOS}`);
console.log(`  used: ${rows.length - unused.length}   unused: ${unused.length}\n`);

console.log(`UNUSED (${unused.length}) — in the library, referenced nowhere:`);
if (unused.length === 0) console.log("  none");
for (const r of unused) console.log(`  ${r.file}`);

if (onlyUnused) process.exit(0);

console.log(`\nSAME IMAGE, DIFFERENT FILENAME (${dupes.length} group(s)):`);
if (dupes.length === 0) console.log("  none");
for (const g of dupes) console.log(`  ${g.join("  ==  ")}`);

console.log(`\nONE PAGE SHOWING A PHOTO TWICE (${repeats.length}):`);
if (repeats.length === 0) console.log("  none");
for (const r of repeats)
  console.log(
    `  ${r.slug}: ${r.a} and ${r.b}` +
      (r.identical ? " — same file" : " — different filenames, same image"),
  );
console.log("");
