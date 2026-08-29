import hofData from "./hof.json";

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
  /** The fund's OWN giving ladder — the rungs it publishes, as objects rather
   *  than as amounts ("Ceremony underwriter", not "Tiger Pride").
   *
   *  WHY THIS HAD TO EXIST
   *  Erik, 2026-08-29, after giving $1,000 on the new campaign page: *"the
   *  sponsorship levels are used. I selected $1000 (ceremony underwriter) and
   *  the Square page said SLOHS Athletics Hall of Fame Fund — donation (Tiger
   *  Pride)."* The checkout was naming the gift off the membership ladder,
   *  because `levelForGift` was the only ladder the route knew about. A Hall of
   *  Fame gift is not a Tiger Pride sponsorship, the donor never chose that
   *  word, and it was the first thing they read on Square.
   *
   *  Sourced from the fund's own content file so the board's Decap edits reach
   *  the receipt as well as the page — a rung renamed at /admin renames it
   *  everywhere, which is the whole reason this is not a second list. */
  levels?: FundLevel[];
};

/** One rung of a fund's ladder. `item` is what the rung buys, and it is what
 *  the donor sees on their receipt. */
export type FundLevel = { amount: number; item: string };

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
    // Amount and item only. The blurbs are page copy and have no business on a
    // receipt or in the Treasurer's report.
    levels: (hofData.fund.levels as FundLevel[]).map(({ amount, item }) => ({
      amount,
      item,
    })),
  },
];

export function specialFund(slug: string): SpecialFund | undefined {
  return SPECIAL_FUNDS.find((f) => f.slug === slug);
}

/** The funds offered in `/donate`'s designation dropdown. **Empty today** — see
 *  `offerInPicker`.
 *
 *  WHAT THIS DOES NOT DO, AND WHY THAT MATTERS
 *  It does not make a fund unreachable. Emptying this list took the Hall of
 *  Fame out of the membership flow; #210 gave it somewhere to go instead —
 *  **`/hall-of-fame/donate`, the campaign's own page and its own checkout**,
 *  which is what Erik meant by "a separate campaign with a separate donation
 *  page". Every link on `/hall-of-fame` points there now, and old
 *  `/donate?team=hall-of-fame` links redirect (see `next.config.ts`).
 *
 *  The designation itself is untouched and still rides to Square exactly as
 *  before, which is what keeps the $10,000 goal, the thermometer, the weekly
 *  cron to the Treasurer and the QuickBooks class all reading the same money.
 *  Only the page collecting it changed. */
export function pickerFunds(): SpecialFund[] {
  return SPECIAL_FUNDS.filter((f) => f.offerInPicker);
}

/** The rung a gift of `dollars` reaches on a fund's own ladder — the highest
 *  one it covers — or null if the fund publishes no ladder or the gift falls
 *  below its lowest rung.
 *
 *  Null is a real answer, not a failure: the ladder starts at $50 and the site
 *  takes gifts from $25, so a $25 Hall of Fame gift genuinely buys no named
 *  object and its line item should read "donation" rather than claim a
 *  nameplate. Deriving it from the amount **server-side** also means the rung
 *  cannot be posted from a browser — the same rule the sponsorship tiers follow
 *  and for the same reason: a name on a receipt is a claim about what the money
 *  bought. */
export function fundLevelForAmount(
  fund: SpecialFund,
  dollars: number,
): string | null {
  if (!fund.levels?.length || dollars <= 0) return null;
  let best: FundLevel | null = null;
  for (const rung of fund.levels) {
    if (dollars >= rung.amount && (!best || rung.amount > best.amount)) {
      best = rung;
    }
  }
  return best?.item ?? null;
}

/** True when the whole gift stays with the designation the donor chose, so no
 *  75/25 split is shown to them or applied in the Treasurer's report. The
 *  general fund qualifies for the obvious reason: it *is* the 25% side. */
export function isUnsplitDesignation(slug: string): boolean {
  return slug === "general" || SPECIAL_FUNDS.some((f) => f.slug === slug);
}
