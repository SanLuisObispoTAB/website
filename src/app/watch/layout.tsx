import type { Metadata } from "next";

// /watch is a Client Component — the Hudl BlueFrame portal embed needs
// browser APIs — and a Client Component cannot export `metadata`. The page
// still needs its own title so a shared link doesn't preview as the bare
// site name, so it lives in this thin layout instead.
export const metadata: Metadata = {
  title: "Watch the Tigers — SLOTAB",
  description:
    "Live and on-demand streams of Tiger home games from Holt Field, the Big Gym, and the baseball and softball fields.",
};

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
