import donorsJson from "./donors.json";
import { GENERAL_MEMBERSHIPS, SPONSOR_TIERS } from "./sponsor-tiers";

// The donor wall — "Thank You to Our Members" at the foot of /membership.
//
// IT ALREADY EXISTED, AND THAT MATTERS
// #197 built a separate /donors page after a grep for "donor wall" came back
// empty. The grep was the mistake: the section has been on /membership since
// launch, hardcoded as JSX, and the code never uses the phrase. Erik pointed at
// it — "that should be the template for this year's" — and it overturns two of
// #197's decisions outright (#198):
//
//   · It is GROUPED BY MEMBERSHIP TIER, publicly, and has been. #197 reasoned
//     that publishing a tier implies what someone gave and went names-only.
//     That reasoning was sound in the abstract and irrelevant in fact: the
//     board already publishes tier groupings, and this is their call, not a
//     question to be reopened by a refactor.
//   · It lives on /membership, where people already look for it. A second wall
//     at /donors would be a second place to keep current.
//
// This file is that section, turned into data so the board can edit it at
// /admin instead of the JSX being retyped each season — and so the staging
// page at /board/donor-wall can generate entries for it.
//
// THE TIER HEADINGS ARE THE CLUB'S REAL LADDER, NOT FREE TEXT (#200)
// #198 recorded the opposite — that "Coach Membership" was a third vocabulary
// the board had chosen, so headings should stay free text and a human should
// file every new donor by hand. Erik corrected it: "The tiers for the donor
// wall don't match the membership tiers. There are three general membership
// tiers and the five sponsorship tiers (which could be businesses or
// personal)." There is no third vocabulary. There are EIGHT tiers, they live in
// `sponsor-tiers.ts`, and they are the same eight that `/membership` renders,
// that `levelForGift()` names, and that the Square order's `metadata.level`
// records at checkout.
//
// So the ladder below is DERIVED, never retyped. If the board revises the
// sheet, the wall's headings follow in the same edit — and because a donation's
// recorded level is one of these exact strings, a new donor can be filed
// automatically instead of a volunteer guessing which heading to pick.
//
// WHAT ABOUT THE HEADINGS ALREADY ON THE PAGE
// Three of the four ("Champion Membership", "Coach Membership", and the Alumni
// block) predate this and name nothing on the current sheet. They are marked
// `group` rather than renamed, because a heading is a claim about what somebody
// gave: moving "Coach Membership" to a canonical tier would publish 29 people
// at a level no record says they chose. They render exactly as they always
// have, and /board/donor-wall asks the board to refile them. Only "Tiger Pride
// Membership" was renamed, to "Tiger Pride" — the same tier, spelled as the
// sheet spells it.

/** A tier a donor can be filed under: the club's own ladder, richest first.
 *
 *  Both halves of the sheet, because a gift is placed against both — see the
 *  note above `rankedLevels` in sponsor-tiers.ts. `kind` is carried through so
 *  the board page can group the dropdown the way the sheet groups the page.
 *
 *  `name` is the join key across four places: this wall, `/membership`,
 *  `levelForGift()`, and `metadata.level` on the Square order. They match
 *  because they are all this array. */
export type CanonicalTier = {
  name: string;
  kind: "sponsorship" | "membership";
};

export const CANONICAL_TIERS: CanonicalTier[] = [
  ...SPONSOR_TIERS.map((t) => ({ name: t.name, kind: "sponsorship" as const })),
  ...GENERAL_MEMBERSHIPS.map((t) => ({ name: t.name, kind: "membership" as const })),
];

export const CANONICAL_TIER_NAMES: string[] = CANONICAL_TIERS.map((t) => t.name);

/** Is this heading one the club actually offers? The guard on everything that
 *  writes a tier — the Accept button, the CMS, an auto-file from Square. */
export function isCanonicalTier(name: string): boolean {
  return CANONICAL_TIER_NAMES.includes(name);
}

export type Donor = {
  /** As the board lists them. Couples, families and organisations are normal
   *  here — "Tom & Nicole Katona", "Yeung Family", "Renaissance Foundation" —
   *  which is why this is one free-text field and not first/last. A
   *  sponsorship tier holds businesses or people indifferently; the ladder is
   *  about the amount, not about who gave it. */
  name: string;
};

