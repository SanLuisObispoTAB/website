// Shared season helpers for the athletic calendar. Sourced from the date so
// the home carousel, the Teams nav dropdown, and the /teams index all stay in
// sync without manual edits.
//
// Athletic seasons cycle Fall → Winter → Spring. "Year-round" teams are a
// separate bucket that always sorts last.

export type Season = "Fall" | "Winter" | "Spring" | "Year-round";

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
