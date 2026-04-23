"use client";

import { useMemo, useState } from "react";
import inducteesJson from "../data/hof-inductees.json";

type Inductee = {
  name: string;
  yearsAtSLOHS: string;
  yearInducted: string;
  sport: string;
  note?: string;
};

const ALL_INDUCTEES = inducteesJson.inductees as Inductee[];

// Normalize sport labels to a small set of filter categories so "Track" /
// "Track and Field" / "Track & Field" don't each get their own chip.
function normalizeCategory(sport: string): string[] {
  const s = sport.toLowerCase();
  const cats = new Set<string>();
  if (/coach/.test(s)) cats.add("Coach");
  if (/charter|athletic director|contributor/.test(s)) cats.add("Contributor");
  if (/baseball/.test(s)) cats.add("Baseball");
  if (/basketball/.test(s)) cats.add("Basketball");
  if (/football/.test(s)) cats.add("Football");
  if (/track|cross country/.test(s)) cats.add("Track & Field / XC");
  if (/tennis/.test(s)) cats.add("Tennis");
  if (/golf/.test(s)) cats.add("Golf");
  if (/swim|dive/.test(s)) cats.add("Swim & Dive");
  if (/water polo/.test(s)) cats.add("Water Polo");
  if (/volleyball/.test(s)) cats.add("Volleyball");
  if (/softball/.test(s)) cats.add("Softball");
  if (/wrestling/.test(s)) cats.add("Wrestling");
  if (/multi-sport/.test(s)) cats.add("Multi-Sport");
  return cats.size ? [...cats] : ["Other"];
}

export default function InducteeGrid() {
  const enriched = useMemo(
    () =>
      ALL_INDUCTEES.map((i) => ({
        ...i,
        categories: normalizeCategory(i.sport),
      })),
    [],
  );

  // Build the filter chip list from the data (sorted by count desc).
  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of enriched) for (const c of i.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
    return [...counts.entries()]
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);
  }, [enriched]);

  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");

  const visible = enriched.filter((i) => {
    if (filter !== "all" && !i.categories.includes(filter)) return false;
    if (query) {
      const q = query.toLowerCase();
      if (
        !i.name.toLowerCase().includes(q) &&
        !i.sport.toLowerCase().includes(q) &&
        !String(i.yearInducted).includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  // Group by induction year
  const grouped = new Map<string, typeof visible>();
  for (const i of visible) {
    const y = String(i.yearInducted).match(/\d{4}/)?.[0] ?? i.yearInducted;
    if (!grouped.has(y)) grouped.set(y, []);
    grouped.get(y)!.push(i);
  }
  const yearsSorted = [...grouped.keys()].sort(
    (a, b) => Number(b) - Number(a),
  );

  return (
    <div className="slotab-hof-grid-wrap">
      <div className="slotab-hof-controls">
        <input
          type="search"
          className="slotab-hof-search"
          placeholder="Search by name, sport, or year..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search inductees"
        />
        <div className="slotab-event-chips">
          <button
            type="button"
            className={`slotab-event-chip ${filter === "all" ? "on accent" : "off"}`}
            onClick={() => setFilter("all")}
          >
            <span className="chip-label">All</span>
            <span className="chip-count">{ALL_INDUCTEES.length}</span>
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`slotab-event-chip ${filter === c.key ? "on" : "off"}`}
              onClick={() => setFilter(c.key)}
            >
              <span className="chip-label">{c.key}</span>
              <span className="chip-count">{c.count}</span>
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <p className="slotab-events-empty">
          No inductees match your filter. Try a different sport or clear the search.
        </p>
      )}

      {yearsSorted.map((year) => (
        <section key={year} className="slotab-hof-year">
          <h3 className="slotab-hof-year-title">
            Class of {year}
            <span className="slotab-hof-year-count">
              {grouped.get(year)!.length} {grouped.get(year)!.length === 1 ? "inductee" : "inductees"}
            </span>
          </h3>
          <div className="slotab-hof-cards">
            {grouped.get(year)!.map((i) => (
              <div key={`${i.name}-${i.yearInducted}`} className="slotab-hof-card">
                <div className="slotab-hof-card-name">{i.name}</div>
                <div className="slotab-hof-card-sport">{i.sport}</div>
                <div className="slotab-hof-card-years">
                  SLOHS {i.yearsAtSLOHS}
                </div>
                {i.note && (
                  <div className="slotab-hof-card-note">{i.note}</div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
