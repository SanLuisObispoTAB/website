"use client";

import { usePathname } from "next/navigation";
import SiteBanner from "./tiger/SiteBanner";
import TigerFooter from "./tiger/TigerFooter";
import TigerNav from "./tiger/TigerNav";
import TopBar from "./tiger/TopBar";

// Hardcoded score-ticker items for the 5-11 demo. Sourced from the
// Classic design prototype. Replace with a CMS collection or live
// scoreboard feed post-demo.
const TICKER_ITEMS = [
  { tag: "NEXT UP", text: "Spring Social · Apr 9 · 5:30 PM at The Hub" },
  { tag: "RESULT", text: "V Boys Volleyball vs Righetti", score: "W 3-1" },
  { tag: "LIVE FRI", text: "Varsity Baseball vs Atascadero", score: "7:00 PM" },
  { tag: "IMPACT", text: "New scoreboard panels installed at Holt Field" },
  { tag: "RESULT", text: "Track & Field @ Mt. SAC Relays", score: "3rd" },
];

// Client wrapper so we can hide chrome on the Decap admin route —
// Decap takes over the page and our chrome would interfere.
export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteBanner />
      <TopBar items={TICKER_ITEMS} />
      <TigerNav />
      <main>{children}</main>
      <TigerFooter />
    </>
  );
}
