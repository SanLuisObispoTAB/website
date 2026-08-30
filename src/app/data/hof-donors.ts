import wallData from "./hof-donors.json";
import { donorKey } from "./donors";
import { SPECIAL_FUNDS, specialFund } from "./special-funds";

// The Hall of Fame Fund's thank-you wall.
//
// WHY THE FUND HAS A WALL OF ITS OWN
// Erik, 2026-08-29, correcting an assumption of mine: *"I had thought you meant
// by donor wall, the wall on the HOF page — not the sponsorship/membership
// wall. The former is the proper place for a HOF donation to go."*
//
// He was describing where a Hall of Fame gift *should* be recognised. It was
// not where one *went*: `/hall-of-fame` had no donor wall at all — the only
// roll on that page is Past Inductees, who are being honoured, not thanking.
// Every Hall of Fame donor was being proposed onto the membership wall at
// `/membership`, under one of the club's eight membership tiers.
//
// TWO DIFFERENCES FROM `donors.ts`, BOTH DELIBERATE
//
// 1. NO SEASON. The membership wall carries `season: "2026-2027"` and is
//    cleared and rebuilt each year, because a membership *is* annual. The Hall
//    of Fame Fund is a standing fund (#186) that inducts every other year, so a
//    name given in 2026 is not stale in 2027 — it paid for a medallion that is
//    still on somebody's shelf. This wall accumulates.
//
// 2. THE HEADINGS ARE THE FUND'S RUNGS, not the club's tiers. "Ceremony
//    underwriter", not "Tiger Pride". Same argument as #211: a Hall of Fame
//    donor filed at a sponsorship tier is publicly credited with a sponsorship
//    they never bought.
//
// The second difference is what makes filing automatic again. Since #211 a
// fund gift's `metadata.level` IS one of these rung names, so `/board/donor-wall`
// can file a donor from what the checkout recorded — the same trick #200 plays
// on the membership wall, with the fund's ladder in place of the sheet.

export type HofDonor = { name: string };
export type HofDonorTier = { tier: string; donors: HofDonor[] };
export type HofDonorWall = { tiers: HofDonorTier[] };

export const HOF_FUND_SLUG = "hall-of-fame";

/** Where a gift lands when it reaches no named rung.
 *
 *  Not "tier to be confirmed", which is what the membership wall says, because
 *  this is usually not uncertainty: the ladder starts at $50 and the site takes
 *  gifts from $25, so a $30 gift genuinely bought no named object. It is still
 *  a gift to the fund and the person still said yes to being listed, so the
 *  heading has to be one that is true and publishable as it stands — not a
 *  placeholder waiting on a board member who has no decision left to make. */
export const HOF_FALLBACK_TIER = "Friends of the Hall of Fame";

/** The fund's rungs, richest first — the wall's heading order. */
export function hofTierOrder(): string[] {
  const fund = specialFund(HOF_FUND_SLUG);
  const rungs = (fund?.levels ?? [])
    .slice()
    .sort((a, b) => b.amount - a.amount)
    .map((l) => l.item);
  return [...rungs, HOF_FALLBACK_TIER];
}

/** Headings a name may be filed under — the fund's rungs plus the fallback.
 *  The board page renders the dropdown from this and the API route validates
 *  against it, so the form may *choose* a heading but never *invent* one. Same
 *  rule as `isCanonicalTier` on the membership wall, and for the same reason:
 *  a heading is a claim about what somebody gave, over their name, in public. */
export function isHofTier(name: string): boolean {
  return hofTierOrder().includes(name);
}

/** Every fund that has a wall of its own, as slug → the file that holds it.
 *
 *  A map rather than a convention, so a fund added to `SPECIAL_FUNDS` without a
 *  wall file is a *visible* gap rather than a silent fallback onto the
 *  membership wall — which is the exact bug this whole change exists to fix. */
export const FUND_WALL_PATHS: Record<string, string> = {
  [HOF_FUND_SLUG]: "src/app/data/hof-donors.json",
};

export function fundWallPath(designation: string): string | undefined {
  return specialFund(designation) ? FUND_WALL_PATHS[designation] : undefined;
}

/** True when this designation is a fund whose donors belong on its own wall
 *  rather than on the membership one. */
export function hasOwnDonorWall(designation: string): boolean {
  return Boolean(fundWallPath(designation));
}

/** Funds carrying a designation but no wall file — a build-time sanity check
 *  for whoever adds the second fund. Empty today. */
export function fundsWithoutWalls(): string[] {
  return SPECIAL_FUNDS.filter((f) => !FUND_WALL_PATHS[f.slug]).map((f) => f.slug);
}

export const HOF_WALL = wallData as HofDonorWall;

/** The wall's tiers in ladder order, skipping any that hold no names. A rung
 *  nobody has given at is not a heading; it is an empty promise on a public
 *  page. */
export function orderedHofTiers(): HofDonorTier[] {
  const order = hofTierOrder();
  return (HOF_WALL.tiers ?? [])
    .filter((t) => t.donors?.length)
    .slice()
    .sort((a, b) => {
      const ai = order.indexOf(a.tier);
      const bi = order.indexOf(b.tier);
      // An unrecognised heading sorts last rather than first — if a rung is
      // ever renamed in hof.json, the names filed under the old wording stay
      // on the page instead of jumping to the top of it.
      return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi);
    });
}

/** How many names are on the wall — used to decide whether to render it at all. */
export function hofDonorCount(): number {
  return (HOF_WALL.tiers ?? []).reduce(
    (n, t) => n + (t.donors?.length ?? 0),
    0,
  );
}

/** Is this name already on the wall belonging to `designation`?
 *
 *  Per-designation rather than per-name, and that distinction matters: the
 *  membership wall's `isOnWall` would report a Hall of Fame donor as "already
 *  listed" and quietly drop them from the queue, and the reverse would stop
 *  somebody who gave to the fund from ever being offered for a team gift. The
 *  same person can legitimately appear on both walls, for two different gifts.
 *
 *  False for a designation with no wall of its own, which sends the caller back
 *  to the membership wall — the right answer for a team or the general fund. */
export function isOnFundWall(designation: string, name: string): boolean {
  if (!hasOwnDonorWall(designation)) return false;
  const key = donorKey(name);
  return (HOF_WALL.tiers ?? []).some((t) =>
    (t.donors ?? []).some((d) => donorKey(d.name) === key),
  );
}
