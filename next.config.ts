import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// LEGACY `.htm` URLS — the pre-WordPress slotab.org
//
// Before the WordPress site, slotab.org was a hand-built `.htm` site. These
// URLs survive only in search results and long-lived bookmarks, and every one
// of them was landing on a bare 404 after the 2026-08-15 cutover.
//
// These live here rather than in `src/proxy.ts` (where the WordPress-era URLs
// are handled) for two reasons. The proxy's matcher deliberately skips any
// path containing a dot, so `.htm` never reaches it. And the cache-eviction
// header the proxy attaches would be wasted here anyway: a visitor following a
// decade-old bookmark is not someone holding a fresh cached copy of the
// pre-cutover homepage.
//
// Every entry is a URL verified to have existed, from the Internet Archive's
// record of the domain — none of these are guesses.
const LEGACY_HTM_URLS: Array<[source: string, destination: string]> = [
  ["/home.htm", "/"],
  ["/about-us.htm", "/about"],
  // Board roster lives on /contact. NOT /board — that's the password-gated
  // Board Hub, and sending the public there would be a dead end behind a
  // login prompt.
  ["/board.htm", "/contact"],
  ["/sport-liaisons.htm", "/contact"],
  ["/contact.htm", "/contact"],
  ["/membership.htm", "/membership"],
  ["/calendar.htm", "/upcoming"],
  ["/meetings.htm", "/upcoming"],
  ["/booster-bash.htm", "/booster-bash"],
  ["/casino-night.htm", "/booster-bash"],
  ["/booster-funds.htm", "/impact"],
  // Photos now live on the team pages rather than in one gallery.
  ["/photos.htm", "/teams"],
  ["/youth-sports-camp.htm", "/"],
  // Salient theme demo posts, all dated 2014-05-13 and never real content.
  // Indexed anyway, so they're worth catching rather than 404ing.
  ["/2014/:path*", "/"],
];

// Routes a business is likely to *guess* rather than be given. The Sponsorship
// lead directs businesses to "the website" verbally, so /sponsors is a very
// plausible first try — and it 404'd. Unlike LEGACY_HTM_URLS above these were
// never live URLs; they are here because sponsorship enrolment is an active
// campaign and a guessed URL should land on the page that serves it.
const GUESSED_URLS: Array<[source: string, destination: string]> = [
  ["/sponsors", "/membership"],
  ["/sponsor", "/membership"],
  ["/sponsorship", "/membership"],
  ["/sponsorships", "/membership"],
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Force HTTPS for a year. Intentionally NO includeSubDomains:
          // these headers apply to every host this app serves, including
          // the slotab.ravens-peak-consulting.com alias — includeSubDomains
          // there would assert HSTS for all *.ravens-peak-consulting.com
          // subdomains, which we don't control here. Per-host is the safe
          // scope until the slotab.org cutover.
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      // Boys and girls cross country merged into one page 2026-08-11 — the
      // program considers itself a single team. Keep the old slugs working.
      {
        source: "/teams/boys-cross-country",
        destination: "/teams/cross-country",
        permanent: true,
      },
      {
        source: "/teams/girls-cross-country",
        destination: "/teams/cross-country",
        permanent: true,
      },
      // NOTE: there is deliberately NO /teams/dance redirect here any more.
      // Cheer used to live on the Dance team's slug; when it moved to
      // /teams/cheer on 2026-08-16 a permanent redirect kept the old URL
      // working, on the stated condition that it would be withdrawn if the
      // real Dance team ever got a page. It did — 2026-08-20, from Coach
      // Mettler's own info — so /teams/dance now serves Dance itself.
      // Don't re-add the redirect: it would bury a live team page.
      //
      // The withdrawn rule was a 308, so browsers that hit /teams/dance
      // between 2026-08-16 and 2026-08-20 may have it cached and will still
      // land on /teams/cheer until their cache clears. Four days of exposure
      // on a site that went live 2026-08-15, and unavoidable once a
      // permanent redirect has shipped.
      // Permanent (308) so search engines transfer the old pages' standing to
      // the new ones rather than treating these as temporary detours.
      ...LEGACY_HTM_URLS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      // Not permanent: these are conveniences for a live campaign, not a
      // migration, so they should stay cheap to change if /sponsors ever
      // becomes a real page of its own.
      ...GUESSED_URLS.map(([source, destination]) => ({
        source,
        destination,
        permanent: false,
      })),
    ];
  },
  async rewrites() {
    return [
      // Decap CMS admin is served as a pure static HTML file at
      // public/admin.html so its runtime DOM takeover doesn't collide
      // with Next.js hydration. Both /admin and /admin/ resolve there.
      { source: "/admin", destination: "/admin.html" },
      { source: "/admin/", destination: "/admin.html" },
    ];
  },
};

export default nextConfig;
