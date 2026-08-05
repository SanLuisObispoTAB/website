"use client";

import Link from "next/link";

// The official 2026-2027 SLOTAB Memberships & Sponsorships sheet, as
// distributed by the Sponsorship lead. This is the finalized offering
// that superseded the two earlier /membership drafts (the
// Supporter/Fan/Booster ladder and the Platinum/Gold/Silver/Bronze
// business tiers). Prices + perks transcribed from the printed sheet.
// If the board revises the offering, edit the arrays below.

type Tier = {
  name: string;
  /** Annual price in whole dollars. Omit for the any-amount entry tier. */
  annual?: number;
  /** Monthly recurring option, where the sheet offers one. */
  monthly?: number;
  /** Entry tier — any gift qualifies; shows "Any amount" instead of a price. */
  anyAmount?: boolean;
  /** Top-three tiers carry the "Includes Ad Perks" flag on the sheet. */
  adPerks?: boolean;
  perks: string[];
};

// The three premium, ad-perk sponsor tiers render as a 3-up top row.
const AD_PERK_TIERS: Tier[] = [
  {
    name: "Champion Sponsor",
    annual: 10000,
    adPerks: true,
    perks: [
      "Logo on ALL SLOHS student-athlete t-shirts for a full year (submit logo + payment before a trimester starts to make that print run)",
      "Digital ads on stadium scoreboard: football, soccer, track & field",
      "Digital ads on gym scoreboard: basketball, stunt & volleyball",
      "Featured game sponsor (sport of your choice) — designated seating + 6 tickets",
      "Banners at THREE sporting locations of your choice for TWO years",
      "Recognition on SLOTAB website and Tiger Teams App",
      "Six SLOHS All-Sport Annual Passes",
    ],
  },
  {
    name: "Gold Sponsor",
    annual: 5000,
    adPerks: true,
    perks: [
      "Digital ads on stadium scoreboard: football, soccer, track & field",
      "Digital ads on gym scoreboard: basketball, stunt & volleyball",
      "Banner at sporting location of your choice for TWO years",
      "Recognition on SLOTAB website",
      "Four SLOHS All-Sport Annual Passes",
    ],
  },
  {
    name: "Silver Sponsor",
    annual: 2500,
    adPerks: true,
    perks: [
      "Banner at sporting location of your choice for one year",
      "Recognition on SLOTAB website",
      "Two SLOHS All-Sport Annual Passes",
    ],
  },
];

// Tiger Pride + Varsity share a centered second row below the ad-perk tiers.
const SPONSOR_TIERS: Tier[] = [
  {
    name: "Tiger Pride",
    annual: 1000,
    monthly: 95,
    perks: [
      "Recognition on SLOTAB website",
      "Two SLOHS All-Sport Annual Passes",
    ],
  },
  {
    name: "Varsity",
    annual: 500,
    monthly: 45,
    perks: [
      "Recognition on SLOTAB website",
      "Two SLOHS All-Sport Annual Passes",
    ],
  },
];

const GENERAL_MEMBERSHIPS: Tier[] = [
  {
    name: "Family",
    annual: 125,
    monthly: 11,
    perks: [
      "One Single-Season Pass",
      "Tiger news & event updates",
      "Supports all sports",
    ],
  },
  {
    name: "Individual",
    annual: 50,
    monthly: 5,
    perks: ["Tiger news & event updates", "Supports all sports"],
  },
  {
    name: "Tiger Friend",
    anyAmount: true,
    perks: [
      "Any gift, any amount — you're a member",
      "Tiger news & event updates",
      "Supports all sports",
    ],
  },
];

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function TierCard({ t }: { t: Tier }) {
  return (
    <div className="slotab-tier-card">
      {t.adPerks && (
        <span className="slotab-tier-badge">Includes Ad Perks</span>
      )}
      <h3>{t.name}</h3>
      <div className="slotab-tier-amount">
        {t.anyAmount ? (
          <span>
            Any amount
            <span className="slotab-tier-per"> · no minimum</span>
          </span>
        ) : (
          <span>
            {MONEY.format(t.annual ?? 0)}
            <span className="slotab-tier-per"> / year</span>
          </span>
        )}
        {t.monthly != null && (
          <span className="slotab-tier-annualized">
            or {MONEY.format(t.monthly)}/mo recurring
          </span>
        )}
      </div>
      <ul>
        {t.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
      </ul>
    </div>
  );
}

export default function MembershipTiers() {
  return (
    <div className="slotab-membership-sheet">
      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">
          Sponsorship Tiers
          <span>Available to businesses &amp; individuals</span>
        </h3>
        <div className="slotab-tier-grid slotab-tier-grid-three">
          {AD_PERK_TIERS.map((t) => (
            <TierCard key={t.name} t={t} />
          ))}
        </div>
        <div className="slotab-tier-grid slotab-tier-grid-pair">
          {SPONSOR_TIERS.map((t) => (
            <TierCard key={t.name} t={t} />
          ))}
        </div>
      </div>

      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">General Memberships</h3>
        <div className="slotab-tier-grid slotab-tier-grid-general">
          {GENERAL_MEMBERSHIPS.map((t) => (
            <TierCard key={t.name} t={t} />
          ))}
        </div>
      </div>

      <div className="slotab-tier-foot">
        <h3 className="slotab-tier-join-head">How to Join</h3>
        <p>
          Complete your membership online, or mail a check payable to{" "}
          <strong className="slotab-mail-address">
            SLOTAB, PO Box 16025, San&nbsp;Luis&nbsp;Obispo,&nbsp;CA&nbsp;93406
          </strong>
          .
        </p>
        <p
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.25rem",
          }}
        >
          <Link
            href="/donate"
            className="tiger-btn tiger-btn-primary tiger-btn-arrow"
          >
            Join or Donate Online
          </Link>
        </p>
        <p className="slotab-tier-join-cta no-print">
          Questions?{" "}
          <a href="mailto:slotabmembership@gmail.com">
            Email the Membership VP
          </a>{" "}
          or{" "}
          <button
            type="button"
            className="slotab-tier-print"
            onClick={() => window.print()}
          >
            print this sheet
          </button>
          .
        </p>
      </div>
    </div>
  );
}
