// Shared slug → photo map. Sourced from the curated team photo library
// (#53, #58, #66, #70). **RULE (#72, #85): every entry here MUST be an
// action / game shot whenever the library has one — never a formal/posed
// team portrait. Portraits live on the team page via `teamPhoto`. A posed
// shot is acceptable here ONLY when no action shot exists for that team
// yet (currently: baseball and girls wrestling — swap to an action shot
// the moment one arrives. Cross country was retired from this list on
// 2026-08-11 when the CIF Championship photo landed — decision #111).**
// New convention: first letter b/g/c (boys/girls/co-ed), then short
// sport name. Note: `bball` = basketball, `bbaseball` = baseball (the
// latter required because `bball` would otherwise collide).
//
// Used by:
// - components/tiger/TeamsCarousel.tsx (home page seasonal carousel)
// - app/teams/page.tsx (the full sport index)

export const TEAM_PHOTO_BY_SLUG: Record<string, string> = {
  football: "/photos/bfball-fbspargo-1200x857.jpg",
  "girls-volleyball": "/photos/gvball-slogv-2022.jpg",
  "boys-volleyball": "/photos/bvball-spike.jpg",
  "beach-volleyball": "/photos/gbvball-serve-swanson.jpg",
  baseball: "/photos/bbaseball-team-1200x906.png",
  softball: "/photos/gsball-london.jpg",
  "boys-tennis": "/photos/btennis-serve.jpg",
  "girls-tennis": "/photos/gtennis-killenberger.jpg",
  "boys-water-polo": "/photos/bwpolo-2.jpg",
  "girls-water-polo": "/photos/gwpolo.jpg",
  "boys-basketball": "/photos/bbball-shot-394.jpg",
  "girls-basketball": "/photos/gbball-hartford.jpg",
  "boys-soccer": "/photos/bsoccer-keeper-save.jpg",
  "girls-soccer": "/photos/gsoccer-celebration.jpg",
  "cross-country": "/photos/cXC-cif-champions-2025.jpg",
  "track-field": "/photos/ctrack-1200x800.jpg",
  "boys-swim-dive": "/photos/bswim-image-0.jpg",
  "girls-swim-dive": "/photos/gswim-stroke.jpg",
  "boys-golf": "/photos/bgolf-jonnygolf.jpg",
  "girls-golf": "/photos/ggolf-5-1200x896.jpg",
  "boys-wrestling": "/photos/bwrestling-action.jpg",
  "girls-wrestling": "/photos/gwrestling-team-2026.jpg",
  "flag-football": "/photos/gfball-saff7-1200x900.jpg",
  cheer: "/photos/ccheer-fall-stunts-2025.jpg",
  // Real performance action, from Coach Mettler's photo drop the same day the
  // page was built — so the posed exception this entry carried for a matter of
  // hours (#171) is already gone. Cal Poly Showcase, Feb 2026 (#172).
  dance: "/photos/gdance-showcase-poms-2026.jpg",
  // Real winter action, supplied by the coach 2026-08-17 — supersedes the
  // squad-portrait guess this entry previously carried.
  "winter-cheer": "/photos/ccheer-winter-tigers-2026.jpg",
  // Still posed, and still the exception rather than the rule: the coach's
  // 2026-08-17 drop included plenty of cheer action, but all of it is
  // *sideline* — fall on the football field, winter in the gym. TCC competes
  // on a mat and none of its competition was photographed, so this is the
  // official squad portrait. Swap it the moment a competition shot arrives.
  "competitive-cheer": "/photos/ccompcheer-team-2026.jpg",
  stunt: "/photos/cstunt-CHafourd.jpg",
};

export const FALLBACK_TEAM_PHOTO = "/photos/cstudent-section.jpg";

export function teamPhotoFor(slug: string): string {
  return TEAM_PHOTO_BY_SLUG[slug] ?? FALLBACK_TEAM_PHOTO;
}

/** Co-ed programs that run boys and girls as one team (decision #110).
 *  Their index card shows one squad at random and flips to the other on
 *  hover, so neither squad is permanently the face of the program.
 *
 *  A slug belongs here only when BOTH squads have a photo. Track & field
 *  is co-ed too but has no per-squad photos yet — it falls back to the
 *  single co-ed shot in TEAM_PHOTO_BY_SLUG until they arrive. Adding its
 *  two photos here is the only step needed to switch it on. */
export const TEAM_PHOTO_PAIR_BY_SLUG: Record<
  string,
  { boys: string; girls: string }
> = {
  "cross-country": {
    boys: "/photos/bXC-team-2025.jpg",
    girls: "/photos/gXC-team-2025.jpg",
  },
};

export function teamPhotoPairFor(
  slug: string,
): { boys: string; girls: string } | null {
  return TEAM_PHOTO_PAIR_BY_SLUG[slug] ?? null;
}
