// Shared slug → photo map. Sourced from the curated team photo library
// (#53, #58, #66, #70). Action shots, not formal portraits — the
// portraits live on individual team pages via the `teamPhoto` field.
// New convention: first letter b/g/c (boys/girls/co-ed), then short
// sport name. Note: `bball` = basketball, `bbaseball` = baseball (the
// latter required because `bball` would otherwise collide).
//
// Used by:
// - components/tiger/TeamsCarousel.tsx (home page seasonal carousel)
// - app/teams/page.tsx (the full sport index)

export const TEAM_PHOTO_BY_SLUG: Record<string, string> = {
  football: "/photos/bfball-fbspargo-1200x857.jpg",
  "girls-volleyball": "/photos/gvball-ahopple.jpg",
  "boys-volleyball": "/photos/bvball-milla.jpg",
  "beach-volleyball": "/photos/gbvball-serve-swanson.jpg",
  baseball: "/photos/bbaseball-baileyhartford.jpg",
  softball: "/photos/gsball-london.jpg",
  "boys-tennis": "/photos/btennis-2026champs.jpg",
  "girls-tennis": "/photos/gtennis-killenberger.jpg",
  "boys-water-polo": "/photos/bwpolo-2.jpg",
  "girls-water-polo": "/photos/gwpolo.jpg",
  "boys-basketball": "/photos/bbball-shot-394.jpg",
  "girls-basketball": "/photos/gbball-goodwin-1200x900.jpg",
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
  cheer: "/photos/ccheering-taryn.jpg",
  "competitive-cheer": "/photos/ccompcheer-2025.jpg",
  stunt: "/photos/cstunt-CHafourd.jpg",
};

export const FALLBACK_TEAM_PHOTO = "/photos/cstudent-section.jpg";

export function teamPhotoFor(slug: string): string {
  return TEAM_PHOTO_BY_SLUG[slug] ?? FALLBACK_TEAM_PHOTO;
}
