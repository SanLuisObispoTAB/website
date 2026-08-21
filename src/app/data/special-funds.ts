// Designations that are neither a team nor the general fund.
//
// WHY THIS EXISTS
// The donate flow had exactly two shapes of gift: "general" (100% to the club)
// and a team slug (75% team / 25% general). The Hall of Fame push (#184) is a
// third: a named fund that takes 100% of the gift but is NOT the general fund
// and must never be reported as it — the committee spends it on the class being
// inducted, and the Treasurer has to be able to see that line on its own.
//
// Four places have to agree on that, and they used to agree by each carrying
// its own `=== "general"` test:
//   - DonateForm            — the picker, and the split shown to the donor
//   - api/square/payment-link — what Square is told the gift is for
//   - lib/square-report      — whether the Treasurer's report splits the row
//   - /thank-you             — what the donor is thanked for
// A fund added to three of the four would silently 75/25 a Hall of Fame gift
// into some team's allocation, so the list and the split rule live here.

export type SpecialFund = {
  /** Designation value — the string that reaches Square as `metadata.designation`. */
  slug: string;
  /** The name the donor sees in the picker, on the receipt, and in the report.
   *  One string, so all four surfaces say the same thing. */
  label: string;
  /** Shorter form for running copy ("your gift to the Hall of Fame"). */
  shortLabel: string;
  /** Shown under the designation picker once this fund is chosen. */
  blurb: string;
  /** The class this fund posts to in the Treasurer's QuickBooks — verbatim, as
   *  Trina has it set up. Reconciliation is the whole reason the designation is
   *  carried this carefully (the QB connector posts a daily summary with no
   *  line detail), so naming her class here means the Square note, the board
   *  report and the CSV all say the string she is looking for instead of a
   *  slug she has to translate. */
  qbClass?: string;
  /** When set, the form offers an "in honor of" name and carries it to Square.
   *  A tribute is the whole point of a memorial-style fund and nothing else in
   *  the checkout can capture it. */
  tribute?: { label: string; placeholder: string };
};

export const SPECIAL_FUNDS: SpecialFund[] = [
  {
    slug: "hall-of-fame",
    label: "SLOHS Athletics Hall of Fame Fund",
    shortLabel: "the Hall of Fame Fund",
    qbClass: "Donation: Hall of Fame",
    blurb:
      "100% goes to the induction — awards, medallions, wall nameplates and the ceremony program. No 75/25 team split.",
    tribute: {
      label: "In honor of (optional)",
      placeholder: "Coach, teammate, or inductee's name",
    },
  },
];

export function specialFund(slug: string): SpecialFund | undefined {
  return SPECIAL_FUNDS.find((f) => f.slug === slug);
}

/** True when the whole gift stays with the designation the donor chose, so no
 *  75/25 split is shown to them or applied in the Treasurer's report. The
 *  general fund qualifies for the obvious reason: it *is* the 25% side. */
export function isUnsplitDesignation(slug: string): boolean {
  return slug === "general" || SPECIAL_FUNDS.some((f) => f.slug === slug);
}
