// The official 2026-2027 SLOTAB Memberships & Sponsorships sheet, as distributed
// by the Sponsorship lead. Transcribed from the printed sheet in #88 and
// re-tiered by the board 2026-08-11.
//
// WHY THIS IS ITS OWN MODULE
// These prices are now charged, not just displayed. `MembershipTiers` renders
// them and `/api/square/payment-link` bills them, and those two must never be
// able to disagree — a card advertising $5,000 beside a checkout charging
// something else is precisely the failure #143 found on the Square storefront,
// where "Gold" sells for $2,500 against a page promising a $5,000 package.
// One array, imported by both. If the board revises the offering, edit here.
//
// `id` is what crosses the wire from the browser. The **price is never sent
// with it** — the client names a tier, the server looks up what that tier
// costs. A posted amount would be a posted price.

export type SponsorTier = {
  /** Stable slug — the only tier identifier the client is trusted with. */
  id: string;
  name: string;
  /** Annual price in whole dollars. Required: every sponsor tier is billable. */
  annual: number;
  /** Monthly recurring option, where the sheet offers one. Display only until
   *  the Subscriptions API lands — see #144. */
  monthly?: number;
  /** The top three tiers carry the "Includes Ad Perks" flag on the sheet. */
  adPerks?: boolean;
  perks: string[];
};

// Sports-credit counts (5 / 4 / 3 / 2 / 1 down the ladder) were read off the
// live storefront items on 2026-08-20, not inferred. They were missing from the
// #88 transcription entirely, so `/membership` described banners, passes and
// scoreboard ads while saying nothing about the one perk a business has to make
// a decision about — and a sponsor could only discover it after reaching Square.
//
// Worth knowing if these ever need re-reading: the wording is not uniform. Four
// tiers render "Sport(s) … (choose up to N)" while **Varsity** renders "Sport …
// (choose 1)", singular and without "up to". A pattern matching only the first
// form reports Varsity as having no picker at all, which is exactly the wrong
// conclusion.
//
// All-Sport Annual Pass counts scale with the sponsorship level, confirmed by
// the board 2026-08-11: $500 -> 2 · $1,000 -> 4 · $2,500 -> 6 · $5,000 -> 8 ·
// $10,000 -> 10. These supersede the counts transcribed from the printed sheet
// in #88, which read 2/2/2/4/6 up the ladder.
export const SPONSOR_TIERS: SponsorTier[] = [
  {
    id: "champion",
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
      "Ten SLOHS All-Sport Annual Passes",
      "Choose up to five sports to receive the credit",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    annual: 5000,
    adPerks: true,
    perks: [
      "Digital ads on stadium scoreboard: football, soccer, track & field",
      "Digital ads on gym scoreboard: basketball, stunt & volleyball",
      "Banner at sporting location of your choice for TWO years",
      "Recognition on SLOTAB website",
      "Eight SLOHS All-Sport Annual Passes",
      "Choose up to four sports to receive the credit",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    annual: 2500,
    adPerks: true,
    perks: [
      "Banner at sporting location of your choice for one year",
      "Recognition on SLOTAB website",
      "Six SLOHS All-Sport Annual Passes",
      "Choose up to three sports to receive the credit",
    ],
  },
  {
    id: "tiger-pride",
    name: "Tiger Pride",
    annual: 1000,
    monthly: 95,
    perks: [
      "Recognition on SLOTAB website",
      "Four SLOHS All-Sport Annual Passes",
      "Choose up to two sports to receive the credit",
    ],
  },
  {
    id: "varsity",
    name: "Varsity",
    annual: 500,
    monthly: 45,
    perks: [
      "Recognition on SLOTAB website",
      "Two SLOHS All-Sport Annual Passes",
      "Choose one sport to receive the credit",
    ],
  },
];

export function sponsorTierById(id: string): SponsorTier | undefined {
  return SPONSOR_TIERS.find((t) => t.id === id);
}

/** General memberships are displayed but not separately billable — they run
 *  through the ordinary donation flow, where any amount qualifies you at the
 *  matching level (board decision #37: every donation enrols you as a member). */
export type MembershipTier = {
  name: string;
  annual?: number;
  monthly?: number;
  anyAmount?: boolean;
  perks: string[];
};

export const GENERAL_MEMBERSHIPS: MembershipTier[] = [
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
    perks: ["Tiger news & event updates", "Supports all sports"],
  },
];


// ---------------------------------------------------------------------------
// THE COMBINED LADDER
//
// Businesses currently enrol through the same donate flow as families, so a
// gift has to be placed against **both** halves of the sheet — the general
// memberships above and the sponsorship tiers. Splitting them would put a
// $5,000 gift at "Family", the top of a ladder that stops at $125, and leave
// the five levels above it unreachable from the page where the money is
// actually given.
//
// Lives here rather than in `DonateForm` because it is a fact about the
// offering, not about that form: `/membership` renders these arrays and
// `/donate` names a level from them, and the two disagreeing is exactly the
// bug #158 fixed. If the board later splits business enrolment onto its own
// path (the change Erik is arguing for), this is the one function to revisit.

type Threshold = { name: string; annual: number; monthly?: number };

/** Every paid level the club offers, richest first. */
function rankedLevels(): Threshold[] {
  return [
    ...SPONSOR_TIERS.map((t) => ({
      name: t.name,
      annual: t.annual,
      monthly: t.monthly,
    })),
    ...GENERAL_MEMBERSHIPS.filter((t) => !t.anyAmount).map((t) => ({
      name: t.name,
      annual: t.annual ?? 0,
      monthly: t.monthly,
    })),
  ].sort((a, b) => b.annual - a.annual);
}

/** The level a gift of `amount` qualifies for, named exactly as `/membership`
 *  names it. Returns null for a zero or negative amount.
 *
 *  `mode` exists for the recurring work that is currently switched off
 *  (`RECURRING_ENABLED`, #154). Levels with no monthly price on the sheet —
 *  Silver, Gold and Champion — are simply skipped when matching monthly, so a
 *  monthly pledge can never be credited against a price the club does not
 *  publish. */
export function levelForGift(
  amount: number,
  mode: "one-time" | "monthly" = "one-time",
): string | null {
  if (amount <= 0) return null;
  for (const t of rankedLevels()) {
    const threshold = mode === "monthly" ? t.monthly : t.annual;
    if (threshold != null && amount >= threshold) return t.name;
  }
  // Below every named level, and still a member — that is what Tiger Friend is
  // for, and #37: every donation enrols you.
  return GENERAL_MEMBERSHIPS.find((t) => t.anyAmount)?.name ?? null;
}
