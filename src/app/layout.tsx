import type { Metadata } from "next";
import { Source_Serif_4, Manrope, JetBrains_Mono } from "next/font/google";
import LayoutShell from "./components/LayoutShell";
import "./globals.css";
// Legacy stylesheet loaded FIRST so the new tiger design system wins
// on equal-specificity rules (e.g. .slotab-scope h1 vs .tiger-hero-*).
import "./slotab.css";
import "./tiger.css";

// Tiger design system fonts — Source Serif 4 display, Manrope UI,
// JetBrains Mono for eyebrows/captions.
//
// Source Serif 4 loaded as a variable font with the optical-sizing
// (`opsz`) axis so large headlines render with the lighter, more
// editorial display variant (matches the design PDF). Without
// `axes: ["opsz"]` the font would render at a heavier static weight.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-tiger-serif",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-tiger-sans",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tiger-mono",
});

const SITE_TITLE = "SLOTAB — San Luis Obispo Tiger Athletic Booster Club";
const SITE_DESCRIPTION =
  "The SLOHS Tiger Athletic Booster Club — supporting every CIF-sanctioned team and cheer squad at San Luis Obispo High School.";

export const metadata: Metadata = {
  // Absolute base for every URL Next resolves in metadata — the Open Graph
  // image below, and any canonical a page sets for itself. Every host that
  // serves this app (vercel.app, the ravens-peak alias) therefore points
  // search engines and link previews back at slotab.org.
  metadataBase: new URL("https://slotab.org"),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  // NO `alternates.canonical` here. Root metadata is inherited by every
  // route, so a canonical of "/" set at this level made all ~40 pages
  // declare themselves duplicates of the homepage — an instruction to
  // search engines to drop them from the index, shipped the same week the
  // site became indexable. Without it each URL is self-canonical, which is
  // what this site wants: there are no duplicate URL variants to collapse,
  // and the non-slotab.org hosts are already handled by the host-aware
  // `X-Robots-Tag: noindex` in `src/proxy.ts` (decision #100). A page with
  // a genuine duplicate can still set its own.

  // LINK PREVIEWS — every page needs an og:image, and this is why.
  //
  // Until 2026-08-26 the site emitted no `og:` tags at all. Apple's link
  // preview (iMessage, Mail) doesn't give up when og:image is missing — it
  // scrapes the page and grabs the first image big enough to use. On
  // /membership that was the top sponsor logo, so pasting the membership
  // link into a text produced a card captioned "San Luis Obispo Tiger
  // Athletic Booster Club" over a **SLO Credit Union** logo, which reads as
  // the wrong link rather than the wrong picture.
  //
  // Declaring the image here fixes it for every route at once: Next merges
  // this `openGraph` block into every page that doesn't define its own, so
  // a new page is covered the day it ships without anyone remembering to
  // think about it. A page that wants its own picture overrides `images`
  // and inherits the rest.
  openGraph: {
    type: "website",
    siteName: "SLOTAB",
    locale: "en_US",
    // Deliberately no `url` — see the canonical note above. A root-level
    // og:url of "/" is inherited by every route, and scrapers that trust it
    // would collapse every share of every page onto the homepage.
    images: [
      {
        url: "/og/slotab-share.jpg",
        width: 1200,
        height: 630,
        alt: "SLO High Tiger football players raising their helmets before kickoff",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og/slotab-share.jpg"],
  },
  icons: {
    icon: "/logos/slotab-booster-club.png",
    apple: "/logos/slotab-booster-club.png",
  },
  // The blanket `robots: noindex` came off at the 2026-08-11 slotab.org
  // cutover. Indexing is now **host-aware** rather than all-or-nothing:
  // `src/proxy.ts` sends `X-Robots-Tag: noindex` for every host that isn't
  // slotab.org. That does two jobs — it removes the race between deploying
  // this change and DNS actually propagating, and it permanently keeps the
  // vercel.app URL and the SLOHS-firewall alias out of the index as
  // duplicates of the real site.
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${sourceSerif.variable} ${manrope.variable} ${jetbrainsMono.variable} slotab-scope tiger-scope`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
