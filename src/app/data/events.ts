import sportEventsJson from "./events.json";
import weeklyEventsJson from "./weekly-events.json";
import slotabEventsJson from "./slotab-events.json";

export type EventCategory =
  | "baseball"
  | "softball"
  | "beach-volleyball"
  | "boys-volleyball"
  | "boys-tennis"
  | "boys-swim"
  | "girls-swim"
  | "track-field"
  | "boys-golf"
  | "stunt"
  | "non-sport";

export type SlotabEvent = {
  id: string;
  category: EventCategory;
  categoryLabel: string;
  isSport: boolean;
  date: string; // ISO
  title: string;
  detail?: string;
  isHome?: boolean;
  opponent?: string;
  location?: string;
};

// ---- MaxPreps-sourced varsity sport events ----
type RawSportEvent = {
  sport: string;
  sportLabel: string;
  date: string;
  opponent: string;
  isHome: boolean | null;
};

const sportEvents: SlotabEvent[] = (sportEventsJson as RawSportEvent[]).map(
  (e, i) => ({
    id: `sport-${i}`,
    category: e.sport as EventCategory,
    categoryLabel: e.sportLabel,
    isSport: true,
    date: e.date,
    title: `${e.sportLabel} ${e.isHome ? "vs" : "@"} ${e.opponent}`,
    opponent: e.opponent,
    isHome: e.isHome ?? undefined,
  }),
);

// ---- Weekly events scraped from the SLOHS athletic department Google Sheet ----
// Refreshed by scripts/update-slotab-events.mjs (GitHub Action runs weekly).
// These take precedence over the static MaxPreps import for any overlapping
// week because the weekly sheet has frosh/JV/varsity splits, bus times, and
// last-minute changes the school posts each week.
type WeeklyEvent = {
  id: string;
  category: string;
  categoryLabel: string;
  isSport: boolean;
  date: string;
  title: string;
  detail?: string;
  isHome: boolean;
  opponent: string;
  sourceTab?: string;
};
const weeklyEvents: SlotabEvent[] = (
  (weeklyEventsJson as { events: WeeklyEvent[] }).events ?? []
).map((e) => ({
  ...e,
  category: e.category as EventCategory,
}));

// Weeks already covered by the live weekly sheet — drop any MaxPreps-sourced
// events from those dates so we don't double up with older/stale data.
const weeklyCoveredDates = new Set(
  weeklyEvents.map((e) => e.date.slice(0, 10)),
);

// ---- Track & Field placeholder list ----
// The authoritative T&F schedule lives in two places:
//   1. The SLOHS athletic dept weekly sheet (covers the current ~2 weeks,
//      scraped by scripts/update-slotab-events.mjs — this is the best source).
//   2. Athletic.net for the championship calendar beyond the 2-week window
//      (https://www.athletic.net/team/1865/track-and-field-outdoor/2026).
//      Athletic.net is a fully Angular SPA and its data endpoints are behind
//      CORS from the server-side so we cannot scrape them from Node/GitHub
//      Actions without a headless browser. Future work: wire Playwright into
//      the scraper script to render that page and pull championship meets.
// For now, post-sheet events can be hand-added here (CIF Section,
// CIF State, etc.) and they'll merge in automatically.
const trackEvents: SlotabEvent[] = [];

// ---- SLOTAB non-sport events (meetings, fundraisers, booster events) ----
// Editable via Decap CMS at /admin/#/collections/slotab_events
type RawSlotabEvent = {
  id: string;
  title: string;
  date: string;
  categoryLabel: string;
  detail?: string;
};
const nonSportEvents: SlotabEvent[] = (
  (slotabEventsJson as { events: RawSlotabEvent[] }).events ?? []
).map((e) => ({
  id: e.id,
  category: "non-sport" as EventCategory,
  categoryLabel: e.categoryLabel,
  isSport: false,
  date: e.date,
  title: e.title,
  detail: e.detail,
}));

// Current-month filter: show events from the first of the current month onward
function currentMonthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

// Strip MaxPreps events on dates that the weekly sheet already covers —
// the weekly sheet is more up-to-date and has per-level splits.
const sportEventsFiltered = sportEvents.filter(
  (e) => !weeklyCoveredDates.has(e.date.slice(0, 10)),
);
// Same for the static T&F entry: weekly sheet overrides if present.
const trackEventsFiltered = trackEvents.filter(
  (e) => !weeklyCoveredDates.has(e.date.slice(0, 10)),
);

export const ALL_EVENTS: SlotabEvent[] = [
  ...sportEventsFiltered,
  ...trackEventsFiltered,
  ...weeklyEvents,
  ...nonSportEvents,
]
  .filter((e) => new Date(e.date) >= currentMonthStart())
  .sort((a, b) => a.date.localeCompare(b.date));

// Categories present in the filtered data, in display order
const CATEGORY_ORDER: EventCategory[] = [
  "non-sport",
  "baseball",
  "softball",
  "beach-volleyball",
  "boys-volleyball",
  "boys-tennis",
  "boys-swim",
  "girls-swim",
  "track-field",
  "boys-golf",
  "stunt",
];

export function activeCategories(): {
  key: EventCategory;
  label: string;
  count: number;
}[] {
  const counts = new Map<EventCategory, number>();
  const labels = new Map<EventCategory, string>();
  for (const e of ALL_EVENTS) {
    counts.set(e.category, (counts.get(e.category) ?? 0) + 1);
    labels.set(e.category, e.categoryLabel);
  }
  return CATEGORY_ORDER.filter((c) => counts.get(c)).map((c) => ({
    key: c,
    label: c === "non-sport" ? "SLOTAB Events" : (labels.get(c) ?? c),
    count: counts.get(c) ?? 0,
  }));
}
