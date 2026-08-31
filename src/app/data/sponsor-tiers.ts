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

import { passesPerk } from "./passes";

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
  /** How many sports this sponsorship may be credited to.
   *
   *  A number rather than a sentence in `perks`, because it is now doing two
   *  jobs: `/membership` renders the bullet from it, and the payment-link route
   *  refuses a request that selects more than this many. A display string and a
   *  validation constant that can disagree is the #145 failure all over again —
   *  a card promising four while the server accepts three. */
  sportsCredit: number;
  /** All-Sport Annual Passes included at this tier.
   *
   *  A number for the same reason `sportsCredit` is one: since the passes
   *  add-on (#208) this count is *read by a form* — a Gold sponsor has to be
   *  told "you already receive 8" before being sold a ninth — as well as
   *  printed on the tier card. The card's bullet is generated from it by
   *  `passesPerk`, so the sentence and the number cannot drift. */
  passesIncluded: number;
  perks: string[];
};

// SPORTS-CREDIT COUNTS ARE NOW THE BOARD'S, DECIDED 2026-08-30 (#215):
// Champion 4 · Gold 3 · Silver 2 · Tiger Pride 1 · Varsity 1.
//
// This supersedes the flat 3/3/3/0/0 taken from the #170 sheet, and it settles
// two things that had been sitting open. **Silver's card no longer contradicts
// itself** — it read "Banners at 2 sport locations" beside "Choose up to three
// sports", live on production since #170; Silver is 2. And **Tiger Pride and
// Varsity can designate again**, at one sport each, where the sheet had given
// them none.
//
// The board also ruled that **no general membership may designate a sport** —
// see `GENERAL_MEMBERSHIPS` below, where that is now an explicit `0` rather
// than an absent field. That is the half with teeth: it gates `/donate`.
//
// Historical note, kept because it explains where the old numbers came from:
// counts of 5 / 4 / 3 / 2 / 1 down the ladder were read off the
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
// Transcribed from the board's **final** 2026-27 sheet (PDF, 2026-08-20).
// That sheet supersedes every earlier instruction, including the same day's
// "banners are Champion and Gold only". What actually changed from the site's
// previous state:
//
//   · Gold banners went from ONE location to THREE.
//   · Silver's banner came BACK, at TWO locations.
//   · Sports designation is now a flat THREE for Champion, Gold and Silver,
//     and Tiger Pride and Varsity get NONE — where the site had 5/4/3/2/1.
//   · New perk on Champion and Gold: video on HUDL.
//   · Silver no longer carries scoreboard ads, so it loses the ad-perks flag.
//   · No monthly prices appear anywhere on the sheet, so the $95/$45/$11/$5
//     figures the site carried are gone.
//   · Tiger Friend is back — it was never removed here, so nothing to do.
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
    sportsCredit: 4,
    passesIncluded: 10,
    perks: [
      "Logo on ALL student-athlete T-shirts for the full year",
      "Digital ads on stadium/gym scoreboard: basketball, stunt, volleyball, football, soccer, and track & field",
      "Featured game sponsor — designated seats (6 tickets)",
      "Banners at 3 sport locations of your choice for 1 year",
      "Recognition on SLOTAB website and Tiger Teams App",
      "Video on HUDL, our streaming platform",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    annual: 5000,
    adPerks: true,
    sportsCredit: 3,
    passesIncluded: 8,
    perks: [
      "Digital ads on stadium/gym scoreboard: basketball, stunt, volleyball, football, soccer, and track & field",
      "Banners at 3 sport locations of your choice for 1 year",
      "Recognition on SLOTAB website",
      "Video on HUDL, our streaming platform",
    ],
  },
  {
    id: "silver",
    name: "Silver Sponsor",
    annual: 2500,
    sportsCredit: 2,
    passesIncluded: 6,
    perks: [
      "Banners at 2 sport locations of your choice for 1 year",
      // The sheet prints two recognition bullets for Silver — a plain
      // "Recognition on SLOTAB website" and this fuller one. Taken as a
      // duplication in the source rather than two distinct perks, so the
      // fuller line stands alone. Worth a board confirmation.
      "Recognition on SLOTAB website and business promotional pages",
    ],
  },
  {
    id: "tiger-pride",
    name: "Tiger Pride",
    annual: 1000,
    sportsCredit: 1,
    passesIncluded: 4,
    perks: [
      "Recognition on SLOTAB website",
    ],
  },
  {
    id: "varsity",
    name: "Varsity",
    annual: 500,
    sportsCredit: 1,
    passesIncluded: 2,
    perks: [
      "Recognition on SLOTAB website",
    ],
  },
];

