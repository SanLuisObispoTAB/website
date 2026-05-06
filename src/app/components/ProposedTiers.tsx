"use client";

import Link from "next/link";
import { useState } from "react";

type Tier = {
  name: string;
  oneTime: number;
  monthly: number;
  perks: string[];
  highlight?: boolean;
};

const TIERS: Tier[] = [
  {
    name: "Supporter",
    oneTime: 25,
    monthly: 10,
    perks: [
      "SLOTAB membership card",
      "Name on the Donor Wall page",
      "Quarterly e-newsletter",
      "Voting rights at the annual SLOTAB meeting",
    ],
  },
  {
    name: "Fan",
    oneTime: 250,
    monthly: 25,
    perks: [
      "Everything above",
      "SLOTAB-branded window cling or rally towel",
      "Name in printed game-day program for your designated team",
    ],
  },
  {
    name: "Booster",
    oneTime: 500,
    monthly: 50,
    highlight: true,
    perks: [
      "Everything above",
      "SLOTAB t-shirt",
      "Invite to the preseason coaches' reception",
      "Recognition slide at home varsity football & basketball games",
    ],
  },
  {
    name: "Champion",
    oneTime: 1500,
    monthly: 125,
    perks: [
      "Everything above",
      "2 reserved seats at one signature home game per season",
      "1 reserved parking space at football home games",
      "Name on the physical Donor Wall in the gym lobby",
    ],
  },
  {
    name: "Patron",
    oneTime: 5000,
    monthly: 420,
    perks: [
      "Everything above",
      "4 reserved seats at all signature home games",
      "Reserved parking for football & basketball",
      "Recognition at the end-of-year athletics banquet",
      "Logo placement on stadium banner (business)",
    ],
  },
];

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function ProposedTiers() {
  const [mode, setMode] = useState<"one-time" | "monthly">("one-time");

  return (
    <div className="slotab-tier-prototype">
      <div className="slotab-tier-prototype-banner">
        <strong>Proposed for board review — 2026-05-11.</strong> This is a
        draft tier ladder built from research on comparable HS, college,
        and arts non-profit booster orgs. The current donor lists below
        are unchanged.
      </div>

      <div
        className="slotab-donate-mode"
        role="tablist"
        aria-label="Tier qualification basis"
        style={{ maxWidth: 360, margin: "0 auto 1.5rem" }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "one-time"}
          className={`slotab-donate-mode-btn ${mode === "one-time" ? "on" : ""}`}
          onClick={() => setMode("one-time")}
        >
          Annual gift
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "monthly"}
          className={`slotab-donate-mode-btn ${mode === "monthly" ? "on" : ""}`}
          onClick={() => setMode("monthly")}
        >
          Monthly recurring
        </button>
      </div>

      <div className="slotab-tier-grid">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`slotab-tier-card ${t.highlight ? "highlight" : ""}`}
          >
            {t.highlight && (
              <span className="slotab-tier-badge">Most popular</span>
            )}
            <h3>{t.name}</h3>
            <div className="slotab-tier-amount">
              {mode === "monthly"
                ? `${MONEY.format(t.monthly)}/mo`
                : `${MONEY.format(t.oneTime)}`}
              {mode === "monthly" && (
                <span className="slotab-tier-annualized">
                  ≈ {MONEY.format(t.monthly * 12)}/year
                </span>
              )}
            </div>
            <ul>
              {t.perks.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="slotab-tier-foot">
        <p>
          <strong>Every donor is a member.</strong> Tiers are recognition
          layers, not paywalls — any gift makes you part of SLOTAB. A
          recurring gift qualifies you at the tier of monthly × 12, from
          month one.
        </p>
        <p>
          A separate <strong>Legacy Circle</strong> recognizes lifetime
          giving of $25,000+ with permanent name engraving and a named
          stadium seat.
        </p>
        <Link href="/donate" className="slotab-btn">
          Try the Donate Form
        </Link>
      </div>
    </div>
  );
}
