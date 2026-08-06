// Shared slug → photo map. Sourced from the curated team photo library
// (#53, #58, #66, #70). **RULE (#72, #85): every entry here MUST be an
// action / game shot whenever the library has one — never a formal/posed
// team portrait. Portraits live on the team page via `teamPhoto`. A posed
// shot is acceptable here ONLY when no action shot exists for that team
// yet (currently: baseball, boys/girls cross-country, girls wrestling —
// swap to an action shot the moment one arrives).**
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
  "boys-cross-country": "/photos/bXC-team-2025.jpg",
  "girls-cross-country": "/photos/gXC-team-2025.jpg",
  "track-field": "/photos/ctrack-1200x800.jpg",
  "boys-swim-dive": "/photos/bswim-image-0.jpg",
  "girls-swim-dive": "/photos/gswim-stroke.jpg",
  "boys-golf": "/photos/bgolf-jonnygolf.jpg",
  "girls-golf": "/photos/ggolf-5-1200x896.jpg",
  "boys-wrestling": "/photos/bwrestling-action.jpg",
  "girls-wrestling": "/photos/gwrestling-team-2026.jpg",
  "flag-football": "/photos/gfball-saff7-1200x900.jpg",
  dance: "/photos/ccheering-sideline-2025.jpg",
  stunt: "/photos/cstunt-CHafourd.jpg",
};

export const FALLBACK_TEAM_PHOTO = "/photos/cstudent-section.jpg";

export function teamPhotoFor(slug: string): string {
  return TEAM_PHOTO_BY_SLUG[slug] ?? FALLBACK_TEAM_PHOTO;
}
