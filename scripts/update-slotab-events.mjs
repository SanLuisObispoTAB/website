#!/usr/bin/env node
// Scrapes the SLOHS weekly athletics schedule Google Sheet and writes a
// normalized events file at src/app/data/weekly-events.json.
//
// The sheet is maintained weekly by the school. Run this on a cron (GitHub
// Actions) so the SLOTAB site stays current.
//
// Sheet: https://docs.google.com/spreadsheets/d/1lzPklHuK6CzaxW9k3czS8ZmlTjNFNVO6ZZkvo4xuG3c/
// CSV export (public): ?format=csv&gid=<tabId>
//
// 2026-08-24 — repointed from 1qWOPM3Shc… to 1lzPklHuK6…. The school opened
// 2026-27 on a NEW copy of the sheet and left the old file behind holding a
// single "Aug 10 - Aug 15" tab with a header row and no data. The scraper kept
// succeeding against it (header found, zero rows), so the cron went green every
// week while the site quietly fell back to the static events.json import.
// If this ever goes quiet again, check the discovered tab list FIRST: the live
// sheet always carries the current week plus the next one. A single stale-dated
// tab means the department has moved house again.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(REPO_ROOT, "src/app/data/weekly-events.json");

const SHEET_ID = "1lzPklHuK6CzaxW9k3czS8ZmlTjNFNVO6ZZkvo4xuG3c";
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlembed`;
const csvUrlFor = (gid) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

// Warnings worth surfacing at the end of a run rather than burying mid-stream.
const warnings = [];

// Pulls the list of visible tabs (one per week) from the htmlembed page.
// The schedule owner keeps two or three weeks live at a time — current plus
// next — so we just grab whatever is listed.
async function discoverTabs() {
  const res = await fetch(EMBED_URL, {
    headers: { "User-Agent": "slotab-events-scraper/1.0" },
  });
  if (!res.ok) {
    throw new Error(`htmlembed fetch failed: ${res.status}`);
  }
  const html = await res.text();
  const matches = [...html.matchAll(/name:\s*"([^"]+)"[^}]*?gid=(\d+)/g)];
  const seen = new Set();
  const tabs = [];
  for (const m of matches) {
    const gid = m[2];
    if (seen.has(gid)) continue;
    seen.add(gid);
    tabs.push({ name: m[1], gid });
  }
  return tabs;
}

// ---- Gender disambiguation by season ----
// The sheet writes gender only when it feels the need to: "Girls Varsity
// Tennis" one row, a bare "JV Tennis" the next. The old code read a missing
// gender as *boys*, which published "Boys Tennis" chips all through a fall
// girls tennis season.
//
// For the sports where SLOHS fields one gender at a time, the season answers
// it: tennis, golf and indoor volleyball all run girls in Fall and boys in
// Spring. Read that from teams.json rather than hardcoding it, so the day a
// season moves on the team pages this follows automatically.
const teamsJson = JSON.parse(
  fs.readFileSync(path.join(REPO_ROOT, "src/app/data/teams.json"), "utf8"),
);
const SEASON_BY_SLUG = new Map(
  (teamsJson.teams ?? []).map((t) => [t.slug, t.season]),
);

// Athletic season for a calendar month (1-12), matching currentSeason() in
// src/app/data/seasons.ts.
function seasonOfMonth(month) {
  if (month >= 8 && month <= 10) return "Fall";
  if (month === 11 || month === 12 || month <= 2) return "Winter";
  return "Spring";
}

// girlsSlug/boysSlug are the teams.json slugs used to look the season up;
// girls/boys are the EventCategory keys (which differ for swim & dive).
const GENDERED_SPORTS = {
  volleyball: {
    girlsSlug: "girls-volleyball", boysSlug: "boys-volleyball",
    girls: { category: "girls-volleyball", label: "Girls Volleyball" },
    boys: { category: "boys-volleyball", label: "Boys Volleyball" },
  },
  tennis: {
    girlsSlug: "girls-tennis", boysSlug: "boys-tennis",
    girls: { category: "girls-tennis", label: "Girls Tennis" },
    boys: { category: "boys-tennis", label: "Boys Tennis" },
  },
  golf: {
    girlsSlug: "girls-golf", boysSlug: "boys-golf",
    girls: { category: "girls-golf", label: "Girls Golf" },
    boys: { category: "boys-golf", label: "Boys Golf" },
  },
  "water-polo": {
    girlsSlug: "girls-water-polo", boysSlug: "boys-water-polo",
    girls: { category: "girls-water-polo", label: "Girls Water Polo" },
    boys: { category: "boys-water-polo", label: "Boys Water Polo" },
  },
  swim: {
    girlsSlug: "girls-swim-dive", boysSlug: "boys-swim-dive",
    girls: { category: "girls-swim", label: "Girls Swim & Dive" },
    boys: { category: "boys-swim", label: "Boys Swim & Dive" },
  },
};

// Resolve a gendered sport for one event. Explicit gender in the sheet always
// wins. Failing that, if only one of the two squads is in season this month,
// it is that one. If both are (water polo and swim each field both genders in
// the same season) we do not guess — we keep the previous boys default so the
// row still renders, and record a warning naming the row, because a wrong
// filter chip that nobody knows about is the worse failure.
function resolveGender(key, { girls, boys }, month, rawSport) {
  const spec = GENDERED_SPORTS[key];
  if (girls) return spec.girls;
  if (boys) return spec.boys;

  const season = seasonOfMonth(month);
  const girlsInSeason = SEASON_BY_SLUG.get(spec.girlsSlug) === season;
  const boysInSeason = SEASON_BY_SLUG.get(spec.boysSlug) === season;
  if (girlsInSeason && !boysInSeason) return spec.girls;
  if (boysInSeason && !girlsInSeason) return spec.boys;

  warnings.push(
    `"${rawSport}" names no gender and both squads are in season (${season}) — ` +
      `defaulted to ${spec.boys.label}. Ask the AD to qualify the row.`,
  );
  return spec.boys;
}

// Map the free-text sport string from the sheet to our category keys.
// Keep the mapping loose and forgiving — the sheet is hand-edited each week.
// Gender-aware as of 2026-08-11: the old version sent every volleyball row to
// "boys-volleyball" and had no fall sports at all, so this fall's girls
// volleyball, football, water polo, and cross country would have been
// mislabelled or dropped to non-sport the moment the school filled the sheet in.
// Season-aware as of 2026-08-24 — see resolveGender() above.
function categorize(rawSport, month) {
  const s = rawSport.toLowerCase();
  const girls = /\b(girls?|women'?s|g)\b/.test(s);
  const boys = /\b(boys?|men'?s|b)\b/.test(s);
  const g = (key) => resolveGender(key, { girls, boys }, month, rawSport);

  // Order matters: the more specific string has to win. "Flag Football"
  // must be tested before "football", "beach" before "volleyball", and
  // "cross country" before anything matching "country".
  if (s.includes("flag")) return { category: "flag-football", label: "Girls Flag Football" };
  if (s.includes("football")) return { category: "football", label: "Football" };
  if (s.includes("water polo") || s.includes("waterpolo")) return g("water-polo");
  if (s.includes("cross country") || s.includes("xc"))
    return { category: "cross-country", label: "Cross Country" };
  if (s.includes("beach")) return { category: "beach-volleyball", label: "Beach Volleyball" };
  if (s.includes("volleyball")) return g("volleyball");
  if (s.includes("softball")) return { category: "softball", label: "Softball" };
  if (s.includes("baseball")) return { category: "baseball", label: "Baseball" };
  if (s.includes("basketball")) return { category: "basketball", label: girls ? "Girls Basketball" : "Boys Basketball" };
  if (s.includes("soccer")) return { category: "soccer", label: girls ? "Girls Soccer" : "Boys Soccer" };
  if (s.includes("wrestl")) return { category: "wrestling", label: girls ? "Girls Wrestling" : "Boys Wrestling" };
  if (s.includes("tennis")) return g("tennis");
  if (s.includes("swim") || s.includes("dive")) return g("swim");
  if (s.includes("golf")) return g("golf");
  if (s.includes("track") || s.includes("field")) return { category: "track-field", label: "Track & Field" };
  if (s.includes("stunt")) return { category: "stunt", label: "Stunt" };
  if (s.includes("cheer")) return { category: "cheer", label: "Cheer" };
  if (s.includes("dance")) return { category: "dance", label: "Dance" };
  // Unrecognized: keep it visible as a non-sport row rather than dropping it,
  // and let the label carry whatever the sheet said.
  if (boys || girls) { /* fallthrough — gender known but sport isn't */ }
  return { category: "non-sport", label: rawSport };
}

// RFC-4180-ish CSV parser — handles quoted fields that contain commas.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function parseDate(dateStr, timeStr) {
  // Accepts "4/7/2026", "4/10-4/11/26", "4/11/2026", etc.
  const clean = dateStr.trim();
  const firstPart = clean.split(/-|–/)[0].trim();
  const m = firstPart.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  let year = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (year < 100) year += 2000;
  const { hours, minutes } = parseTime(timeStr);
  return localIso(year, month, day, hours, minutes);
}

// Emit a LOCAL naive ISO string ("2026-09-04T19:30:00"), never a UTC one.
//
// This was a live day-shifting bug, dormant only because the old sheet was
// empty. `new Date(y,m,d,h,mm).toISOString()` reads the components as local
// time and prints them as UTC, so a 7:30 PM Pacific kickoff came out as
// "2026-09-05T02:30:00" — and because the consumers parse a designator-less
// ISO string back as *local* time, Friday night football rendered on Saturday
// morning. Building the string by hand keeps the wall-clock time the sheet
// actually says, and matches the shape events.json already uses.
function localIso(year, month, day, hours, minutes) {
  const p2 = (n) => String(n).padStart(2, "0");
  return `${year}-${p2(month)}-${p2(day)}T${p2(hours)}:${p2(minutes)}:00`;
}

// Start Time cells are free text and rarely just a time. Real examples from
// the 2026-27 sheet: "5:00, 6:30" (two levels), "4:00 JV, 7:00 V",
// "2:55 PM (JV)", "4pm JV / 7pm V" across two lines, "5:00, 6:00 (no frosh)",
// "TBA". Take the first time listed — that is the earliest event of the day
// and the one the calendar should sort on.
//
// The AM/PM heuristic matters more than it looks: half these cells omit the
// meridiem, and reading a bare "4:00" as 4:00 AM put a Friday night football
// game on the calendar at four in the morning. High school contests do not
// start between 1 and 7 in the morning, so a bare 1-7 is PM; 8-11 stays AM
// for Saturday meets, which really do start at 9:00.
function parseTime(timeStr) {
  const tm = String(timeStr || "").split(",")[0].trim();
  // "4:30 PM" / "4:30PM" / "4:30"
  let match = tm.match(/(\d{1,2}):(\d{2})\s*([AP])\.?M\.?/i);
  let hours;
  let minutes = 0;
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    return { hours: applyMeridiem(hours, match[3]), minutes };
  }
  // "4pm" / "7 PM" — no minutes at all, which the Cheer rows use.
  match = tm.match(/(\d{1,2})\s*([AP])\.?M\.?/i);
  if (match) {
    return { hours: applyMeridiem(Number(match[1]), match[2]), minutes: 0 };
  }
  // "4:00" / "6:30" with no meridiem — apply the heuristic above.
  match = tm.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    hours = Number(match[1]);
    minutes = Number(match[2]);
    if (hours >= 1 && hours <= 7) hours += 12;
    return { hours, minutes };
  }
  // "TBA", "TBD", "--", empty: noon, so the row still sorts onto its own day.
  return { hours: 12, minutes: 0 };
}

function applyMeridiem(hours, ap) {
  const pm = String(ap).toUpperCase() === "P";
  if (pm && hours < 12) return hours + 12;
  if (!pm && hours === 12) return 0;
  return hours;
}

// Frosh / JV / Varsity, wherever the sheet puts it — "Frosh Football",
// "JV Tennis", "Girls Varsity Tennis", "Cheer (V & JV Black)". A row can name
// more than one level ("V & JV"), so collect them all.
function parseLevel(rawSport) {
  const s = String(rawSport).toLowerCase();
  const levels = [];
  if (/\b(frosh|freshman|freshmen)\b/.test(s)) levels.push("Frosh");
  if (/\b(jv|junior varsity)\b/.test(s)) levels.push("JV");
  if (/\b(varsity|v)\b/.test(s) && !/\bjunior varsity\b/.test(s)) levels.push("Varsity");
  return levels.length ? levels.join(" & ") : undefined;
}

// Rows that are not contests. The sheet uses the Opponent column for whatever
// is happening that day, so team picture day arrives as "JV Tennis vs
// Pictures". Publishing that to a booster calendar of games is just noise.
const NON_CONTEST = /^(pictures?|picture day|photos?|photo day|practice|no practice|meeting|tryouts?|media day|banquet|off|bye|tba|tbd|n\/a|-+)$/i;

// Opponent strings that name an event rather than a school. "@ Boys Water Polo
// Varsity Tournament" reads like a place; "— Boys Water Polo Varsity
// Tournament" reads like what it is.
const EVENT_NAME = /tournament|invitational|showdown|time trial|classic|championship|jamboree|\bmeet\b|festival/i;

function isHome(location) {
  const loc = (location || "").toLowerCase();
  return loc.includes("slohs") || loc.includes("slo hs") || loc === "home";
}

// Strip HTML tags from spreadsheet cell values — defense against XSS
// payloads injected into Google Sheets cells — and flatten the newlines the
// department types inside cells ("Game Day (Flag)\nvs Rocklin"), which would
// otherwise land raw in an event title.
function stripTags(s) {
  return typeof s === "string"
    ? s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 300)
    : "";
}

async function fetchTabEvents({ name, gid }) {
  const res = await fetch(csvUrlFor(gid), {
    headers: { "User-Agent": "slotab-events-scraper/1.0" },
  });
  if (!res.ok) {
    throw new Error(`Tab ${gid} fetch failed: ${res.status}`);
  }
  const csv = await res.text();
  const rows = parseCsv(csv);
  const headerIdx = rows.findIndex(
    (r) => r && r[0] && r[0].trim() === "Sport",
  );
  // No "Sport" header means the sheet's shape changed (or we were served
  // something that isn't the sheet at all). That is a broken scraper, not an
  // empty week, and it must not be mistaken for one — returning [] here used
  // to make a structural break indistinguishable from "no games scheduled",
  // so the job would go green while silently publishing nothing.
  if (headerIdx < 0) {
    throw new Error(
      `Tab "${name}" (gid=${gid}) has no "Sport" header row — ` +
        `the sheet layout or the export format has changed. ` +
        `Fetched ${rows.length} row(s) from ${csvUrlFor(gid)}`,
    );
  }

  const events = [];
  let skipped = 0;
  for (const row of rows.slice(headerIdx + 1)) {
    if (!row || !row[0] || !row[0].trim()) continue;
    const [sport, date, _day, opponent, location, startTime] = row.map(stripTags);
    const cleanOpp = (opponent || "").trim();
    if (NON_CONTEST.test(cleanOpp)) {
      skipped++;
      continue;
    }
    const iso = parseDate(date, startTime);
    if (!iso) continue;
    const month = Number(date.trim().split("/")[0]);
    const { category, label } = categorize(sport, month);
    const home = isHome(location);
    const level = parseLevel(sport);
    const cleanSport = sport.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();

    // An opponent that names an event, or that already carries its own "vs",
    // must not get a second "vs"/"@" bolted on the front of it.
    const selfDescribing = EVENT_NAME.test(cleanOpp) || /\bvs\.?\b/i.test(cleanOpp);
    // "Boys Water Polo" + "Boys Water Polo Varsity Tournament" should not
    // stutter into "Boys Water Polo — Boys Water Polo Varsity Tournament".
    const opponentLeadsWithSport =
      cleanOpp.toLowerCase().startsWith(cleanSport.toLowerCase());
    const title = opponentLeadsWithSport
      ? cleanOpp
      : selfDescribing
        ? `${cleanSport} — ${cleanOpp}`
        : `${cleanSport} ${home ? "vs" : "@"} ${cleanOpp}`;

    // Location is what a parent needs; level tells them which squad plays.
    const detail = [location || undefined, level].filter(Boolean).join(" · ") || undefined;

    events.push({
      id: `weekly-${iso.slice(0, 10)}-${category}-${(level ?? "").replace(/\W+/g, "").toLowerCase()}-${cleanOpp.replace(/\W+/g, "-").toLowerCase().slice(0, 24)}`,
      category,
      categoryLabel: label,
      isSport: category !== "non-sport",
      date: iso,
      title,
      detail,
      isHome: home,
      opponent: cleanOpp,
      level,
      sourceTab: name,
    });
  }
  if (skipped > 0) {
    process.stdout.write(`  · skipped ${skipped} non-contest row(s)\n`);
  }
  return events;
}

async function main() {
  process.stdout.write(`Discovering live tabs...\n`);
  const tabs = await discoverTabs();
  if (tabs.length === 0) {
    throw new Error("No tabs discovered — htmlembed parser may need updating");
  }
  for (const t of tabs) {
    process.stdout.write(`  - ${t.name}  (gid=${t.gid})\n`);
  }

  const allEvents = [];
  for (const tab of tabs) {
    process.stdout.write(`Fetching "${tab.name}"...\n`);
    const events = await fetchTabEvents(tab);
    process.stdout.write(`  + ${events.length} events\n`);
    allEvents.push(...events);
  }

  // A legitimately empty week happens — the department clears the tab once the
  // week is over and fills the next one in its own time. So this is a warning,
  // not a failure. But it is worth shouting about, because the alternative
  // explanation is that the site is quietly serving no schedule at all, and a
  // silent green run is how that goes unnoticed for weeks. It did: the old
  // sheet sat empty from the 2026-27 rollover until 2026-08-24.
  if (allEvents.length === 0) {
    process.stdout.write(
      `\n⚠️  Every tab parsed cleanly but produced ZERO events.\n` +
        `    The sheet's header row was found, so the scraper is working —\n` +
        `    the source tab(s) have no data rows. Either the week is over and\n` +
        `    the department has not posted the next one, or the tab is stale.\n` +
        `    /upcoming will fall back to the static schedule import.\n` +
        `    Tabs seen: ${tabs.map((t) => `"${t.name}"`).join(", ")}\n\n`,
    );
  }

  // Deduplicate: same iso date + category + level + opponent. Level is part of
  // the key because frosh, JV and varsity play the same school on the same day
  // often enough that leaving it out silently drops the other two.
  const seen = new Set();
  const unique = [];
  for (const e of allEvents) {
    const key = `${e.date}-${e.category}-${e.level ?? ""}-${e.opponent}`;
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(e);
  }
  unique.sort((a, b) => a.date.localeCompare(b.date));

  const output = {
    source: EMBED_URL,
    tabs: tabs.map((t) => ({ name: t.name, gid: t.gid })),
    fetchedAt: new Date().toISOString(),
    events: unique,
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2) + "\n");
  process.stdout.write(
    `Wrote ${unique.length} unique events to ${path.relative(REPO_ROOT, OUTPUT)}\n`,
  );

  if (warnings.length) {
    process.stdout.write(`\n⚠️  ${warnings.length} row(s) needed a guess:\n`);
    for (const w of [...new Set(warnings)]) process.stdout.write(`    · ${w}\n`);
    process.stdout.write("\n");
  }
}

main().catch((err) => {
  process.stderr.write(`update-slotab-events failed: ${err.stack || err}\n`);
  process.exit(1);
});
