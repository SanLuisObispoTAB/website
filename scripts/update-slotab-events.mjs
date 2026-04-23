#!/usr/bin/env node
// Scrapes the SLOHS weekly athletics schedule Google Sheet and writes a
// normalized events file at src/app/data/weekly-events.json.
//
// The sheet is maintained weekly by the school. Run this on a cron (GitHub
// Actions) so the SLOTAB preview site stays current.
//
// Sheet: https://docs.google.com/spreadsheets/d/1qWOPM3Shc6bE60kqZrPv-LxmnH89jNDPslzXVFn4AIc/
// CSV export (public): ?format=csv&gid=<tabId>

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const OUTPUT = path.join(
  REPO_ROOT,
  "src/app/data/weekly-events.json",
);

const SHEET_ID = "1qWOPM3Shc6bE60kqZrPv-LxmnH89jNDPslzXVFn4AIc";
const EMBED_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/htmlembed`;
const csvUrlFor = (gid) =>
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;

// Tiger News Network — student-run SLOHS YouTube channel.
const TNN_URL = "https://www.youtube.com/@TNNSLOHS/videos";
const TNN_OUTPUT = path.join(
  REPO_ROOT,
  "src/app/data/tnn-videos.json",
);

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
function categorize(rawSport) {
  const s = rawSport.toLowerCase();
  if (s.includes("beach")) return { category: "beach-volleyball", label: "Beach Volleyball" };
  if (s.includes("boys volleyball") || (s.includes("volleyball") && s.includes("boys")))
    return { category: "boys-volleyball", label: "Boys Volleyball" };
  if (s.includes("volleyball")) return { category: "boys-volleyball", label: "Boys Volleyball" };
  if (s.includes("softball")) return { category: "softball", label: "Softball" };
  if (s.includes("baseball")) return { category: "baseball", label: "Baseball" };
  if (s.includes("lacrosse")) return { category: "boys-lacrosse", label: "Boys Lacrosse" };
  if (s.includes("tennis")) return { category: "boys-tennis", label: "Boys Tennis" };
  if (s.includes("swim") || s.includes("dive")) return { category: "boys-swim", label: "Swim & Dive" };
  if (s.includes("track") || s.includes("field")) return { category: "track-field", label: "Track & Field" };
  if (s.includes("golf")) return { category: "boys-golf", label: "Boys Golf" };
  if (s.includes("stunt") || s.includes("cheer")) return { category: "stunt", label: "Stunt / Cheer" };
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
  // For multi-day ranges, use the first date.
  const clean = dateStr.trim();
  const firstPart = clean.split(/-|–/)[0].trim();
  // Normalize 2-digit year: "4/11/26" → "4/11/2026"
  const m = firstPart.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  let year = m[3] ? Number(m[3]) : new Date().getFullYear();
  if (year < 100) year += 2000;
  // Parse time: "3:30 PM", "12:30 PM, 5:30 PM" (take first), "TBA", "9:00 AM"
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
  // Strip HTML tags from spreadsheet cell values (defense against XSS
  // payloads injected into Google Sheets cells).
  function stripTags(s) {
    return typeof s === "string"
      ? s.replace(/<[^>]+>/g, "").slice(0, 300)
      : "";
  }

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

// Walk a nested object tree (the YouTube ytInitialData blob) collecting every
// video entry we can find. Each hit has videoId, title, publishedTimeText,
// lengthText, viewCountText, thumbnail.
function walkYtVideos(obj, found = [], depth = 0) {
  if (depth > 18 || found.length > 60) return found;
  if (obj && typeof obj === "object" && !Array.isArray(obj)) {
    if (obj.videoId && obj.title) {
      const title =
        typeof obj.title === "string"
          ? obj.title
          : obj.title.simpleText ||
            (obj.title.runs && obj.title.runs[0] && obj.title.runs[0].text);
      const published = obj.publishedTimeText && obj.publishedTimeText.simpleText;
      const length = obj.lengthText && obj.lengthText.simpleText;
      const views = obj.viewCountText && obj.viewCountText.simpleText;
      const thumbs =
        (obj.thumbnail && obj.thumbnail.thumbnails) || [];
      const thumbnail = thumbs.length ? thumbs[thumbs.length - 1].url : null;
      if (title) {
        found.push({
          id: obj.videoId,
          title,
          published,
          duration: length,
          views,
          thumbnail,
        });
      }
    }
    for (const v of Object.values(obj)) walkYtVideos(v, found, depth + 1);
  } else if (Array.isArray(obj)) {
    for (const v of obj) walkYtVideos(v, found, depth + 1);
  }
  return found;
}

// Sport keyword → filter category. Each keyword is used both as a YouTube
// channel search query and as a title substring check (to guard against the
// search picking up unrelated videos). Multiple keywords can point at the
// same category so "swim" and "dive" both land under swim-dive.
const SPORT_KEYWORDS = [
  { kw: "football", category: "football", label: "Football" },
  { kw: "volleyball", category: "volleyball", label: "Volleyball" },
  { kw: "beach volleyball", category: "beach-volleyball", label: "Beach Volleyball" },
  { kw: "basketball", category: "basketball", label: "Basketball" },
  { kw: "soccer", category: "soccer", label: "Soccer" },
  { kw: "baseball", category: "baseball", label: "Baseball" },
  { kw: "softball", category: "softball", label: "Softball" },
  { kw: "water polo", category: "water-polo", label: "Water Polo" },
  { kw: "tennis", category: "tennis", label: "Tennis" },
  { kw: "swim", category: "swim-dive", label: "Swim & Dive" },
  { kw: "wrestling", category: "wrestling", label: "Wrestling" },
  { kw: "lacrosse", category: "lacrosse", label: "Lacrosse" },
  { kw: "track", category: "track-field", label: "Track & Field" },
  { kw: "cross country", category: "cross-country", label: "Cross Country" },
  { kw: "golf", category: "golf", label: "Golf" },
  { kw: "stunt", category: "stunt", label: "Stunt / Cheer" },
  { kw: "cheer", category: "stunt", label: "Stunt / Cheer" },
  { kw: "field hockey", category: "field-hockey", label: "Field Hockey" },
];

async function fetchTnnChannelSearch(query) {
  const url = `https://www.youtube.com/@TNNSLOHS/search?query=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120.0",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!res.ok) {
    throw new Error(`TNN search '${query}' failed: ${res.status}`);
  }
  const html = await res.text();
  const m = html.match(/var ytInitialData\s*=\s*(\{[\s\S]+?\});/);
  if (!m) return [];
  try {
    return walkYtVideos(JSON.parse(m[1]));
  } catch {
    return [];
  }
}

