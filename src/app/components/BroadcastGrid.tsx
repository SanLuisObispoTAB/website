"use client";

import { useMemo, useState } from "react";
import {
  type Broadcast,
  sportLabel,
} from "../data/broadcasts";
import BroadcastCard from "./BroadcastCard";

type Props = {
  /** All broadcasts to render (already filtered by parent). */
  broadcasts: Broadcast[];
  /** Cap on visible cards; undefined = no cap. */
  limit?: number;
  /** Show sport filter chips (only useful on the main /watch page). */
  showFilters?: boolean;
};

export default function BroadcastGrid({
  broadcasts,
  limit,
  showFilters = false,
}: Props) {
  const sports = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of broadcasts) counts.set(b.sport, (counts.get(b.sport) ?? 0) + 1);
    return [...counts.entries()]
      .map(([slug, count]) => ({ slug, label: sportLabel(slug), count }))
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [broadcasts]);

  const [filter, setFilter] = useState<string>("all");

  const visible = (
    filter === "all"
      ? broadcasts
      : broadcasts.filter((b) => b.sport === filter)
  ).slice(0, limit);

  return (
    <>
      {showFilters && sports.length > 1 && (
        <div className="slotab-event-chips slotab-broadcast-filters">
          <button
            type="button"
            className={`slotab-event-chip ${filter === "all" ? "on accent" : "off"}`}
            onClick={() => setFilter("all")}
          >
            <span className="chip-label">All Sports</span>
            <span className="chip-count">{broadcasts.length}</span>
          </button>
          {sports.map((s) => (
            <button
              key={s.slug}
              type="button"
              className={`slotab-event-chip ${filter === s.slug ? "on" : "off"}`}
              onClick={() => setFilter(s.slug)}
            >
              <span className="chip-label">{s.label}</span>
              <span className="chip-count">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="slotab-broadcast-empty">
          No broadcasts yet for this filter.
        </div>
      ) : (
        <div className="slotab-broadcast-grid">
          {visible.map((b) => (
            <BroadcastCard key={b.broadcastId} broadcast={b} />
          ))}
        </div>
      )}
    </>
  );
}
