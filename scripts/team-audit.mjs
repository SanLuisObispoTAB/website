#!/usr/bin/env node
// Team page completeness audit for the SLOTAB site.
//
// Reports what each team page is still missing — coach bios, squad
// portraits, action shots, liaisons — and writes the result to
// `docs/team-page-gaps.md` so the board has one list to work from.
//
// WHY THIS EXISTS: /teams/cross-country is the reference page (decisions
// #108, #109) — head coaches with roles and bios, assistants listed, a
// labelled squad portrait, and action shots only in the action slots. The
// other pages should reach the same bar. The gaps are all *content* the
// board has to supply, not code, so they need tracking between meetings
// rather than fixing in a commit.
//
// The two large programs (football, track & field) are deliberately held to
// a lower bar and reported separately: football is a three-level program and
// track & field spans ~18 events with a 10-coach staff, so neither fits the
// single-squad template. See decision #110.
//
// USAGE
//   node scripts/team-audit.mjs            # print the report
//   node scripts/team-audit.mjs --write    # also regenerate docs/team-page-gaps.md
//   npm run team-audit -- --write

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const TEAM_DIR = "src/app/data/teams";
const OUT = "docs/team-page-gaps.md";

/** Held to a lower bar — too large/complex for the single-squad template. */
const LARGE_PROGRAMS = new Set(["football", "track-field"]);

/** Programs that field more than one squad on a single page, and the squads
 *  we expect a portrait for. A squad listed here with no matching entry in
 *  `teamPhotos` is reported as a missing photo rather than silently omitted.
 *  Match is on the `label`. */
const EXPECTED_SQUADS = {
  football: ["Varsity", "JV", "Frosh"],
  "girls-volleyball": ["Varsity", "JV", "Frosh"],
  "cross-country": ["Boys", "Girls"],
  "track-field": ["Boys", "Girls"],
};

/** A posed squad portrait sitting in an action slot. Portraits are named
 *  with a `-team-` segment by the photo convention in CLAUDE.md. */
const isPortrait = (p) => typeof p === "string" && /-team[-.]/.test(p);

function loadTeams() {
  return readdirSync(TEAM_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(TEAM_DIR, f), "utf8")));
}

function assess(t) {
  const heads = t.headCoaches ?? (t.headCoach ? [t.headCoach] : []);
  const portraits =
    t.teamPhotos ?? (t.teamPhoto ? [{ photo: t.teamPhoto }] : []);
  const gallery = t.gallery ?? [];
  const liaisons = (t.liaisons ?? []).filter(
    (l) => l.name && !/TBD/i.test(l.name),
  );

  // Squads we expect a portrait for but don't have one for yet.
  const expected = EXPECTED_SQUADS[t.slug] ?? [];
  const haveLabels = new Set(
    portraits.map((p) => (p.label ?? "").toLowerCase()).filter(Boolean),
  );
  const missingSquads = expected.filter(
    (sq) => !haveLabels.has(sq.toLowerCase()),
  );

  return {
    slug: t.slug,
    name: t.name,
    large: LARGE_PROGRAMS.has(t.slug),
    missingSquads,
    // Content the board still owes us.
    missing: {
      "action hero": !t.heroPhoto,
      "action gallery": gallery.length === 0,
      "squad portrait": portraits.length === 0,
      "head coach": heads.length === 0,
      "coach bio": heads.length > 0 && heads.some((c) => !c.bio),
      "coach email": heads.length > 0 && heads.some((c) => !c.email),
      liaison: liaisons.length === 0,
    },
    // Rule violations — these are bugs, not missing content.
    violations: [
      ...(isPortrait(t.heroPhoto)
        ? [`heroPhoto is a posed portrait (${t.heroPhoto})`]
        : []),
      ...gallery
        .filter(isPortrait)
        .map((g) => `gallery contains a posed portrait (${g})`),
      ...(t.heroPhoto && t.heroPhoto === t.teamPhoto
        ? ["heroPhoto and teamPhoto are the same file (shows twice)"]
        : []),
    ],
    counts: {
      squads: portraits.length,
      coaches: heads.length,
      bios: heads.filter((c) => c.bio).length,
      assistants: (t.assistantCoaches ?? []).length,
      gallery: gallery.length,
      portraits: portraits.length,
      liaisons: liaisons.length,
    },
  };
}

const teams = loadTeams().map(assess);
const standard = teams.filter((t) => !t.large);
const large = teams.filter((t) => t.large);

const FIELDS = [
  "action hero",
  "action gallery",
  "squad portrait",
  "head coach",
  "coach bio",
  "coach email",
  "liaison",
];

