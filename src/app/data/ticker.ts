// What the black ticker bar under the banner carries (#266).
//
// Built on the server (layout.tsx) and handed to the client TopBar, so the
// event list and the news archive never ship to the browser. The browser
// still drops anything dated before today — the site only rebuilds when
// something is pushed, and without that a game from three days ago could
// still read "NEXT UP" (TopBar.tsx).
//
// Sources: the athletic department's weekly sheet (refreshed by the GitHub
// Action, now daily), the manual schedule fallback, SLOTAB's own events, and
// the newest Tiger News week.

import { ALL_EVENTS } from "./events";
import { LATEST_ISSUE, formatIssueDateShort, issueAnchor } from "./athletics-news";

export type TickerItem = {
  tag?: string;
  text: string;
  score?: string;
  /** ISO date for dated events: the browser drops it once it's past and
   *  labels the first remaining one "NEXT UP". */
  date?: string;
  href?: string;
};

/** Enough events that the browser still has six after dropping a few days'
 *  worth that have passed since the build. */
const EVENT_BUFFER = 14;

export function buildTickerItems(): TickerItem[] {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);

  const events: TickerItem[] = ALL_EVENTS.filter(
    (e) => new Date(e.date) >= todayMidnight,
  )
    .slice(0, EVENT_BUFFER)
    .map((e) => ({
      date: e.date,
      text: e.title,
      score: e.isHome === true ? "HOME" : undefined,
    }));

  const news: TickerItem[] = LATEST_ISSUE
    ? [
        {
          tag: "TIGER NEWS",
          text: `Week of ${formatIssueDateShort(LATEST_ISSUE.date)} recaps are up — read them →`,
          href: `/news#${issueAnchor(LATEST_ISSUE.date)}`,
        },
      ]
    : [];

  // A standing line always rides at the end, so the bar is never empty and
  // never repeats a single dated item three times (TopBar triples its items
  // to loop the marquee).
  const standing: TickerItem = {
    tag: "GO TIGERS",
    text: "Watch here for game day updates",
  };

  return [...news, ...events, standing];
}