// Approximate age in days from YouTube's fuzzy "Streamed N months ago" string.
function ageDays(pub) {
  if (!pub) return 99999;
  const s = pub.toLowerCase();
  if (/hour|minute|second/.test(s)) return 0;
  const nMatch = s.match(/(\d+)/);
  const n = nMatch ? Number(nMatch[1]) : 1;
  if (/day/.test(s)) return n;
  if (/week/.test(s)) return n * 7;
  if (/month/.test(s)) return n * 30;
  if (/year/.test(s)) return n * 365;
  return 99999;
}

async function fetchTnnVideos() {
  process.stdout.write(`Searching TNN channel for each sport...\n`);

  // Map videoId → { video fields, Set<category>, Set<label> }
  const catalog = new Map();

  for (const entry of SPORT_KEYWORDS) {
    let hits = [];
    try {
      hits = await fetchTnnChannelSearch(entry.kw);
    } catch (err) {
      process.stderr.write(
        `  ! ${entry.kw}: ${err.message} (non-fatal)\n`,
      );
      continue;
    }
    // Only keep videos whose title actually contains the keyword — the channel
    // search is fuzzy and will return weakly-related items otherwise.
    const kw = entry.kw.toLowerCase();
    const matched = hits.filter((v) => v.title.toLowerCase().includes(kw));
    process.stdout.write(`  ${entry.kw}: ${matched.length} matched\n`);
    for (const v of matched) {
      if (!catalog.has(v.id)) {
        catalog.set(v.id, {
          ...v,
          categories: new Set(),
          categoryLabels: new Set(),
        });
      }
      const item = catalog.get(v.id);
      item.categories.add(entry.category);
      item.categoryLabels.add(entry.label);
    }
  }

  // Sanitize scraped values before writing to the data file — YouTube
  // content is untrusted (XSS via crafted video titles, javascript: URIs
  // in thumbnail URLs).
  function sanitize(s) {
    if (typeof s !== "string") return null;
    return s.replace(/<[^>]+>/g, "").slice(0, 300); // strip HTML tags, cap length
  }
  function isValidThumb(url) {
    if (typeof url !== "string") return false;
    try {
      const u = new URL(url);
      return (
        u.protocol === "https:" &&
        (u.hostname.endsWith(".ytimg.com") ||
          u.hostname.endsWith(".ggpht.com") ||
          u.hostname.endsWith(".googleusercontent.com"))
      );
    } catch {
      return false;
    }
  }

  // Finalize: sanitize, serialize sets, sort newest-first. Keep everything
  // we found so less-active sports (wrestling, track, stunt) don't get
  // evicted by the higher-volume ones (basketball, football).
  const videos = [...catalog.values()]
    .map((v) => ({
      id: v.id,
      title: sanitize(v.title) ?? "(untitled)",
      published: sanitize(v.published),
      duration: sanitize(v.duration),
      views: sanitize(v.views),
      thumbnail: isValidThumb(v.thumbnail) ? v.thumbnail : null,
      categories: [...v.categories],
      categoryLabels: [...v.categoryLabels],
    }))
    .sort((a, b) => ageDays(a.published) - ageDays(b.published));

  const payload = {
    source: "https://www.youtube.com/@TNNSLOHS/search",
    channel: {
      handle: "@TNNSLOHS",
      url: "https://www.youtube.com/@TNNSLOHS",
      name: "SLHS - TNN - Tiger News Network",
    },
    fetchedAt: new Date().toISOString(),
    videos,
  };
  fs.mkdirSync(path.dirname(TNN_OUTPUT), { recursive: true });
  fs.writeFileSync(TNN_OUTPUT, JSON.stringify(payload, null, 2) + "\n");
  process.stdout.write(
    `Wrote ${videos.length} sport-tagged TNN videos to ${path.relative(REPO_ROOT, TNN_OUTPUT)}\n`,
  );
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

  // Grab the latest TNN videos too. Failures here are non-fatal — YouTube's
  // scraping-unfriendly layout can change. Log and continue.
  try {
    await fetchTnnVideos();
  } catch (err) {
    process.stderr.write(`TNN scrape failed (non-fatal): ${err.message}\n`);
  }
}

main().catch((err) => {
  process.stderr.write(`update-slotab-events failed: ${err.stack || err}\n`);
  process.exit(1);
});
