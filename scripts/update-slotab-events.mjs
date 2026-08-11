#!/usr/bin/env node
// Scrapes the SLOHS weekly athletics schedule Google Sheet and writes a
// normalized events file at src/app/data/weekly-events.json.
//
// The sheet is maintained weekly by the school. Run this on a cron (GitHub
// Actions) so the SLOTAB site stays current.
//
// Sheet: https://docs.google.com/spreadsheets/d/1qWOPM3Shc6bE60kqZrPv-LxmnH89jNDPslzXVFn4AIc/
// CSV export (public): ?format=csv&gid=<tabId>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(REPO_ROOT, "src/app/data/weekly-events.json");

const SHEET_ID = "1qWOPM3Shc6bE60kqZrPv-LxmnH89jNDPslzXVFn4AIc";
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlembed`;
const csvUrlFor = (gid) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

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

// Map the free-text sport string from the sheet to our category keys.
// Keep the mapping loose and forgiving — the sheet is hand-edited each week.
// Gender-aware as of 2026-08-11: the old version sent every volleyball row to
// "boys-volleyball" and had no fall sports at all, so this fall's girls
// volleyball, football, water polo, and cross country would have been
// mislabelled or dropped to non-sport the moment the school filled the sheet in.
function categorize(rawSport) {
  const s = rawSport.toLowerCase();
  const girls = /\b(girls?|women'?s|g)\b/.test(s);
  const boys = /\b(boys?|men'?s|b)\b/.test(s);

  // Order matters: the more specific string has to win. "Flag Football"
  // must be tested before "football", "beach" before "volleyball", and
  // "cross country" before anything matching "country".
  if (s.includes("flag")) return { category: "flag-football", label: "Girls Flag Football" };
  if (s.includes("football")) return { category: "football", label: "Football" };
  if (s.includes("water polo") || s.includes("waterpolo"))
    return girls
      ? { category: "girls-water-polo", label: "Girls Water Polo" }
      : { category: "boys-water-polo", label: "Boys Water Polo" };
  if (s.includes("cross country") || s.includes("xc"))
    return { category: "cross-country", label: "Cross Country" };
  if (s.includes("beach")) return { category: "beach-volleyball", label: "Beach Volleyball" };
  if (s.includes("volleyball"))
    return girls
      ? { category: "girls-volleyball", label: "Girls Volleyball" }
      : { category: "boys-volleyball", label: "Boys Volleyball" };
  if (s.includes("softball")) return { category: "softball", label: "Softball" };
  if (s.includes("baseball")) return { category: "baseball", label: "Baseball" };
  if (s.includes("basketball")) return { category: "basketball", label: girls ? "Girls Basketball" : "Boys Basketball" };
  if (s.includes("soccer")) return { category: "soccer", label: girls ? "Girls Soccer" : "Boys Soccer" };
  if (s.includes("wrestl")) return { category: "wrestling", label: girls ? "Girls Wrestling" : "Boys Wrestling" };
  if (s.includes("tennis"))
    return girls
      ? { category: "girls-tennis", label: "Girls Tennis" }
      : { category: "boys-tennis", label: "Boys Tennis" };
  if (s.includes("swim") || s.includes("dive"))
    return girls
      ? { category: "girls-swim", label: "Girls Swim & Dive" }
      : { category: "boys-swim", label: "Boys Swim & Dive" };
  if (s.includes("golf"))
    return girls
      ? { category: "girls-golf", label: "Girls Golf" }
      : { category: "boys-golf", label: "Boys Golf" };
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
  let hours = 12;
  let minutes = 0;
  const tm = (timeStr || "").split(",")[0].trim();
  const tmatch = tm.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (tmatch) {
    hours = Number(tmatch[1]);
    minutes = Number(tmatch[2]);
    const ampm = (tmatch[3] || "").toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
  }
  const d = new Date(year, month - 1, day, hours, minutes);
  return d.toISOString().replace(/\.\d{3}Z$/, "");
}

function isHome(location) {
  const loc = (location || "").toLowerCase();
  return loc.includes("slohs") || loc.includes("slo hs") || loc === "home";
}

// Strip HTML tags from spreadsheet cell values — defense against XSS
// payloads injected into Google Sheets cells.
function stripTags(s) {
  return typeof s === "string" ? s.replace(/<[^>]+>/g, "").slice(0, 300) : "";
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
  if (headerIdx < 0) return [];

  const events = [];
  for (const row of rows.slice(headerIdx + 1)) {
    if (!row || !row[0] || !row[0].trim()) continue;
    const [sport, date, _day, opponent, location, startTime] = row.map(stripTags);
    const iso = parseDate(date, startTime);
    if (!iso) continue;
    const { category, label } = categorize(sport);
    const home = isHome(location);
    const cleanSport = sport.replace(/\s*\([^)]*\)\s*/g, "").trim();
    const cleanOpp = (opponent || "").trim();
    events.push({
      id: `weekly-${iso.slice(0, 10)}-${category}-${cleanOpp.replace(/\W+/g, "-").toLowerCase().slice(0, 24)}`,
      category,
      categoryLabel: label,
      isSport: category !== "non-sport",
      date: iso,
      title: `${cleanSport} ${home ? "vs" : "@"} ${cleanOpp}`,
      detail: location || undefined,
      isHome: home,
      opponent: cleanOpp,
      sourceTab: name,
    });
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

  // Deduplicate: same iso date + category + opponent
  const seen = new Set();
  const unique = [];
  for (const e of allEvents) {
    const key = `${e.date}-${e.category}-${e.opponent}`;
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
}

main().catch((err) => {
  process.stderr.write(`update-slotab-events failed: ${err.stack || err}\n`);
  process.exit(1);
});