function table(rows) {
  const head = `| Team | ${FIELDS.join(" | ")} |`;
  const sep = `|---|${FIELDS.map(() => "---").join("|")}|`;
  const body = rows.map(
    (t) =>
      `| \`${t.slug}\` | ` +
      FIELDS.map((f) => (t.missing[f] ? "❌" : "✅")).join(" | ") +
      " |",
  );
  return [head, sep, ...body].join("\n");
}

const complete = standard.filter((t) => !Object.values(t.missing).some(Boolean));
const tally = Object.fromEntries(
  FIELDS.map((f) => [f, standard.filter((t) => t.missing[f]).length]),
);
const violations = teams.filter((t) => t.violations.length);

const lines = [];
lines.push("# Team page gaps");
lines.push("");
lines.push(
  "**Generated — do not edit by hand.** Re-run `npm run team-audit -- --write` after adding photos or coach info.",
);
lines.push("");
lines.push(
  "`/teams/cross-country` is the reference page (decisions #108, #109): head coaches with roles and bios, assistants listed, a labelled squad portrait, and action shots only in the action slots. Everything below is content the board supplies — no code change is needed for any of it.",
);
lines.push("");
lines.push(`## Standard teams (${standard.length})`);
lines.push("");
lines.push(table(standard));
lines.push("");
lines.push("### What's missing, by count");
lines.push("");
for (const [f, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  lines.push(
    `- **${f}** — missing on ${n} of ${standard.length} teams${n === 0 ? " ✅" : ""}`,
  );
}
lines.push("");
if (complete.length) {
  lines.push(
    `Fully complete: ${complete.map((t) => `\`${t.slug}\``).join(", ")}`,
  );
} else {
  lines.push("No standard team is fully complete yet.");
}
lines.push("");
lines.push("### Per team");
lines.push("");
for (const t of standard) {
  const miss = FIELDS.filter((f) => t.missing[f]);
  lines.push(
    `- \`${t.slug}\` — ${miss.length ? `needs **${miss.join("**, **")}**` : "complete ✅"}` +
      ` _(${t.counts.coaches} head coach${t.counts.coaches === 1 ? "" : "es"}, ` +
      `${t.counts.assistants} assistant${t.counts.assistants === 1 ? "" : "s"}, ` +
      `${t.counts.gallery} action shot${t.counts.gallery === 1 ? "" : "s"}, ` +
      `${t.counts.portraits} portrait${t.counts.portraits === 1 ? "" : "s"})_`,
  );
}
lines.push("");
lines.push(`## Large programs (${large.length}) — held to a lower bar`);
lines.push("");
lines.push(
  "Football is a three-level program and track & field spans ~18 events with a large staff, so neither fits the single-squad template. Listed for visibility only; not counted above.",
);
lines.push("");
lines.push(table(large));
lines.push("");
lines.push("## Missing squad photos");
lines.push("");
const squadGaps = teams.filter((t) => t.missingSquads.length);
if (squadGaps.length === 0) {
  lines.push("None — every multi-squad program has a portrait for each squad.");
} else {
  lines.push(
    "Multi-squad programs show one captioned portrait per squad. These squads have no photo in `public/photos` yet — drop them through `photo-inbox/` and add a `teamPhotos` entry:",
  );
  lines.push("");
  for (const t of squadGaps) {
    lines.push(
      `- \`${t.slug}\` — missing **${t.missingSquads.join("**, **")}** _(has ${t.counts.squads})_`,
    );
  }
}
lines.push("");
lines.push("## Rule violations");
lines.push("");
if (violations.length === 0) {
  lines.push(
    "None. No posed portrait is sitting in an action slot, and no page shows the same photo twice.",
  );
} else {
  for (const t of violations) {
    for (const v of t.violations) lines.push(`- \`${t.slug}\` — ${v}`);
  }
}
lines.push("");

const doc = lines.join("\n");

if (process.argv.includes("--write")) {
  writeFileSync(OUT, doc + "\n");
  console.log(`Wrote ${OUT}`);
}

// Console summary — the same data, shorter.
console.log(`\nStandard teams: ${standard.length}   Large programs: ${large.length}`);
console.log(`Fully complete: ${complete.length}/${standard.length}\n`);
for (const [f, n] of Object.entries(tally).sort((a, b) => b[1] - a[1])) {
  const bar = "█".repeat(n).padEnd(standard.length, "·");
  console.log(`  ${f.padEnd(16)} ${bar} ${n} missing`);
}
if (squadGaps.length) {
  console.log(`\nMissing squad photos:`);
  for (const t of squadGaps)
    console.log(`   ${t.slug}: ${t.missingSquads.join(", ")}`);
}
if (violations.length) {
  console.log(`\n⚠  ${violations.length} team(s) with rule violations:`);
  for (const t of violations)
    for (const v of t.violations) console.log(`   ${t.slug}: ${v}`);
} else {
  console.log("\n✓ No rule violations — no portraits in action slots.");
}
console.log("");
