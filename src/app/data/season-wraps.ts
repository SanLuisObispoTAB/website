// End-of-season wrap-ups: one page per athletic season celebrating what each
// team accomplished (decision #268). Data in season-wraps.json, edited at
// /admin → Athletics News → "Season Wrap-ups"; rendered at /news/<id> (e.g. /news/fall-2026).
//
// Unlike the weekly recaps, this is SLOTAB's own writing, summarized from
// those recaps, so every fact should trace back to a week on /news. Same
// rule as the recaps: it celebrates titles, playoff runs and honors, and is
// not a scoreboard (#131, #193).

import data from "./season-wraps.json";
import { teamHref } from "./athletics-news";
import { TEAM_PHOTO_BY_SLUG } from "./team-photos";

export type WrapTeam = {
  /** teams.json slugs; the first one drives the link and the photo. */
  teams: string[];
  name: string;
  headline: string;
  highlights: string[];
  /** A result still to come (an individual at a section meet, a team at
   *  State). Shows a "Still competing" tag; delete it when the result lands. */
  stillCompeting?: string;
};

export type SeasonWrap = {
  /** URL slug: /news/<id>. */
  id: string;
  season: string;
  schoolYear: string;
  title: string;
  /** YYYY-MM-DD */
  published: string;
  updated?: string;
  intro: string;
  teams: WrapTeam[];
  thanks?: { title: string; body: string };
};

/** Newest first. */
export const SEASON_WRAPS: SeasonWrap[] = [...(data.wraps as SeasonWrap[])].sort(
  (a, b) => b.published.localeCompare(a.published),
);

export function getWrap(id: string): SeasonWrap | undefined {
  return SEASON_WRAPS.find((w) => w.id === id);
}

/** How long a wrap stays featured on the home page and atop /news. Long
 *  enough to carry it through the next season's first weeks, short enough
 *  that "Fall in review" isn't still headlining in spring. */
const FEATURE_DAYS = 75;

/** The wrap to feature right now, if any. Evaluated at build time like the
 *  rest of the site's date logic; the weekly cron deploy keeps it current. */
export function featuredWrap(now: Date = new Date()): SeasonWrap | undefined {
  const w = SEASON_WRAPS[0];
  if (!w) return undefined;
  const ageDays =
    (now.getTime() - new Date(`${w.published}T00:00:00`).getTime()) / 86_400_000;
  return ageDays >= 0 && ageDays <= FEATURE_DAYS ? w : undefined;
}

export function wrapTeamHref(t: WrapTeam): string | undefined {
  return teamHref(t.teams[0]);
}

export function wrapTeamPhoto(t: WrapTeam): string | undefined {
  return TEAM_PHOTO_BY_SLUG[t.teams[0]];
}

/** Teams with a result still to come. */
export function pendingTeams(w: SeasonWrap): WrapTeam[] {
  return w.teams.filter((t) => t.stillCompeting);
}

const LONG_DATE = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
export function formatWrapDate(iso: string): string {
  return LONG_DATE.format(new Date(`${iso}T00:00:00Z`));
}
