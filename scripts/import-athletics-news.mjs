#!/usr/bin/env node
// Import one SLOHS weekly newsletter's "Athletics" section into
// src/app/data/athletics-news.json (decisions #255, #265).
//
//   npm run news-import -- <newsletter.txt> [--dry-run] [--allow-empty]
//
// <newsletter.txt> is the newsletter's plain-text body, as Gmail returns it
// (the ParentSquare "Digest" email from donotreply@parentsquare.com). The
// whole email is fine; so is just the Athletics section.
//
// Why a script and not a person (or a model) retyping it: the page promises
// the school's words verbatim. The only edits this makes are the ones the
// CLAUDE.md convention allows — &nbsp; to spaces, image lines dropped,
// duplicate paragraphs dropped, and a team name run into itself
// ("Flag Football Flag Football had…") collapsed.
//
// Re-running on the same newsletter replaces that week rather than adding a
// second copy. Notices (clearances, tryouts) are kept on the newest week only.
//
// Exit codes: 0 ok · 1 bad input · 2 parsed but found no team recaps.
// Exit 2 is deliberate (#193's lesson: "parsed cleanly" is not "has data") —
// an empty week usually means the section moved or the format changed, and a
// silent success would hide that. Pass --allow-empty for a genuinely quiet
// week (summer).

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA = path.join(ROOT, "src/app/data/athletics-news.json");

// Team names as the newsletter writes them → teams.json slugs. Longest match
// wins, so "Boys Varsity Water Polo" beats "Water Polo". Unknown names are
// still imported (untagged) and reported, so add them here when they appear.
const TEAM_NAMES = {
  "Football": ["football"],
  "Flag Football": ["flag-football"],
  "Girls Flag Football": ["flag-football"],
  "Girls Volleyball": ["girls-volleyball"],
  "Boys Volleyball": ["boys-volleyball"],
  "Beach Volleyball": ["beach-volleyball"],
  "Girls Tennis": ["girls-tennis"],
  "Boys Tennis": ["boys-tennis"],
  "Girls Golf": ["girls-golf"],
  "Boys Golf": ["boys-golf"],
  "Girls Water Polo": ["girls-water-polo"],
  "Boys Water Polo": ["boys-water-polo"],
  "Boys Varsity Water Polo": ["boys-water-polo"],
  "Girls Varsity Water Polo": ["girls-water-polo"],
  "Girls and Boys Water Polo": ["girls-water-polo", "boys-water-polo"],
  "Girls and Boys Varsity Water Polo": ["girls-water-polo", "boys-water-polo"],
  "Boys and Girls Water Polo": ["boys-water-polo", "girls-water-polo"],
  "Water Polo": ["girls-water-polo", "boys-water-polo"],
  "Cross Country": ["cross-country"],
  "Boys and Girls Cross Country": ["cross-country"],
  "Cheer": ["cheer"],
  "Varsity Cheer": ["cheer"],
  "Tiger Cheer": ["cheer"],
  "Winter Cheer": ["winter-cheer"],
  "Competitive Cheer": ["competitive-cheer"],
  "Traditional Competitive Cheer": ["competitive-cheer"],
  "Dance": ["dance"],
  "Dance Team": ["dance"],
  "Boys Basketball": ["boys-basketball"],
  "Girls Basketball": ["girls-basketball"],
  "Boys Soccer": ["boys-soccer"],
  "Girls Soccer": ["girls-soccer"],
  "Boys Wrestling": ["boys-wrestling"],
  "Girls Wrestling": ["girls-wrestling"],
  "Wrestling": ["boys-wrestling", "girls-wrestling"],
  "Baseball": ["baseball"],
  "Softball": ["softball"],
  "Track & Field": ["track-field"],
  "Track and Field": ["track-field"],
  "Boys Swim & Dive": ["boys-swim-dive"],
  "Girls Swim & Dive": ["girls-swim-dive"],
  "Swim & Dive": ["boys-swim-dive", "girls-swim-dive"],
  "Swimming": ["boys-swim-dive", "girls-swim-dive"],
  "STUNT": ["stunt"],
};
const NAMES_LONGEST_FIRST = Object.keys(TEAM_NAMES).sort(
  (a, b) => b.length - a.length,
);

// Paragraphs that are department boilerplate, not news. The weekly schedule
// link is skipped because /upcoming already reads that sheet.
const SKIP = [/^WEEKLY SCHEDULE\b/i];

function fail(msg, code = 1) {
  console.error(`news-import: ${msg}`);
  process.exit(code);
}

function clean(text) {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/ /g, " ")
    .split("\n")
    .filter((l) => !/^\s*!\[[^\]]*\]\([^)]*\)\s*$/.test(l)) // image-only lines
    .map((l) => l.replace(/!\[[^\]]*\]\([^)]*\)/g, "").replace(/[ \t]+/g, " ").trim())
    .join("\n");
}