export function sponsorTierById(id: string): SponsorTier | undefined {
  return SPONSOR_TIERS.find((t) => t.id === id);
}

/** A tier's perks with the generated bullets folded back in, in the order the
 *  sheet prints them — the pass line last, where it was typed by hand until
 *  #208 moved the count into `passesIncluded`.
 *
 *  **Every consumer of `perks` must go through this.** The pass line is not
 *  decoration: `perkAction` in `sponsor-fulfilment.ts` matches on it to raise
 *  "issue via GoFan to the email on this message" in the Membership VP's
 *  checklist. Reading `tier.perks` directly would silently drop that to-do from
 *  a live email — a sponsor owed eight passes, and nobody told to send them.
 *
 *  Accepts a general membership too, so `MembershipTiers` can render one card
 *  component across both halves of the sheet. Those include no passes, so the
 *  list comes back unchanged. */
export function tierPerks(tier: SponsorTier | MembershipTier): string[] {
  const included = "passesIncluded" in tier ? tier.passesIncluded : 0;
  const line = passesPerk(included);
  return line ? [...tier.perks, line] : tier.perks;
}

/** All-Sport Annual Passes included at a named level, 0 when none are.
 *
 *  Keyed by NAME rather than id because that is what crosses the wire: a
 *  donation carries `metadata.level` as the string `levelForGift` returned, and
 *  the passes step has to answer "how many do you already receive?" from it. */
export function passesForLevel(name: string): number {
  return SPONSOR_TIERS.find((t) => t.name === name)?.passesIncluded ?? 0;
}

/** General memberships are displayed but not separately billable — they run
 *  through the ordinary donation flow, where any amount qualifies you at the
 *  matching level (board decision #37: every donation enrols you as a member). */
export type MembershipTier = {
  name: string;
  annual?: number;
  monthly?: number;
  anyAmount?: boolean;
  /** How many sports a gift at this level may designate.
   *
   *  **Explicit, and explicitly zero.** Its absence was the whole bug: with no
   *  field here, a general membership had no way to *say* it may not designate,
   *  because nothing ever asked (see `docs/sport-designation-plan.md` §1). The
   *  donate form offered a sport to every donor and the route accepted it, so a
   *  $125 gift could be recorded at "Family" while sending 75% to a team — the
   *  contradiction #206 found in a real gift.
   *
   *  Board decision 2026-08-30 (#215): all three are 0. Every level on the
   *  ladder now carries this field, which is what lets one function answer the
   *  question for both halves. */
  sportsCredit: number;
  perks: string[];
};

