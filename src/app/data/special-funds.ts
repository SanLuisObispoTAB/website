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
  /** Whether this fund is offered in the general designation picker on
   *  `/donate` — the list a member picks their sport from.
   *
   *  **Absent, which is the answer for every fund today.** Erik, 2026-08-29:
   *  the Hall of Fame is not a valid designation for a membership gift. A
   *  designation says which *team* a member's gift is directed to; a named
   *  fund is a separate campaign that happens to reuse the same checkout
   *  plumbing, and putting it in that list invited a parent joining the club to
   *  send their membership money somewhere it was never meant to go.
   *
   *  It is a flag rather than a deletion because the fund itself is untouched:
   *  it still takes gifts through its own page (see `pickerFunds` below), and
   *  if the board ever wants one listed again that is a data edit here, not a
   *  hunt through the form. */
  offerInPicker?: boolean;
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

/** The funds offered in `/donate`'s designation dropdown. **Empty today** — see
 *  `offerInPicker`.
 *
 *  WHAT THIS DOES NOT DO, AND WHY THAT MATTERS
 *  It does not make a fund unreachable, and it must not: the Hall of Fame Fund
 *  is a live campaign with a published $10,000 goal, a thermometer on
 *  `/hall-of-fame` fed by gifts carrying `designation=hall-of-fame`, a weekly
 *  cron report to the Treasurer and a QuickBooks class of its own. Five links
 *  on that page — the band's two buttons, the giving ladder, the ceremony strip
 *  — send an alumnus to `/donate?tab=general&team=hall-of-fame`, and that path
 *  still works exactly as it did. What has gone is the fund appearing as an
 *  option to somebody who came to join the club and designate a sport.
 *
 *  So: reachable **on purpose, from the fund's own page**, and not offered to
 *  anyone who did not ask for it. Removing the designation outright would
 *  break those five links and freeze the thermometer — a decision for the
 *  board, not a side effect of tidying a dropdown. */
export function pickerFunds(): SpecialFund[] {
  return SPECIAL_FUNDS.filter((f) => f.offerInPicker);
}

/** True when the whole gift stays with the designation the donor chose, so no
 *  75/25 split is shown to them or applied in the Treasurer's report. The
 *  general fund qualifies for the obvious reason: it *is* the 25% side. */
export function isUnsplitDesignation(slug: string): boolean {
  return slug === "general" || SPECIAL_FUNDS.some((f) => f.slug === slug);
}
