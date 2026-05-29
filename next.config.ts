import type { NextConfig } from "next";

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
