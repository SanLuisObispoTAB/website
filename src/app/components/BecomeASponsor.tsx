"use client";

import { useState } from "react";

// Tier benefits sourced from the original SLOTAB business sponsorship
// form so the new site doesn't lose context the old wordpress page
// carried. Edit via Decap if/when the board updates the offering.
const TIERS = [
  {
    tier: "Platinum",
    range: "$2,000+",
    perks: [
      "Logo on the SLOTAB home page rotator",
      "Largest logo placement on the Sponsor wall",
      "Recognition at every home football and basketball game",
      "Full-page mention in the Booster Bash program",
      "All-Sports Annual Pass for the business owner family",
      "Social media features throughout the year",
    ],
  },
  {
    tier: "Gold",
    range: "$1,000–$1,999",
    perks: [
      "Logo on the Sponsor wall (large size)",
      "Recognition at home football games",
      "Half-page mention in the Booster Bash program",
      "All-Sports Annual Pass",
      "Social media feature once per season",
    ],
  },
  {
    tier: "Silver",
    range: "$500–$999",
    perks: [
      "Logo on the Sponsor wall (mid size)",
      "Recognition in the Booster Bash program",
      "Single-Season Pass for one sport",
    ],
  },
  {
    tier: "Bronze",
    range: "$250–$499",
    perks: [
      "Logo on the Sponsor wall",
      "Listing in the Booster Bash program",
    ],
  },
];

export default function BecomeASponsor() {
  const [open, setOpen] = useState(false);

  return (
    <div className={`slotab-become-sponsor ${open ? "open" : ""}`}>
      <button
        type="button"
        className="slotab-become-sponsor-toggle no-print"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="become-sponsor-body"
      >
        <span>Become a Sponsor</span>
        <span className="slotab-become-sponsor-chev" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {/* Body always rendered — hidden via CSS when collapsed — so
          window.print() works without needing a click first. */}
      <div
        id="become-sponsor-body"
        className="slotab-become-sponsor-body"
        hidden={!open}
      >
        <p>
          Local businesses fund Tiger athletics in exchange for visibility
          across SLOHS games, the Booster Bash, and slotab.org. Pick the
          tier that fits your business and we&apos;ll handle the rest.
        </p>
        <div className="slotab-become-sponsor-tiers">
          {TIERS.map((t) => (
            <div
              key={t.tier}
              className={`slotab-become-sponsor-tier ${t.tier.toLowerCase()}`}
            >
              <div className="slotab-become-sponsor-tier-head">
                <h4>{t.tier}</h4>
                <span className="slotab-become-sponsor-range">{t.range}</span>
              </div>
              <ul>
                {t.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="slotab-become-sponsor-cta no-print">
          Ready to sign up?{" "}
          <a href="mailto:slotabmembership@gmail.com">
            Email the Membership VP
          </a>{" "}
          or{" "}
          <button
            type="button"
            className="slotab-become-sponsor-print"
            onClick={() => window.print()}
          >
            print the sponsor sheet
          </button>
          .
        </p>
      </div>
    </div>
  );
}
