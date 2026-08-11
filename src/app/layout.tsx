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

export const metadata: Metadata = {
  // Absolute base for canonical + Open Graph URLs. Every host that serves
  // this app (vercel.app, the ravens-peak alias) points search engines and
  // link previews back at slotab.org.
  metadataBase: new URL("https://slotab.org"),
  title: "SLOTAB — San Luis Obispo Tiger Athletic Booster Club",
  description:
    "The SLOHS Tiger Athletic Booster Club — supporting every CIF-sanctioned team and cheer squad at San Luis Obispo High School.",
  alternates: {
    canonical: "/",
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