export const GENERAL_MEMBERSHIPS: MembershipTier[] = [
  // "Supports all sports" is gone from all three, and its removal is not
  // cosmetic. It was the false half of the notification #206 flagged: the
  // Membership VP was told, four lines apart, that a Family membership
  // "supports all sports" and that $93.75 of it was designated to Wrestling.
  // Under the board's rule the second sentence cannot happen — so the first is
  // now simply true, and saying it alongside a designation is impossible.
  // Replaced with the plain fact, which is also the reason the rule exists.
  {
    name: "Family",
    annual: 125,
    sportsCredit: 0,
    perks: ["Tiger news & event updates", "Supports every Tigers team"],
  },
  {
    name: "Individual",
    annual: 50,
    sportsCredit: 0,
    perks: ["Tiger news & event updates", "Supports every Tigers team"],
  },
  {
    name: "Tiger Friend",
    anyAmount: true,
    sportsCredit: 0,
    perks: ["Tiger news & event updates", "Supports every Tigers team"],
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

/** Renders the sports-credit bullet from `sportsCredit`, so the wording and
 *  the limit cannot drift apart. Spelled out rather than numeric to sit
 *  naturally beside the other perks ("Six SLOHS All-Sport Annual Passes"). */
export function sportsCreditPerk(n: number): string | null {
  // Tiger Pride and Varsity credit no sport on the final sheet, so there is no
  // bullet to render and no picker to show. Null rather than an empty string so
  // callers have to handle it rather than printing a blank list item.
  if (n <= 0) return null;
  const words = ["", "one", "two", "three", "four", "five", "six"];
  const word = words[n] ?? String(n);
  return n === 1
    ? "Choose one sport to receive the credit"
    : `Choose up to ${word} sports to receive the credit`;
}

/** What a level *name* entitles someone to.
 *
 *  `levelForGift` returns a name and the metadata on a Square order stores that
 *  name, so the donation notification (#187) has a string and needs the perks
 *  behind it. Searches both halves of the ladder because a gift is placed
 *  against both — see the note above `rankedLevels`.
 *
 *  `kind` matters to the caller: a **donation** of $2,500 reaches "Silver
 *  Sponsor" by amount alone, which is not the same as a business having bought
 *  a Silver sponsorship. The notification flags that rather than assuming
 *  either way. */
export type LevelDetail = {
  name: string;
  perks: string[];
  kind: "sponsorship" | "membership";
  /** Sponsorship tiers only — how many sports the tier credits. */
  sportsCredit?: number;
  /** Sponsorship tiers only — All-Sport Annual Passes the level includes. */
  passesIncluded?: number;
};

export function levelByName(name: string): LevelDetail | undefined {
  const tier = SPONSOR_TIERS.find((t) => t.name === name);
  if (tier) {
    return {
      // `tierPerks`, not `tier.perks` — the included-passes line is generated
      // now, and the donation checklist keys its GoFan to-do off it.
      name: tier.name,
      perks: tierPerks(tier),
      kind: "sponsorship",
      sportsCredit: tier.sportsCredit,
      passesIncluded: tier.passesIncluded,
    };
  }
  const membership = GENERAL_MEMBERSHIPS.find((m) => m.name === name);
  return membership
    ? {
        name: membership.name,
        perks: membership.perks,
        kind: "membership",
        // Carried for both halves now, so `sportsAllowedForLevel` has one
        // question to ask rather than two shapes to special-case.
        sportsCredit: membership.sportsCredit,
      }
    : undefined;
}

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
/** How many sports a gift at this level may designate. **The only place this
 *  question is answered** (`docs/sport-designation-plan.md` §3, step 2).
 *
 *  Before #215 the answer was spread across four places that had never been
 *  reconciled: the sponsorship picker enforced a limit, the donation route
 *  enforced nothing at all, and the general memberships had no field to
 *  consult. Every consumer now asks this instead of deciding for itself — the
 *  form, the payment route, the notification and the Treasurer's report.
 *
 *  An unknown level name returns 0. Failing closed is right for a rule about
 *  who may direct money: a name we cannot place is not a name we should be
 *  granting a perk to. */
export function sportsAllowedForLevel(levelName: string | null): number {
  if (!levelName) return 0;
  return levelByName(levelName)?.sportsCredit ?? 0;
}

/** The smallest one-time gift that may designate a sport — derived from the
 *  ladder, never typed.
 *
 *  Shown to a donor whose gift is below it, so the rule is stated as a number
 *  they can act on rather than as a refusal. Derived because the board moves
 *  these figures: when Varsity's price or its allowance changes, this follows
 *  in the same edit instead of becoming a stale "$500" in three components. */
export function minimumForDesignation(): number | null {
  const eligible = [
    ...SPONSOR_TIERS.filter((t) => t.sportsCredit > 0).map((t) => t.annual),
    ...GENERAL_MEMBERSHIPS.filter(
      (t) => t.sportsCredit > 0 && t.annual != null,
    ).map((t) => t.annual as number),
  ];
  return eligible.length ? Math.min(...eligible) : null;
}

/** Whether a gift of `amount` may designate a sport at all. The donation flow's
 *  gate: a donation designates exactly one team, so the question is only ever
 *  "any?", while the sponsorship flow uses the count. */
export function canDesignateSport(
  amount: number,
  mode: "one-time" | "monthly" = "one-time",
): boolean {
  return sportsAllowedForLevel(levelForGift(amount, mode)) > 0;
}

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