export type DonorTier = {
  /** One of `CANONICAL_TIER_NAMES`, unless `group` says otherwise. */
  tier: string;
  /** Absent for a real tier off the sheet — which is what every new entry is.
   *
   *  `legacy` — a heading from before the wall was tied to the ladder (#200),
   *  kept verbatim until the board refiles the names under it. Nothing new is
   *  ever written to one.
   *  `callout` — not a giving level at all, but an explanatory block that has
   *  always rendered inside this section (the Alumni Membership invitation).
   *  Sorts last, because it reads as a call to action. */
  group?: "legacy" | "callout";
  /** Optional blurb, for a tier that explains itself rather than listing names
   *  (the Alumni Membership block is exactly this). */
  note?: string;
  /** Optional call to action beneath the blurb. */
  link?: { href: string; label: string };
  donors: Donor[];
};

export type DonorWall = {
  /** Rebuilt each season, same convention as the sponsor wall. */
  season: string;
  tiers: DonorTier[];
  /** Suppression list for the staging queue at /board/donor-wall.
   *
   *  Stores `donorKey` values, NOT display names, and that is deliberate. Most
   *  entries here are duplicates, businesses that belong on the sponsor wall,
   *  or a name string that came through badly — housekeeping, not judgements
   *  about people. But this repo is public, and a legible list headed "people
   *  we chose not to list" would read as one whatever the reason. A key like
   *  "tomnicolekatona" suppresses the row without publishing a roll of the
   *  declined. */
  dismissed?: Array<{ key: string; note?: string }>;
};

/** Comparison key for "is this person already on the wall?".
 *
 *  Reduces a name to its letters and digits alone: case, accents, punctuation
 *  and **spacing** all removed. So "Mary-Anne O'Brien", "Mary Anne OBrien" and
 *  "maryanne obrien" are one person, and "José" matches "Jose".
 *
 *  Spacing has to go, and that was learned the hard way: an earlier version
 *  deleted the hyphen without replacing it, turning "Mary-Anne" into "maryanne"
 *  while "Mary Anne" stayed "mary anne" — so the same donor was offered for the
 *  wall twice, which is precisely the duplicate this key exists to prevent.
 *
 *  It still does NOT try to be clever about nicknames or middle names: "Bob
 *  Smith" and "Robert Smith" stay distinct. Merging those wrongly would publish
 *  one person's recognition under another person's name; the cost of a missed
 *  merge is a board member deleting a duplicate line. Those are not comparable
 *  errors, so the key only ever merges names that are the same letters. */
export function donorKey(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");
}

// Editable via Decap CMS at /admin/#/collections/donors
export const DONOR_WALL: DonorWall = donorsJson as DonorWall;

/** Every listed name, flattened across tiers. */
export function allDonors(wall: DonorWall = DONOR_WALL): Donor[] {
  return wall.tiers.flatMap((t) => t.donors);
}

/** Has this person been dismissed from the staging queue? */
export function isDismissed(name: string, wall: DonorWall = DONOR_WALL): boolean {
  const key = donorKey(name);
  return (wall.dismissed ?? []).some((d) => d.key === key);
}

/** Is this person already listed anywhere on the wall?
 *
 *  Across ALL tiers, not within one: a donor who gave again at a higher level
 *  should be moved by a human, not silently listed twice. */
export function isOnWall(name: string, wall: DonorWall = DONOR_WALL): boolean {
  const key = donorKey(name);
  return allDonors(wall).some((d) => donorKey(d.name) === key);
}

/** The wall's tiers in the order they should render: the club's ladder first,
 *  richest first, then anything still carrying a legacy heading, then the
 *  callout blocks.
 *
 *  Sorted here rather than in the JSON so the order cannot rot. A tier's
 *  position is a fact about the sheet, and the sheet is `sponsor-tiers.ts`; if
 *  the board reorders the ladder there, the wall follows without anyone
 *  remembering to drag rows in the CMS. Empty tiers are dropped — a heading
 *  with nothing under it is just a gap on the page. */
export function orderedTiers(wall: DonorWall = DONOR_WALL): DonorTier[] {
  const rank = (t: DonorTier) => {
    if (t.group === "callout") return 2000;
    if (t.group === "legacy") return 1000;
    const i = CANONICAL_TIER_NAMES.indexOf(t.tier);
    // An unrecognised heading with no `group` shouldn't exist, but if one is
    // typed into the CMS it sorts with the legacy block rather than vanishing.
    return i === -1 ? 1000 : i;
  };
  return wall.tiers
    .filter((t) => t.donors.length > 0 || t.note)
    .sort((a, b) => rank(a) - rank(b));
}

/** Tiers still carrying a pre-#200 heading, for the board page's nudge. */
export function legacyTiers(wall: DonorWall = DONOR_WALL): DonorTier[] {
  return wall.tiers.filter((t) => t.group === "legacy" && t.donors.length > 0);
}
