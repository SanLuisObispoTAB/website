import { sponsorTierById, type SponsorTier } from "../app/data/sponsor-tiers";
import { SPONSOR_TIERS as WALL_TIERS } from "../app/data/sponsors";
import teamsData from "../app/data/teams.json";

// Composes the handoff email that reaches the Membership VP when a business
// sponsorship is paid for.
//
// WHY THIS EXISTS
// Square tells the club that money arrived. It does not tell anyone that a
// business is now owed three banners, eight All-Sport passes and a scoreboard
// ad — and the person who has to arrange all of that is a volunteer who is not
// watching the Square dashboard. Until now the first she heard of a new sponsor
// was when someone happened to mention it.
//
// WHAT IT DELIBERATELY DOES NOT DO
// It does not restate the perks from memory. The board's sheet is transcribed
// once, in `sponsor-tiers.ts`, and this email renders **that array verbatim**
// as the checklist. When the board revises the offering, the email follows on
// its own. A hand-maintained second copy of "what a Gold sponsor gets" is the
// exact drift this codebase has been bitten by more than once (#143, #145).

/** What Square hands us about a completed sponsorship payment. Flat and
 *  provider-shaped on purpose — the webhook route does the digging into
 *  Square's payload, and everything below is pure composition, so it can be
 *  exercised without a Square account. */
export type SponsorshipPayment = {
  /** `metadata.business` — the business name the buyer typed. May be blank:
   *  Square's checkout collects a *person with a card*, and the business field
   *  is ours, not theirs. */
  businessName?: string;
  /** `metadata.tier` — a `sponsor-tiers.ts` id. */
  tierId: string;
  amountCents: number;
  /** `metadata.sports` — team slugs, comma separated. */
  sportSlugs: string[];
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  /** Square ids, so the Treasurer can find the payment without searching. */
  paymentId?: string;
  orderId?: string;
  /** ISO timestamp from Square. */
  paidAt?: string;
  /** `metadata.test` — a board review charge, not a real sponsor. */
  isTest?: boolean;
};

type Team = { slug: string; name: string; gender?: string };
const TEAMS = teamsData.teams as Team[];

function teamDisplayName(team: Team): string {
  return !team.gender || team.gender === "Co-ed"
    ? team.name
    : `${team.name} (${team.gender})`;
}

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Loose match between the business name a buyer typed at checkout and the
 *  name on the sponsor wall.
 *
 *  These two strings are entered by different people months apart, so exact
 *  equality finds almost nothing: "The Center Studio & Boutique" on the wall
 *  against "Center Studio and Boutique, LLC" at the till. Lower-cases, expands
 *  `&`, drops a leading "the", strips company suffixes and punctuation.
 *
 *  A false positive here says "we already hold their logo" when we don't, which
 *  costs a chased email; a false negative says "obtain a logo" when we have one,
 *  which costs a redundant ask. Both are cheap and recoverable, which is why
 *  this is allowed to be fuzzy at all — nothing branches on it except the
 *  wording of a line in an email to a human. */
