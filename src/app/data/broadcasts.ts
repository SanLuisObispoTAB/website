// Helpers for the broadcast catalog (Hudl vCloud games on /watch + team
// pages). Status is COMPUTED, not stored — see broadcasts.json's note.

import broadcastsData from "./broadcasts.json";
import teamsData from "./teams.json";

export type Broadcast = {
  broadcastId: string;
  title: string;
  sport: string; // matches a slug in teams.json
  date: string; // ISO with TZ
  durationMinutes?: number;
  opponent?: string;
  isHome?: boolean;
  description?: string;
};

export type BroadcastStatus = "upcoming" | "live" | "archive";

const DEFAULT_DURATION_MINUTES = 150; // 2.5h covers most HS games + halftime

const ALL_BROADCASTS: Broadcast[] = broadcastsData.broadcasts as Broadcast[];

const TEAMS_BY_SLUG = new Map(
  (teamsData.teams as { slug: string; name: string; gender: string }[]).map(
    (t) => [t.slug, t],
  ),
);

export const CHANNEL = broadcastsData.channel;

/** All broadcasts, sorted by date descending (most-recent first). */
export function allBroadcasts(): Broadcast[] {
  return [...ALL_BROADCASTS].sort((a, b) => b.date.localeCompare(a.date));
}

/** One broadcast, or undefined. */
export function getBroadcast(broadcastId: string): Broadcast | undefined {
  return ALL_BROADCASTS.find((b) => b.broadcastId === broadcastId);
}

/** Broadcasts for a given sport slug (matches teams.json), most-recent first. */
export function broadcastsForSport(sportSlug: string): Broadcast[] {
  return allBroadcasts().filter((b) => b.sport === sportSlug);
}

/** Compute live/upcoming/archive from date + optional durationMinutes. */
export function statusOf(b: Broadcast, now: Date = new Date()): BroadcastStatus {
  const start = new Date(b.date).getTime();
  const end =
    start + (b.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60 * 1000;
  const n = now.getTime();
  if (n < start) return "upcoming";
  if (n < end) return "live";
  return "archive";
}

/** The featured broadcast for the /watch hero: prefer live, then next
 *  upcoming, then most-recent archive. Undefined if catalog is empty. */
export function featuredBroadcast(
  now: Date = new Date(),
): Broadcast | undefined {
  const sorted = allBroadcasts();
  const live = sorted.find((b) => statusOf(b, now) === "live");
  if (live) return live;
  const upcoming = sorted
    .filter((b) => statusOf(b, now) === "upcoming")
    .sort((a, b) => a.date.localeCompare(b.date))[0];
  if (upcoming) return upcoming;
  return sorted.find((b) => statusOf(b, now) === "archive");
}

/** Human-readable label for the sport slug (e.g. "Girls Volleyball"). */
export function sportLabel(sportSlug: string): string {
  const t = TEAMS_BY_SLUG.get(sportSlug);
  if (!t) return sportSlug;
  return t.gender === "Co-ed" ? t.name : `${t.gender} ${t.name}`;
}

/** Sport-specific fallback thumbnail (the same photo used on the team
 *  card on the home page seasonal carousel). Imported lazily by callers. */
export const SPORT_FALLBACK_PHOTOS: Record<string, string> = {
  football: "/photos/bfball-fbspargo-1200x857.jpg",
  "girls-volleyball": "/photos/gvball-ahopple.jpg",
  "boys-volleyball": "/photos/bvball-milla.jpg",
  "beach-volleyball": "/photos/gbvball-ruby-1200x675.png",
  baseball: "/photos/bbaseball-team-1200x906.png",
  softball: "/photos/gsball-1200x960.jpg",
  "boys-tennis": "/photos/btennis-2026champs.jpg",
  "girls-tennis": "/photos/gtennis-team-2025.jpg",
  "boys-water-polo": "/photos/bwpolo-2.jpg",
  "girls-water-polo": "/photos/gwpolo.jpg",
  "boys-basketball": "/photos/bbball-e1765386832968.jpg",
  "girls-basketball": "/photos/gbball-goodwin-1200x900.jpg",
  "boys-soccer": "/photos/bsoccer-1200x800.jpg",
  "girls-soccer": "/photos/gsoccer-old-addisoccerupdate.jpeg",
  "boys-cross-country": "/photos/bXC-team-2025.jpg",
  "girls-cross-country": "/photos/gXC-team-2025.jpg",
  "track-field": "/photos/ctrack-1200x800.jpg",
  "boys-swim-dive": "/photos/bswim-image-0.jpg",
  "girls-swim-dive": "/photos/gswim-10.jpg",
  "boys-golf": "/photos/bgolf-jonnygolf.jpg",
  "girls-golf": "/photos/ggolf-5-1200x896.jpg",
  "boys-wrestling": "/photos/bwrestling-team-2026.jpg",
  "girls-wrestling": "/photos/gwrestling-team-2026.jpg",
  "flag-football": "/photos/gfball-saff7-1200x900.jpg",
  cheer: "/photos/ccheering-taryn.jpg",
  "competitive-cheer": "/photos/ccompcheer-2025.jpg",
  stunt: "/photos/cstunt-CHafourd.jpg",
};

/** Public-facing vCloud embed URL. */
export function embedUrl(
  broadcastId: string,
  opts: { autoplay?: boolean } = {},
): string {
  const params = new URLSearchParams();
  params.set("autoplay", opts.autoplay ? "1" : "0");
  return `https://vcloud.hudl.com/broadcast/embed/${broadcastId}?${params.toString()}`;
}
