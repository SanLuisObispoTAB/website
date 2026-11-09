"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { TickerItem } from "../../data/ticker";

type Props = {
  items: TickerItem[];
};

/** Dated events shown at most. */
const MAX_EVENTS = 6;

const FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

// Today's date as a snapshot. On the server and during hydration it is null,
// so the first render matches the prerendered HTML exactly; straight after,
// the browser re-renders with its own date and drops anything already past.
// That's what keeps the bar current between deploys (#266).
const noop = () => () => {};
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function visibleItems(items: TickerItem[], today: string | null) {
  let cutoff: Date | null = null;
  if (today) {
    cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
  }
  let shown = 0;
  return items.flatMap((it) => {
    if (!it.date) return [it];
    if (cutoff && new Date(it.date) < cutoff) return [];
    if (shown >= MAX_EVENTS) return [];
    const tag = shown === 0 ? "NEXT UP" : FMT.format(new Date(it.date)).toUpperCase();
    shown += 1;
    return [{ ...it, tag }];
  });
}

export default function TopBar({ items }: Props) {
  const today = useSyncExternalStore(noop, todayKey, () => null);
  const shown = visibleItems(items, today);
  // Items duplicated 3× so the marquee loops seamlessly without a gap.
  const triple = [...shown, ...shown, ...shown];

  return (
    <div className="tiger-topbar" aria-label="Tiger news and upcoming events">
      <div className="tiger-marquee tiger-topbar-track">
        {triple.map((it, i) => {
          const inner = (
            <>
              {it.tag && <span className="tiger-topbar-tag">{it.tag}</span>}
              <span className="tiger-topbar-text">{it.text}</span>
              {it.score && <span className="tiger-topbar-score">{it.score}</span>}
            </>
          );
          return it.href ? (
            <Link
              key={i}
              href={it.href}
              className="tiger-topbar-item tiger-topbar-link"
              // Only the first copy is reachable by keyboard; the other two
              // exist to make the loop seamless.
              tabIndex={i < shown.length ? undefined : -1}
            >
              {inner}
            </Link>
          ) : (
            <span key={i} className="tiger-topbar-item">
              {inner}
            </span>
          );
        })}
      </div>
    </div>
  );
}
