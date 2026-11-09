"use client";

import { usePathname } from "next/navigation";
import SiteBanner from "./tiger/SiteBanner";
import TigerFooter from "./tiger/TigerFooter";
import TigerNav from "./tiger/TigerNav";
import TopBar from "./tiger/TopBar";
import ConsentGate from "./ConsentGate";
import type { TickerItem } from "../data/ticker";

// The ticker items are built on the server (layout.tsx → data/ticker.ts) and
// passed in, so the event list and news archive stay out of the browser
// bundle (#266).

// Client wrapper so we can hide chrome on the Decap admin route —
// Decap takes over the page and our chrome would interfere.
export default function LayoutShell({
  children,
  tickerItems,
}: {
  children: React.ReactNode;
  tickerItems: TickerItem[];
}) {
  const pathname = usePathname() || "";
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteBanner />
      <TopBar items={tickerItems} />
      <TigerNav />
      <main>{children}</main>
      <TigerFooter />
      <ConsentGate />
    </>
  );
}
