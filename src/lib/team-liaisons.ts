import baseball from "../app/data/teams/baseball.json";
import boysBasketball from "../app/data/teams/boys-basketball.json";
import boysSoccer from "../app/data/teams/boys-soccer.json";
import boysWaterPolo from "../app/data/teams/boys-water-polo.json";
import boysWrestling from "../app/data/teams/boys-wrestling.json";
import cheer from "../app/data/teams/cheer.json";
import competitiveCheer from "../app/data/teams/competitive-cheer.json";
import crossCountry from "../app/data/teams/cross-country.json";
import dance from "../app/data/teams/dance.json";
import flagFootball from "../app/data/teams/flag-football.json";
import football from "../app/data/teams/football.json";
import girlsBasketball from "../app/data/teams/girls-basketball.json";
import girlsGolf from "../app/data/teams/girls-golf.json";
import girlsSoccer from "../app/data/teams/girls-soccer.json";
import girlsSwimDive from "../app/data/teams/girls-swim-dive.json";
import girlsTennis from "../app/data/teams/girls-tennis.json";
import girlsVolleyball from "../app/data/teams/girls-volleyball.json";
import girlsWaterPolo from "../app/data/teams/girls-water-polo.json";
import girlsWrestling from "../app/data/teams/girls-wrestling.json";
import stunt from "../app/data/teams/stunt.json";
import trackField from "../app/data/teams/track-field.json";
import winterCheer from "../app/data/teams/winter-cheer.json";

// Who to tell when a gift is designated to a team.
//
// WHY THIS FILE EXISTS AT ALL
// The donation notification (#187) is a to-do list, and "let the team know
// $1,875 just arrived for them" is on it. The liaisons are already in the team
// JSONs — but every other consumer of those files is a *route*, which imports
// exactly the one file it renders. A webhook has a slug and no idea which file
// that is, so the twenty-two imports have to be written out somewhere.
//
// Static imports rather than `fs.readdir`, deliberately: this runs in a
// serverless function, and a directory read depends on Next's file tracing
// having bundled files nothing appears to import. An import that is wrong
// fails the build; a trace that is wrong fails in production at the moment a
// donation lands.
//
// ADDING A TEAM: add its import and its row below. `npm run build` will not
// catch a missing row — `liaisonsForTeam` simply returns none, and the
// checklist quietly stops naming anyone for that sport.

export type Liaison = { name: string; email: string };

// `unknown` rather than a liaison-shaped type: nine of the twenty-two files
// have no `liaisons` key at all, and a type claiming otherwise makes those
// imports a compile error. The narrowing happens once, below.
const TEAM_FILES: Record<string, unknown> = {
  "baseball": baseball,
  "boys-basketball": boysBasketball,
  "boys-soccer": boysSoccer,
  "boys-water-polo": boysWaterPolo,
  "boys-wrestling": boysWrestling,
  "cheer": cheer,
  "competitive-cheer": competitiveCheer,
  "cross-country": crossCountry,
  "dance": dance,
  "flag-football": flagFootball,
  "football": football,
  "girls-basketball": girlsBasketball,
  "girls-golf": girlsGolf,
  "girls-soccer": girlsSoccer,
  "girls-swim-dive": girlsSwimDive,
  "girls-tennis": girlsTennis,
  "girls-volleyball": girlsVolleyball,
  "girls-water-polo": girlsWaterPolo,
  "girls-wrestling": girlsWrestling,
  "stunt": stunt,
  "track-field": trackField,
  "winter-cheer": winterCheer,
};

/** The named liaisons for a team slug, or an empty array.
 *
 *  Placeholders are filtered out. Team pages carry a `"Liaison TBD"` row so the
 *  quick-facts band isn't empty (see CLAUDE.md), and telling the Membership VP
 *  to email "Liaison TBD" is worse than telling her there is nobody yet. */
export function liaisonsForTeam(slug: string): Liaison[] {
  const file = TEAM_FILES[slug] as { liaisons?: Liaison[] } | undefined;
  const raw = file?.liaisons ?? [];
  return raw.filter(
    (l) => l.email && !/^liaison\s+tbd$/i.test(l.name.trim()),
  );
}
