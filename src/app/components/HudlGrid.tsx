"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import hudlData from "../data/hudl.json";

type HudlVideo = {
  id: string;
  title: string;
  sport: string;
  date: string;
  status: "live" | "upcoming" | "archive";
  thumbnail?: string | null;
  watchUrl: string;
  embedUrl?: string | null;
};

type Props = {
  /** max cards to show; undefined means no cap */
  limit?: number;
  /** if true, show the filter chips */
  showFilters?: boolean;
};

const VIDEOS = hudlData.videos as HudlVideo[];

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HudlGrid({
  limit,
  showFilters = true,
}: Props) {
  const sports = useMemo(() => {
    const counts = new Map<string, number>();
    for (const v of VIDEOS) counts.set(v.sport, (counts.get(v.sport) ?? 0) + 1);
    return [...counts.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, []);

  const [filter, setFilter] = useState<string>("all");

  const visible = (
    filter === "all" ? VIDEOS : VIDEOS.filter((v) => v.sport === filter)
  ).slice(0, limit);

  return (
    <>
      {showFilters && (
        <div className="slotab-tnn-filter">
          <button
            type="button"
            className={`slotab-event-chip ${filter === "all" ? "on accent" : "off"}`}
            onClick={() => setFilter("all")}
          >
            <span className="chip-label">All Sports</span>
            <span className="chip-count">{VIDEOS.length}</span>
          </button>
          {sports.map((s) => (
            <button
              key={s.label}
              type="button"
              className={`slotab-event-chip ${filter === s.label ? "on" : "off"}`}
              onClick={() => setFilter(s.label)}
            >
              <span className="chip-label">{s.label}</span>
              <span className="chip-count">{s.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="slotab-tnn-grid">
        {visible.map((v) => (
          <Link
            key={v.id}
            href={v.watchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="slotab-tnn-card"
          >
            <div className="slotab-tnn-thumb">
              {v.thumbnail ? (
                <Image
                  src={v.thumbnail}
                  alt={v.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="slotab-hudl-placeholder-thumb">
                  <span>Watch on Hudl</span>
                </div>
              )}
              <div className="slotab-tnn-play" aria-hidden="true">
                ▶
              </div>
              {v.status === "live" && (
                <span className="slotab-hudl-live-badge">● LIVE</span>
              )}
            </div>
            <div className="slotab-tnn-body">
              <div className="slotab-tnn-tags">
                <span className="slotab-tnn-tag">{v.sport}</span>
              </div>
              <div className="slotab-tnn-title">{v.title}</div>
              <div className="slotab-tnn-meta">{formatDate(v.date)}</div>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
