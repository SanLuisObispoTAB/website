import type { MetadataRoute } from "next";
import teamsData from "./data/teams.json";

// Public routes only. Deliberately excluded: /admin and /admin-portal (board
// tooling), /board/* (password-gated), and /spring-social (an unlinked page
// still describing the April 2026 edition — see decision #94).
//
// /preview/passes and its two variants are excluded on the same grounds: they
// are an unlisted board prototype of the giving flow (#208), and a half-live
// second copy of a payment form is the last thing that should be in a sitemap.
// Delete the folder — and this note — when the board picks a layout.
//
// /preview/hof-fund used to be listed here too. It was deleted when the Hall of
// Fame band went live (#189) — the whole point of an unlisted review copy is
// that it stops existing once the real page carries the thing it was previewing.
const STATIC_ROUTES = [
  "",
  "/about",
  "/contact",
  "/donate",
  "/membership",
  "/season-passes",
  "/volunteer",
  "/impact",
  "/hall-of-fame",
  // The fund's own campaign page (#210). Listed for the same reason /donate is:
  // it is a public page an alumnus may reasonably search for.
  "/hall-of-fame/donate",
  "/upcoming",
  "/back-to-school",
  "/booster-bash",
  "/watch",
  "/merch",
  "/teams",
];

type TeamEntry = { slug: string; hasPage: boolean };

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://slotab.org";
  const lastModified = new Date();

  const teamRoutes = (teamsData.teams as TeamEntry[])
    .filter((t) => t.hasPage)
    .map((t) => `/teams/${t.slug}`);

  return [...STATIC_ROUTES, ...teamRoutes].map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "" || path === "/upcoming" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.7,
  }));
}
