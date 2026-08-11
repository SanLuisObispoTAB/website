"use client";

import { usePathname } from "next/navigation";
import SiteBanner from "./tiger/SiteBanner";
import TigerFooter from "./tiger/TigerFooter";
import TigerNav from "./tiger/TigerNav";
import TopBar from "./tiger/TopBar";
import ConsentGate from "./ConsentGate";
import { ALL_EVENTS } from "../data/events";

// The ticker is built from the same live sources as the calendar: the SLOHS
// athletic-department weekly sheet (scraped), the manual schedule fallback,
// and SLOTAB's own events. It carries no results/scores — we have no
// scoreboard feed, and inventing one is exactly what this replaced.
//
// A standing "game day updates" line always rides at the end, so the bar is
// never empty and never repeats a single dated item three times (TopBar
// triples its items to loop the marquee seamlessly).
const TICKER_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const STANDING_ITEM = {
  tag: "GO TIGERS",
  text: "Watch here for game day updates",
};

function buildTickerItems() {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const upcoming = ALL_EVENTS.filter(
    (e) => new Date(e.date) >= todayMidnight,
  )
    .slice(0, 6)
    .map((e, i) => ({
      tag:
        i === 0
          ? "NEXT UP"
          : TICKER_FMT.format(new Date(e.date)).toUpperCase(),
      text: e.title,
      score: e.isHome === true ? "HOME" : undefined,
    }));
  return [...upcoming, STANDING_ITEM];
}

const TICKER_ITEMS = buildTickerItems();

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
      <ConsentGate />
    </>
  );
}
