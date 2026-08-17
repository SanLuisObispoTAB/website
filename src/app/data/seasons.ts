// Shared season helpers for the athletic calendar. Sourced from the date so
// the home carousel, the Teams nav dropdown, and the /teams index all stay in
// sync without manual edits.
//
// Athletic seasons cycle Fall → Winter → Spring. "Year-round" teams are a
// separate bucket that always sorts last.

export type Season = "Fall" | "Winter" | "Spring" | "Year-round";

/** A team that competes across more than one season, which "Year-round" does
 *  not describe. Tiger Cheer is the case that forced this: it fields Varsity,
 *  JV Black, JV Gold and Frosh sideline teams in Fall and a *separate* Varsity
 *  sideline team in Winter, but nothing in Spring — so a single `season` made
 *  it vanish from the nav every December, and "Year-round" would have wrongly
 *  claimed a Spring season too.
 *
 *  `seasons` wins over `season` when present, mirroring the singular/plural
 *  pattern already used for headCoach→headCoaches and teamPhoto→teamPhotos. */
export type SeasonedTeam = { season: string; seasons?: string[] };

export function teamSeasons(t: SeasonedTeam): string[] {
  return t.seasons && t.seasons.length > 0 ? t.seasons : [t.season];
}

/** True when the team is in play during `season`. "Year-round" in the list
 *  matches every season, preserving the previous single-field behaviour. */
export function teamInSeason(t: SeasonedTeam, season: string): boolean {
  const list = teamSeasons(t);
  return list.includes(season) || list.includes("Year-round");
}

/** Athletic season for "in play now" surfaces (e.g. the home carousel).
 *  Summer (Jul) keeps showing Spring as the most-recent season in play. */
export function currentSeason(): Exclude<Season, "Year-round"> {
  const m = new Date().getMonth(); // 0-11
  if (m >= 7 && m <= 9) return "Fall"; // Aug-Oct
  if (m === 10 || m === 11 || m === 0 || m === 1) return "Winter"; // Nov-Feb
  return "Spring"; // Mar-Jun + Jul
}

/** Season the Teams nav + index should lead with: the in-season one, except
 *  during the summer break (Jun-Jul) when we preview the *upcoming* Fall. */
export function navSeason(): Exclude<Season, "Year-round"> {
  const m = new Date().getMonth(); // 0-11
  if (m === 5 || m === 6) return "Fall"; // Jun-Jul → preview the upcoming Fall
  return currentSeason();
}

const CYCLE: Array<Exclude<Season, "Year-round">> = ["Fall", "Winter", "Spring"];

/** The three athletic seasons rotated so the current/upcoming season leads,
 *  followed by the next two in calendar order, with "Year-round" appended.
 *  June → Fall, Winter, Spring · winter → Winter, Spring, Fall. */
export function orderedSeasons(): Season[] {
  const lead = navSeason();
  const i = CYCLE.indexOf(lead);
  return [CYCLE[i], CYCLE[(i + 1) % 3], CYCLE[(i + 2) % 3], "Year-round"];
}