/** "SLOHS Newsletter, 11.8.26" → { title, date: "2026-11-08" } */
function findTitle(text) {
  const m = text.match(/SLOHS Newsletter,\s*(\d{1,2})\.(\d{1,2})\.(\d{2,4})/);
  if (!m) return null;
  const [, mo, d, y] = m;
  const year = y.length === 2 ? `20${y}` : y;
  return {
    title: m[0].replace(/\s+/g, " "),
    date: `${year}-${mo.padStart(2, "0")}-${d.padStart(2, "0")}`,
  };
}

/** The newsletter's "In this message:" contents list, in order. Each entry
 *  sits on its own line after a lone "-" bullet. */
function tableOfContents(lines) {
  const start = lines.findIndex((l) => /^In this message:?$/i.test(l));
  if (start === -1) return [];
  const toc = [];
  let afterBullet = false;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("#### ")) break; // first real section
    if (l === "") continue;
    if (l === "-") {
      afterBullet = true;
      continue;
    }
    if (afterBullet) toc.push(l);
    afterBullet = false;
  }
  return toc;
}

const bare = (l) => l.replace(/^#{1,6}\s*/, "").trim().toLowerCase();

/** Lines of the Athletics section, between its heading and the next one. */
function athleticsSection(text) {
  const lines = text.split("\n");
  const toc = tableOfContents(lines);
  const firstHeading = lines.findIndex((l) => l.startsWith("#### "));

  // Normally "#### Athletics". One issue (9.27.26) printed it as a bare
  // line; a bare "Athletics" also appears in the contents list, so the
  // fallback only looks after the first real section heading. With no
  // headings at all (just the section pasted in), take the first match.
  let start = lines.indexOf("#### Athletics");
  if (start === -1) {
    start = lines.findIndex(
      (l, i) => i > Math.max(firstHeading, 0) && bare(l) === "athletics",
    );
  }
  if (start === -1 && firstHeading === -1) {
    start = lines.findIndex((l) => bare(l) === "athletics");
  }
  if (start === -1) return null;

  // Ends at the next "#### " heading — or, if that heading was printed bare
  // too, at the next contents entry — or at the digest footer.
  const ti = toc.findIndex((t) => bare(t) === "athletics");
  const next = ti >= 0 ? toc[ti + 1] : undefined;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (
      l.startsWith("#### ") ||
      (next && bare(l) === bare(next)) ||
      /^To see the post and comment/i.test(l)
    ) {
      end = i;
      break;
    }
  }
  return lines.slice(start + 1, end);
}

function paragraphs(lines) {
  const out = [];
  let cur = [];
  for (const l of lines) {
    if (l === "") {
      if (cur.length) out.push(cur.join(" "));
      cur = [];
    } else cur.push(l);
  }
  if (cur.length) out.push(cur.join(" "));
  return out.map((p) => p.replace(/\s+/g, " ").trim()).filter(Boolean);
}

/** The team a paragraph opens with: "Girls Tennis took…", or — the style
 *  of 11.8.26 — "The Girls Tennis team took…". */
function teamLead(p) {
  const opens = (s) =>
    NAMES_LONGEST_FIRST.find(
      (n) => s === n || s.startsWith(n + " ") || s.startsWith(n + ":"),
    );
  return opens(p) ?? (p.startsWith("The ") ? opens(p.slice(4)) : undefined);
}

/** Any team named near the start of a paragraph. */
function teamNamedEarly(p) {
  const head = p.slice(0, 70);
  return NAMES_LONGEST_FIRST.find((n) => head.includes(n));
}

/** "[label](url)" → label, collecting the links. */
function unlink(p, links) {
  return p.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_, label, url) => {
    const l = label.trim();
    if (l && /^https?:/.test(url)) links.push({ label: l, url });
    return l;
  });
}

