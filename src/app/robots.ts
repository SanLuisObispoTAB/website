import type { MetadataRoute } from "next";

// Board tooling is kept out of crawlers here as well as behind the password
// gate / noindex metadata — belt and braces, since /admin-portal is only
// unlisted, not authenticated (see the open item in docs/project-status.md).
//
// Non-canonical hosts are handled separately: src/proxy.ts sends
// `X-Robots-Tag: noindex` for anything that isn't slotab.org, which takes
// precedence over whatever this file says on those hosts.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/admin-portal", "/board"],
    },
    sitemap: "https://slotab.org/sitemap.xml",
    host: "https://slotab.org",
  };
}
