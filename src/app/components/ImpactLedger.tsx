"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import impactData from "../data/impact.json";

type Item = {
  year: string;
  team: string;
  category: string;
  description: string;
  cost: number;
  photo: string | null;
};

type ViewMode = "year" | "team";

const ITEMS = impactData.items as Item[];
const CATEGORY_LABELS = new Map(
  impactData.categories.map((c) => [c.key, c.label]),
);

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: impactData.currency || "USD",
  maximumFractionDigits: 0,
});

function groupBy<K extends string>(
  items: Item[],
  keyFn: (i: Item) => K,
): Map<K, Item[]> {
  const out = new Map<K, Item[]>();
  for (const i of items) {
    const k = keyFn(i);
    if (!out.has(k)) out.set(k, []);
    out.get(k)!.push(i);
  }
  return out;
}

function sumCost(items: Item[]): number {
  return items.reduce((acc, i) => acc + (i.cost ?? 0), 0);
}

export default function ImpactLedger() {
  const [view, setView] = useState<ViewMode>("year");

  const grandTotal = useMemo(() => sumCost(ITEMS), []);
  const uniqueSports = useMemo(
    () => new Set(ITEMS.map((i) => i.team)).size,
    [],
  );

  const groups = useMemo(() => {
    if (view === "year") {
      const byYear = groupBy(ITEMS, (i) => i.year);
      return [...byYear.entries()]
        .map(([key, items]) => ({ key, items, total: sumCost(items) }))
        .sort((a, b) => (a.key < b.key ? 1 : -1)); // newest year first
    }
    const byTeam = groupBy(ITEMS, (i) => i.team);
    return [...byTeam.entries()]
      .map(([key, items]) => ({ key, items, total: sumCost(items) }))
      .sort((a, b) => b.total - a.total); // biggest spend first
  }, [view]);

  return (
    <div className="slotab-impact">
      <div className="slotab-impact-draft-ribbon" role="note">
        Draft · Fake Items — Demo Only
      </div>
      <div className="slotab-impact-summary">
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">
            {MONEY.format(grandTotal)}
          </div>
          <div className="slotab-impact-stat-label">
            Funded across {new Set(ITEMS.map((i) => i.year)).size} school years
          </div>
        </div>
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">{ITEMS.length}</div>
          <div className="slotab-impact-stat-label">Items purchased</div>
        </div>
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">{uniqueSports}</div>
          <div className="slotab-impact-stat-label">Teams &amp; programs</div>
        </div>
      </div>

      <div className="slotab-impact-toggle" role="tablist" aria-label="View mode">
        <button
          type="button"
          role="tab"
          aria-selected={view === "year"}
          className={`slotab-impact-toggle-btn ${view === "year" ? "on" : ""}`}
          onClick={() => setView("year")}
        >
          By Year
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "team"}
          className={`slotab-impact-toggle-btn ${view === "team" ? "on" : ""}`}
          onClick={() => setView("team")}
        >
          By Team
        </button>
      </div>

      {groups.map((g) => (
        <section key={g.key} className="slotab-impact-group">
          <header className="slotab-impact-group-head">
            <h3>{g.key}</h3>
            <div className="slotab-impact-group-total">
              {MONEY.format(g.total)}{" "}
              <span className="slotab-impact-group-count">
                · {g.items.length}{" "}
                {g.items.length === 1 ? "item" : "items"}
              </span>
            </div>
          </header>
          <ul className="slotab-impact-items">
            {g.items.map((item, idx) => (
              <li key={idx} className="slotab-impact-item">
                <div className="slotab-impact-item-photo">
                  {item.photo ? (
                    <Image
                      src={item.photo}
                      alt={item.description}
                      width={160}
                      height={160}
                      style={{ objectFit: "cover", width: "100%", height: "100%" }}
                    />
                  ) : (
                    <div
                      className="slotab-impact-item-photo-placeholder"
                      aria-hidden="true"
                    >
                      {item.team
                        .split(/\s+/)
                        .map((w) => w[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>
                <div className="slotab-impact-item-body">
                  <div className="slotab-impact-item-meta">
                    {view === "year" ? (
                      <span className="slotab-impact-item-team">{item.team}</span>
                    ) : (
                      <span className="slotab-impact-item-team">{item.year}</span>
                    )}
                    <span className="slotab-impact-item-cat">
                      {CATEGORY_LABELS.get(item.category) ?? item.category}
                    </span>
                  </div>
                  <div className="slotab-impact-item-desc">
                    {item.description}
                  </div>
                </div>
                <div className="slotab-impact-item-cost">
                  {MONEY.format(item.cost)}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