function parse(sectionLines) {
  const items = [];
  const notices = [];
  const warnings = [];
  const seen = new Set();
  let pendingHeading = null; // a team name printed alone on its own line
  let last = null; // "item" | "notice" — where a follow-on paragraph goes

  for (const raw of paragraphs(sectionLines)) {
    // Duplicates are compared on letters and digits only: 10.25.26 printed
    // the Girls Golf paragraph twice, once with "Great job, Tigers!" and once
    // without the comma.
    const key = raw.toLowerCase().replace(/[^a-z0-9]+/g, "");
    if (seen.has(key)) {
      warnings.push(`dropped a duplicate paragraph: "${raw.slice(0, 60)}…"`);
      continue;
    }
    seen.add(key);
    if (SKIP.some((re) => re.test(raw))) continue;

    const links = [];
    let p = unlink(raw, links);
    const linkOnly = raw.replace(/\[[^\]]*\]\([^)]+\)/g, "").trim() === "";
    let lead = teamLead(p);

    // "Cross Country Boys and Girls Cross Country kept…": the bold heading
    // run into a paragraph that names the team again a few words later.
    if (lead && p.startsWith(lead + " ") && p.slice(lead.length + 1, lead.length + 40).includes(lead)) {
      p = p.slice(lead.length + 1);
      lead = teamLead(p) ?? lead;
    }

    if (lead && p === lead) {
      pendingHeading = lead;
      continue;
    }

    if (lead) {
      if (p.startsWith(`${lead} ${lead}`)) p = p.slice(lead.length + 1);
      items.push({ teams: TEAM_NAMES[lead], heading: lead, body: p });
      if (links.length) warnings.push(`${lead}: recap contains links (kept as text)`);
      pendingHeading = null;
      last = "item";
      continue;
    }

    if (pendingHeading) {
      items.push({ teams: TEAM_NAMES[pendingHeading], heading: pendingHeading, body: p });
      pendingHeading = null;
      last = "item";
      continue;
    }

    // A short line with no sentence punctuation is a notice title
    // ("Athletic Clearances"); the paragraphs after it are its body.
    const looksLikeTitle = p.length <= 60 && !/[.!?]$/.test(p) && links.length === 0;
    if (looksLikeTitle) {
      notices.push({ title: p, body: "", buttons: [], inline: [] });
      last = "notice";
      continue;
    }

    // A line that is nothing but links ("[Winter 26 Tryout Schedule](…)")
    // becomes the notice's buttons, not part of its text.
    if (linkOnly) {
      if (last === "notice") notices[notices.length - 1].buttons.push(...links);
      else warnings.push(`link line outside a notice, not imported: "${p}"`);
      continue;
    }

    if (last === "notice") {
      const n = notices[notices.length - 1];
      n.body = n.body ? `${n.body} ${p}` : p;
      n.inline.push(...links);
      continue;
    }

    if (last === "item") {
      // A recap that runs to a second paragraph — unless this paragraph
      // names a different team, in which case attaching it would put one
      // team's news on another's page. Better skipped and reported.
      const it = items[items.length - 1];
      const named = teamNamedEarly(p);
      if (named && !TEAM_NAMES[named].some((t) => it.teams.includes(t))) {
        warnings.push(`paragraph about ${named} with no recognisable opening, NOT imported (would otherwise have joined ${it.heading}): "${p.slice(0, 80)}…"`);
        continue;
      }
      it.body = `${it.body}\n\n${p}`;
      warnings.push(`${it.heading}: joined a follow-on paragraph ("${p.slice(0, 50)}…") — check it belongs`);
      continue;
    }

    warnings.push(`unrecognised paragraph, NOT imported — add the team name to TEAM_NAMES if it is a recap: "${p.slice(0, 80)}…"`);
  }

  // Notices: the link-only lines are the buttons; a link inside the text
  // ("practices and [tryouts](…)") is added only if it isn't already one.
  const keptNotices = notices
    .filter((n) => n.body)
    .map((n) => {
      const links = [...n.buttons];
      for (const l of n.inline) {
        if (!links.some((x) => x.url === l.url)) links.push(l);
      }
      return links.length ? { title: n.title, body: n.body, links } : { title: n.title, body: n.body };
    });
  for (const n of notices) {
    if (!n.body) warnings.push(`heading with no text after it, ignored: "${n.title}"`);
  }
  return { items, notices: keptNotices, warnings };
}

// ---------------------------------------------------------------------------

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const dryRun = args.includes("--dry-run");
const allowEmpty = args.includes("--allow-empty");
if (!file) fail("usage: npm run news-import -- <newsletter.txt> [--dry-run] [--allow-empty]");
if (!fs.existsSync(file)) fail(`no such file: ${file}`);

const text = clean(fs.readFileSync(file, "utf8"));
const meta = findTitle(text);
if (!meta) fail(`couldn't find "SLOHS Newsletter, M.D.YY" in ${file} — is this the newsletter?`);
const section = athleticsSection(text);
if (!section) fail(`no Athletics section in ${meta.title}`, allowEmpty ? 0 : 2);

const { items, notices, warnings } = parse(section);
if (items.length === 0 && !allowEmpty) {
  console.error(warnings.join("\n"));
  fail(`Athletics section of ${meta.title} produced no team recaps`, 2);
}

const doc = JSON.parse(fs.readFileSync(DATA, "utf8"));
const issue = { date: meta.date, title: meta.title, items };
if (notices.length) issue.notices = notices;
const replaced = doc.issues.some((i) => i.date === meta.date);
doc.issues = doc.issues.filter((i) => i.date !== meta.date);
doc.issues.push(issue);
doc.issues.sort((a, b) => b.date.localeCompare(a.date));
// Notices only on the newest week, so old instructions don't linger.
doc.issues.forEach((i, idx) => {
  if (idx > 0) delete i.notices;
});

const summary = {
  newsletter: meta.title,
  date: meta.date,
  action: dryRun ? "dry-run" : replaced ? "replaced" : "added",
  newestWeek: doc.issues[0].date,
  recaps: items.map((i) => `${i.heading} → ${i.teams.join("+") || "(no team page)"}`),
  notices: notices.map((n) => n.title),
  warnings,
};
console.log(JSON.stringify(summary, null, 2));
if (!dryRun) fs.writeFileSync(DATA, JSON.stringify(doc, null, 2) + "\n");
