import type { MetadataRoute } from "next";
import teamsData from "./data/teams.json";

// Public routes only. Deliberately excluded: /admin and /admin-portal (board
// tooling), /board/* (password-gated), /spring-social (an unlinked page
// still describing the April 2026 edition — see decision #94), and
// /preview/hof-fund (an unlisted draft of the Hall of Fame fundraising block,
// sent to the AD for review — #185; it also carries its own `noindex`).
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
