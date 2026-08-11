"use client";

import Image from "next/image";
import { useMemo } from "react";
import impactData from "../data/impact.json";

type Item = {
  year: string;
  team: string;
  category: string;
  description: string;
  cost: number;
  photo: string | null;
};

const ITEMS = impactData.items as Item[];
const PROGRAMS = impactData.programs as string[];
const CATEGORY_LABELS = new Map(
  impactData.categories.map((c) => [c.key, c.label]),
);

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: impactData.currency || "USD",
  maximumFractionDigits: 0,
});

export default function ImpactLedger() {
  // Biggest line first — the story reads top-down by size.
  const items = useMemo(() => [...ITEMS].sort((a, b) => b.cost - a.cost), []);

  // No ledger yet — show what the page will be rather than an empty shell
  // with three zeroes in the summary bar.
  if (ITEMS.length === 0) {
    return (
      <div className="slotab-impact">
        <p className="slotab-impact-pending">
          The 2026-27 ledger is being compiled. Once the Treasurer closes out
          each month, every booster purchase lands here — the item, the team it
          went to, and what it cost — grouped by year and by team. Updates post
          ahead of each monthly SLOTAB meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="slotab-impact">
      <div className="slotab-impact-summary">
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">
            {MONEY.format(impactData.summary.total)}
          </div>
          <div className="slotab-impact-stat-label">
            To SLOHS athletics in {impactData.fiscalYear}
          </div>
        </div>
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">
            {impactData.summary.programsSupported}
          </div>
          <div className="slotab-impact-stat-label">Programs supported</div>
        </div>
        <div className="slotab-impact-stat">
          <div className="slotab-impact-stat-value">
            {impactData.summary.coachesFunded}
          </div>
          <div className="slotab-impact-stat-label">Coaches funded</div>
        </div>
      </div>

      <section className="slotab-impact-group">
        <header className="slotab-impact-group-head">
          <h3>Where It Went</h3>
          <div className="slotab-impact-group-total">
            {MONEY.format(impactData.summary.total)}{" "}
            <span className="slotab-impact-group-count">
              · {items.length} lines
            </span>
          </div>
        </header>
        <ul className="slotab-impact-items">
          {items.map((item, idx) => (
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
                  <span className="slotab-impact-item-team">{item.team}</span>
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

      <section className="slotab-impact-programs">
        <h3>Every Program SLOTAB Funded This Year</h3>
        <ul className="slotab-impact-program-chips">
          {PROGRAMS.map((p) => (
            <li key={p} className="slotab-impact-program-chip">
              {p}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
