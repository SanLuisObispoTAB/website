import donorsJson from "./donors.json";

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
// STILL TRUE FROM #197: names only within a tier — no amounts, no dates. And
// the tier headings are the board's own naming ("Coach Membership"), which
// matches neither the sponsor ladder nor the general-membership names in
// sponsor-tiers.ts. That is a third vocabulary and deliberately free text here,
// because inventing a mapping would rename people's recognition on their
// behalf.

export type Donor = {
  /** As the board lists them. Couples, families and organisations are normal
   *  here — "Tom & Nicole Katona", "Yeung Family", "Renaissance Foundation" —
   *  which is why this is one free-text field and not first/last. */
  name: string;
};

export type DonorTier = {
  /** The board's own heading, e.g. "Champion Membership". Free text: see the
   *  note above about the three competing vocabularies. */
  tier: string;
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

/** Is this person already listed anywhere on the wall?
 *
 *  Across ALL tiers, not within one: a donor who gave again at a higher level
 *  should be moved by a human, not silently listed twice. */
export function isOnWall(name: string, wall: DonorWall = DONOR_WALL): boolean {
  const key = donorKey(name);
  return allDonors(wall).some((d) => donorKey(d.name) === key);
}
