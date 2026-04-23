"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import tnnData from "../data/tnn-videos.json";

type Video = {
  id: string;
  title: string;
  published?: string | null;
  duration?: string | null;
  views?: string | null;
  thumbnail?: string | null;
  categories?: string[];
  categoryLabels?: string[];
};

const VIDEOS: Video[] = (tnnData.videos ?? []) as Video[];
const CHANNEL_URL = tnnData.channel?.url ?? "https://www.youtube.com/@TNNSLOHS";

type FilterState = "all" | string;

function useCategories() {
  return useMemo(() => {
    const counts = new Map<string, { label: string; count: number }>();
    for (const v of VIDEOS) {
      const cats = v.categories ?? [];
      const labels = v.categoryLabels ?? [];
      cats.forEach((c, i) => {
        const existing = counts.get(c);
        const label = labels[i] ?? c;
        if (existing) existing.count += 1;
        else counts.set(c, { label, count: 1 });
      });
    }
    return [...counts.entries()]
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count);
  }, []);
}

export default function TigerNews() {
  const categories = useCategories();
  const [filter, setFilter] = useState<FilterState>("all");

  if (VIDEOS.length === 0) return null;

  const visible =
    filter === "all"
      ? VIDEOS.slice(0, 12)
      : VIDEOS.filter((v) => v.categories?.includes(filter)).slice(0, 12);

  return (
    <section className="slotab-section alt">
      <div className="slotab-container">
        <div className="slotab-section-title">
          <span className="slotab-kicker">Tiger News Network</span>
          <h2>Watch the Games</h2>
          <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
            Full game streams and highlight reels from the student-run Tiger
            News Network. Filter by sport — click any card to open on YouTube.
          </p>
        </div>

        <div className="slotab-tnn-filter">
          <button
            type="button"
            className={`slotab-event-chip ${filter === "all" ? "on accent" : "off"}`}
            onClick={() => setFilter("all")}
          >
            <span className="chip-label">All Sports</span>
            <span className="chip-count">{VIDEOS.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`slotab-event-chip ${filter === c.key ? "on" : "off"}`}
              onClick={() => setFilter(c.key)}
            >
              <span className="chip-label">{c.label}</span>
              <span className="chip-count">{c.count}</span>
            </button>
          ))}
        </div>

        <div className="slotab-tnn-grid">
          {visible.map((v) => (
            <a
              key={v.id}
              href={`https://www.youtube.com/watch?v=${v.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-tnn-card"
            >
              <div className="slotab-tnn-thumb">
                {v.thumbnail && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={v.thumbnail}
                    alt={v.title}
                    loading="lazy"
                    width={480}
                    height={360}
                  />
                )}
                <div className="slotab-tnn-play" aria-hidden="true">▶</div>
                {v.duration && (
                  <span className="slotab-tnn-duration">{v.duration}</span>
                )}
              </div>
              <div className="slotab-tnn-body">
                {v.categoryLabels && v.categoryLabels.length > 0 && (
                  <div className="slotab-tnn-tags">
                    {v.categoryLabels.map((l) => (
                      <span key={l} className="slotab-tnn-tag">
                        {l}
                      </span>
                    ))}
                  </div>
                )}
                <div className="slotab-tnn-title">{v.title}</div>
                <div className="slotab-tnn-meta">
                  {v.published}
                  {v.views && <> · {v.views}</>}
                </div>
              </div>
            </a>
          ))}
        </div>

        {visible.length === 0 && (
          <p className="slotab-events-empty">
            No videos tagged for this sport yet. Check back after the next
            game — TNN uploads new streams during the season.
          </p>
        )}

        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link
            href={CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="slotab-btn"
          >
            Visit the TNN Channel
          </Link>
        </div>
      </div>
    </section>
  );
}
