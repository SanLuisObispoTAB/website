// Weekly athletics recaps, taken from the "Athletics" section of the SLOHS
// weekly newsletter (sent to families through ParentSquare every Sunday).
//
// The text is the school's own, quoted as written and credited on the page.
// These are narrative recaps, not a scoreboard: there is no score field, and
// nothing here should be read as a complete results record. A week the
// newsletter skips a team simply has no entry for that team.
//
// Edited by the board at /admin → "Athletics News" (one entry per newsletter).

import data from "./athletics-news.json";
import teamsData from "./teams.json";

export type NewsItem = {
  /** Slugs from teams.json. Usually one; a recap covering both water polo
   *  squads lists both, and it then shows on both team pages. */
  teams?: string[];
  /** Lead-in shown above the paragraph, e.g. "Girls Golf". */
  heading: string;
  body: string;
};

export type NewsNotice = {
  title: string;
  body: string;
  links?: { label: string; url: string }[];
};

export type NewsIssue = {
  /** The Sunday the newsletter went out, YYYY-MM-DD. */
  date: string;
  /** The newsletter's own title, e.g. "SLOHS Newsletter, 10.25.26". */
  title: string;
  items: NewsItem[];
  notices?: NewsNotice[];
};

type TeamEntry = { slug: string; hasPage: boolean };
const TEAMS_WITH_PAGES = new Set(
  (teamsData.teams as TeamEntry[]).filter((t) => t.hasPage).map((t) => t.slug),
);

/** Newest newsletter first. */
export const NEWS_ISSUES: NewsIssue[] = [...(data.issues as NewsIssue[])].sort(
  (a, b) => b.date.localeCompare(a.date),
);

export const LATEST_ISSUE: NewsIssue | undefined = NEWS_ISSUES[0];

/** Link to the team's page, when it has one. */
export function teamHref(slug?: string): string | undefined {
  return slug && TEAMS_WITH_PAGES.has(slug) ? `/teams/${slug}` : undefined;
}

/** A team's most recent recaps, newest first, each carrying its issue date. */
export function recentItemsForTeam(
  slug: string,
  limit = 3,
): (NewsItem & { date: string })[] {
  const out: (NewsItem & { date: string })[] = [];
  for (const issue of NEWS_ISSUES) {
    for (const item of issue.items) {
      if (item.teams?.includes(slug)) out.push({ ...item, date: issue.date });
    }
    if (out.length >= limit) break;
  }
  return out.slice(0, limit);
}

const FMT_LONG = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});
const FMT_SHORT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

/** "October 25, 2026". Dates are calendar days, so format in UTC to keep
 *  them from shifting a day in Pacific time. */
export function formatIssueDate(date: string): string {
  return FMT_LONG.format(new Date(`${date}T00:00:00Z`));
}

export function formatIssueDateShort(date: string): string {
  return FMT_SHORT.format(new Date(`${date}T00:00:00Z`));
}

/** Anchor id for an issue on /news, e.g. "week-2026-10-25". */
export function issueAnchor(date: string): string {
  return `week-${date}`;
}

/** The newsletter paragraph usually opens with the team name ("Girls Golf took
 *  4th…"). Split that off so it can be set in bold, the way the newsletter
 *  prints it, without repeating the name. */
export function splitLead(item: NewsItem): { lead?: string; rest: string } {
  if (item.heading && item.body.startsWith(item.heading)) {
    return { lead: item.heading, rest: item.body.slice(item.heading.length) };
  }
  return { rest: item.body };
}
