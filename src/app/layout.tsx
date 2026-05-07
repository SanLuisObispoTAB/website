import type { Metadata } from "next";
import { Source_Serif_4, Manrope, JetBrains_Mono } from "next/font/google";
import LayoutShell from "./components/LayoutShell";
import "./globals.css";
import "./tiger.css";
import "./slotab.css";

// Tiger design system fonts — Source Serif 4 display, Manrope UI,
// JetBrains Mono for eyebrows/captions.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
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
  title: "SLOTAB — San Luis Obispo Tiger Athletic Booster Club",
  description:
    "The SLOHS Tiger Athletic Booster Club — supporting every CIF-sanctioned team and cheer squad at San Luis Obispo High School.",
  icons: {
    icon: "/logos/slotab-booster-club.png",
    apple: "/logos/slotab-booster-club.png",
  },
  // TODO: Drop `robots: noindex` before the final cutover to slotab.org.
  // Keep it on while the site is deployed at the staging Vercel URL so
  // search engines don't index the staging domain before slotab.org is
  // pointed at it.
  robots: {
    index: false,
    follow: false,
  },
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