function normaliseBusiness(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[.,'’]/g, "")
    .replace(/\b(inc|llc|llp|ltd|co|corp|company)\b/g, " ")
    .replace(/^\s*the\s+/, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Do two normalised business names refer to the same business?
 *
 *  Token subset, not substring. Substring containment looks like it works and
 *  quietly doesn't: "crocker construction" is NOT a substring of "crocker
 *  coastal construction", because the extra word lands in the middle — which
 *  is the single most likely way these two strings differ, since the wall
 *  spells a name off the company's logo and the buyer types their trading name.
 *
 *  A one-word name must match exactly. Subset matching on a single token is
 *  where the false positives live: "Center" is a subset of both "The Center
 *  Studio & Boutique" and "Primary Eyecare Center", and picking the wrong one
 *  would report someone else's logo as being on file. */
function namesMatch(a: string, b: string): boolean {
  if (!a || !b) return false;
  if (a === b) return true;
  const at = a.split(" ").filter(Boolean);
  const bt = b.split(" ").filter(Boolean);
  const [short, long] = at.length <= bt.length ? [at, bt] : [bt, at];
  if (short.length < 2) return false;
  const longSet = new Set(long);
  return short.every((t) => longSet.has(t));
}

export type WallRecord = {
  /** The name as the wall spells it, when we found a match. */
  matchedName?: string;
  logo?: string;
  website?: string;
};

/** What the sponsor wall already holds for this business. */
export function lookupWallRecord(businessName?: string): WallRecord {
  if (!businessName?.trim()) return {};
  const target = normaliseBusiness(businessName);
  if (!target) return {};
  for (const tier of WALL_TIERS) {
    for (const s of tier.sponsors) {
      if (namesMatch(target, normaliseBusiness(s.name))) {
        return { matchedName: s.name, logo: s.logo, website: s.website };
      }
    }
  }
  return {};
}

/** An annotation appended to a perk that needs something *from the sponsor*
 *  before it can be actioned. Matched on keywords, and deliberately additive:
 *  a keyword that stops matching loses its note, never its checklist line. */
function perkAction(perk: string): string | null {
  const p = perk.toLowerCase();
  if (p.includes("banner")) {
    return "confirm which sport locations they want, then place the banner order";
  }
  if (p.includes("all-sport annual pass")) {
    return "issue via GoFan to the contact below";
  }
  if (p.includes("digital ad")) {
    return "artwork needed at scoreboard spec — Zach Roper runs the Jumbotron template";
  }
  if (p.includes("t-shirt")) {
    return "logo needed in print-ready vector before the shirt order goes in";
  }
  if (p.includes("hudl")) {
    return "video asset needed, or offer to run their existing spot";
  }
  if (p.includes("game sponsor") || p.includes("tickets")) {
    return "pick the game and reserve the seats";
  }
  if (p.includes("recognition")) {
    return "add to the sponsor wall in src/app/data/sponsors.json";
  }
  return null;
}

export type FulfilmentEmail = {
  subject: string;
  text: string;
};

/** Build the handoff email. Pure — no Square call, no network. */
export function composeFulfilmentEmail(
  payment: SponsorshipPayment,
): FulfilmentEmail | null {
  const tier: SponsorTier | undefined = sponsorTierById(payment.tierId);
  // Refuse rather than improvise. An email naming a tier we cannot price, and
  // listing no perks, would send the VP chasing a sponsorship nobody sold.
  if (!tier) return null;

  const business = payment.businessName?.trim();
  const wall = lookupWallRecord(business);
  const amount = MONEY.format(payment.amountCents / 100);
  const testPrefix = payment.isTest ? "[TEST — board review] " : "";

  const subject = `${testPrefix}New ${tier.name}: ${business || "business name not given"} — ${amount}`;

  const lines: string[] = [];

  if (payment.isTest) {
    lines.push(
      "*** THIS IS A BOARD TEST CHARGE, NOT A REAL SPONSOR. ***",
      "It was minted through the preview checkout and should be refunded.",
      "No fulfillment is owed. Nothing below needs action.",
      "",
    );
  }

  // Tier names already end in "Sponsor" for three of the five, so don't append
  // the word again — "A Gold Sponsor sponsorship has been paid for."
  const tierPhrase = /sponsor$/i.test(tier.name)
    ? `a ${tier.name}`
    : `a ${tier.name} sponsorship`;
  lines.push(
    `${business || "A business"} has signed up as ${tierPhrase}.`,
    "",
    "THE SPONSOR",
    `  Business:  ${business || "NOT GIVEN AT CHECKOUT — ask the contact below"}`,
    `  Tier:      ${tier.name} (${MONEY.format(tier.annual)}/year)`,
    `  Paid:      ${amount}`,
  );
  if (payment.paidAt) lines.push(`  When:      ${payment.paidAt}`);
  if (payment.paymentId) lines.push(`  Square ID: ${payment.paymentId}`);
  lines.push("");

  lines.push("CONTACT");
  lines.push(`  Name:   ${payment.buyerName || "not provided"}`);
  lines.push(`  Email:  ${payment.buyerEmail || "not provided"}`);
  lines.push(`  Phone:  ${payment.buyerPhone || "not provided"}`);
  lines.push(
    "  (This is the person who paid. For a business sponsorship that is",
    "   often an office manager rather than the marketing contact.)",
    "",
  );

  // The bit Erik asked for by name: say what we already hold, and say plainly
  // what has to be chased.
  lines.push("ARTWORK & LINKS WE HOLD");
  if (wall.matchedName && wall.matchedName !== business) {
    lines.push(`  Matched to "${wall.matchedName}" on the sponsor wall.`);
  }
  lines.push(
    wall.logo
      ? `  Logo:    ON FILE — ${wall.logo}`
      : "  Logo:    NEEDED — request a high-resolution logo (vector/PNG preferred)",
  );
  lines.push(
    wall.website
      ? `  Website: ON FILE — ${wall.website}`
      : "  Website: NEEDED — request the URL to link their logo to",
  );
  if (!wall.matchedName) {
    lines.push(
      "  This business is not on the sponsor wall yet, so both are needed",
      "  before their website recognition can go live.",
    );
  }
  lines.push("");

  lines.push("SPORTS CREDITED");
  if (tier.sportsCredit === 0) {
    lines.push(`  None — ${tier.name} is not credited to a specific sport.`);
  } else if (payment.sportSlugs.length === 0) {
    lines.push(
      `  NONE CHOSEN — this tier may name up to ${tier.sportsCredit}.`,
      "  Worth asking, since it is a perk they have paid for.",
    );
  } else {
    for (const slug of payment.sportSlugs) {
      const team = TEAMS.find((t) => t.slug === slug);
      lines.push(`  · ${team ? teamDisplayName(team) : slug}`);
    }
    if (payment.sportSlugs.length < tier.sportsCredit) {
      lines.push(
        `  (${payment.sportSlugs.length} of ${tier.sportsCredit} chosen — they may name more.)`,
      );
    }
  }
  lines.push("");

  // Rendered from the tier's own perks array, so it cannot drift from what
  // /membership promises or what the payment link charged.
  lines.push("FULFILLMENT CHECKLIST");
  for (const perk of tier.perks) {
    const action = perkAction(perk);
    lines.push(`  [ ] ${perk}`);
    if (action) lines.push(`        → ${action}`);
  }
  lines.push("");

  lines.push(
    "---",
    "Sent automatically by slotab.org when Square confirms a sponsorship",
    "payment. The checklist is generated from the board's sponsorship sheet",
    "as transcribed in src/app/data/sponsor-tiers.ts — if a perk is wrong,",
    "fix it there and every surface follows.",
  );

  return { subject, text: lines.join("\n") };
}
