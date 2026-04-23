import type { Metadata } from "next";
import { Raleway, Quattrocento_Sans } from "next/font/google";
import LayoutShell from "./components/LayoutShell";
import "./globals.css";
import "./slotab.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-slotab-heading",
});

const quattrocento = Quattrocento_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-slotab-body",
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
        className={`${raleway.variable} ${quattrocento.variable} slotab-scope`}
      >
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
