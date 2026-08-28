// The gate passes SLOTAB sells, as a catalogue rather than as copy.
//
// WHY THIS IS ITS OWN MODULE
// The two pass prices were typed into `/season-passes` as literals, next to
// two `<Image>` tags, and the pass *counts* that come with a sponsorship were
// English sentences inside `SPONSOR_TIERS[].perks` ("10 SLOHS All-Sport Annual
// Passes"). Neither form can be read by a checkout. Adding passes to the giving
// flow (Trina, 2026-08-28) needs both as data: a price to charge, and a count
// to say "you already receive N — want more?".
//
// This is the same argument `sponsor-tiers.ts` makes about tier prices and
// `sportsCredit`: a number the page renders AND the server bills, in one place,
// so a card advertising six passes can never sit above a checkout that charges
// for six more. See #143 and #145 for what it costs when they drift.
//
// PRICES ARE THE PUBLISHED ONES. $250 / $125 come off `/season-passes`, which
// is the page the club has been pointing people at all season. That page now
// imports from here rather than carrying its own copies.

export type PassType = {
  /** Stable slug — the only pass identifier a client is trusted with. The
   *  price is looked up from it server-side, never posted. */
  id: string;
  name: string;
  /** Price in whole dollars. */
  price: number;
  /** Short line under the name in the picker. */
  blurb: string;
  /** True when the buyer must also say WHICH season the pass is for. A single
   *  season pass with no season named is an unfulfillable order — the club
   *  would be printing a pass and guessing. */
  needsSeason?: boolean;
  /** Fat-finger guard, not a policy limit. A family buying more than this is a
   *  conversation with the Membership VP, not a web form. */
  maxQty: number;
};

export const PASS_TYPES: PassType[] = [
  {
    id: "all-sports-annual",
    name: "All Sports Annual Pass",
    price: 250,
    blurb:
      "Entry to every SLOHS Fall, Winter and Spring regular-season home game for the school year.",
    maxQty: 10,
  },
  {
    id: "single-season",
    name: "Single Season Pass",
    price: 125,
    blurb:
      "Entry to SLOHS regular-season home games for one season — Fall, Winter or Spring.",
    needsSeason: true,
    maxQty: 10,
  },
];

/** The seasons a Single Season Pass can name. Deliberately NOT `orderedSeasons()`
 *  from `seasons.ts` — that helper rotates to lead with whatever season is
 *  current, which is right for a nav menu and wrong for a price list, where a
 *  buyer is choosing between three fixed options and the order should not move
 *  under them week to week. "Year-round" is excluded: it is a team-scheduling
 *  category, not a season anyone can buy a pass to. */
export const PASS_SEASONS = ["Fall", "Winter", "Spring"] as const;
export type PassSeason = (typeof PASS_SEASONS)[number];

export function passTypeById(id: string): PassType | undefined {
  return PASS_TYPES.find((p) => p.id === id);
}

/** One line of a pass order: a type, how many, and — for a single-season pass —
 *  which season. Quantity is the only field the buyer types, and it is bounded
 *  by `maxQty` here as well as wherever this is billed. */
export type PassSelection = {
  passId: string;
  qty: number;
  season?: PassSeason;
};

/** Dollar total of a pass selection. Unknown pass ids contribute nothing rather
 *  than throwing — a stale id from an old tab should cost the buyer a line, not
 *  the whole checkout. */
export function passTotal(selections: PassSelection[]): number {
  return selections.reduce((sum, s) => {
    const type = passTypeById(s.passId);
    return type ? sum + type.price * Math.max(0, Math.floor(s.qty)) : sum;
  }, 0);
}

/** Selections with a quantity, in catalogue order. What the UI renders as the
 *  order summary, and what a checkout would turn into line items. */
export function activePasses(selections: PassSelection[]): PassSelection[] {
  return PASS_TYPES.flatMap((type) =>
    selections.filter((s) => s.passId === type.id && s.qty > 0),
  );
}

/** How a pass line reads on a receipt. Includes the season, because
 *  "Single Season Pass" alone is three different products and the person at
 *  the gate has to be able to tell which one was bought. */
export function passLineLabel(sel: PassSelection): string {
  const type = passTypeById(sel.passId);
  if (!type) return sel.passId;
  return type.needsSeason && sel.season
    ? `${type.name} — ${sel.season}`
    : type.name;
}

// ---------------------------------------------------------------------------
// PASSES THAT COME WITH A LEVEL
//
// Every sponsorship tier includes a number of All-Sport Annual Passes — 10 down
// to 2 (see `SPONSOR_TIERS[].passesIncluded`). That count is why this flow
// exists in the form Trina asked for: a Gold sponsor must be told "you already
// receive 8" before being offered a ninth, or the club sells someone something
// it is about to give them.
//
// THE OPEN QUESTION, STATED RATHER THAN DECIDED:
// On `/donate` a level is reached **by amount** — `levelForGift(5000)` returns
// "Gold Sponsor" for a parent's gift, without anyone buying a Gold sponsorship.
// Whether that gift also carries Gold's eight passes is a board question, and it
// is the same question already open in #204/#206 (whether a donation-derived
// level carries the tier's perks at all).
//
// The flag below is how this module refuses to answer it quietly. `true` matches
// what the public tier cards on `/membership` currently promise — they list the
// passes against the level, with no "sponsorships only" qualifier — so shipping
// `false` would be the site quietly withdrawing a published perk. Flip it and
// the prototype's messaging, the included-pass maths and the "want more?" copy
// all change together.
export const DONATION_LEVEL_INCLUDES_PASSES = true;

export type IncludedPasses = {
  count: number;
  /** The level the count came from, for copy that names it. */
  level: string;
  /** How the buyer reached that level. A purchased sponsorship is unambiguous;
   *  a donation that merely crossed the threshold is the case the board has yet
   *  to rule on. */
  via: "sponsorship" | "donation-level";
};

/** Passes already included at a level, or null when none are.
 *
 *  Takes the tier list as an argument rather than importing it, so this module
 *  stays free of a cycle: `sponsor-tiers.ts` imports `passesPerk` from here to
 *  render its own bullet. */
export function includedPasses(
  level: string | null,
  via: IncludedPasses["via"],
  passesByLevel: (name: string) => number,
): IncludedPasses | null {
  if (!level) return null;
  if (via === "donation-level" && !DONATION_LEVEL_INCLUDES_PASSES) return null;
  const count = passesByLevel(level);
  return count > 0 ? { count, level, via } : null;
}

/** The perk bullet a tier renders for its included passes, generated from the
 *  count so the sentence and the number cannot disagree. Mirrors
 *  `sportsCreditPerk` in `sponsor-tiers.ts`, deliberately — same problem, same
 *  shape, and the two bullets sit next to each other on every tier card.
 *
 *  Null rather than an empty string when a level includes none, so callers have
 *  to handle it instead of printing a blank list item. */
export function passesPerk(n: number): string | null {
  if (n <= 0) return null;
  return `${n} SLOHS All-Sport Annual Pass${n === 1 ? "" : "es"}`;
}
