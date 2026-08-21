import sponsorsJson from "./sponsors.json";

export type Sponsor = {
  name: string;
  /** Optional. A sponsor is on the wall the moment they pay, which is often
   *  well before anyone chases them for artwork — 4 of the 8 in the 2026-27
   *  rebuild had none. Without a logo the tile renders the business name as
   *  a wordmark instead, so a paying sponsor is never simply missing. Note
   *  the homepage wall needs a matching transparent copy under
   *  /sponsors/alpha/ whenever this IS set. */
  logo?: string;
  /** Optional sponsor website. When present, the tile on the sponsor wall
   * is wrapped in an external link. */
  website?: string;
};

// Tier names follow the 2026-27 sponsorship offering. The wall is
// re-tiered fresh each season; these labels replaced the prior
// Platinum/Gold/Silver/Bronze ladder (Platinum→Champion, Bronze→Varsity).
export type SponsorTier = {
  /** Ladder order, top down: Champion $10,000 · Gold $5,000 · Silver $2,500 ·
   *  Tiger Pride $1,000 · Varsity $500. "Tiger Pride" is the only one whose
   *  label contains a space, so anywhere a tier name becomes a CSS class it
   *  must be slugified rather than lower-cased — see tierSlug(). */
  tier: "Champion" | "Gold" | "Silver" | "Tiger Pride" | "Varsity";
  sponsors: Sponsor[];
};

/** Tier label → CSS-safe class fragment. `"Tiger Pride".toLowerCase()` yields
 *  a string with a space, which silently splits into two class names. */
export function tierSlug(tier: SponsorTier["tier"]): string {
  return tier.toLowerCase().replace(/\s+/g, "");
}

// Sponsor tiers are editable via Decap CMS at
// /admin/#/collections/sponsors
export const SPONSOR_TIERS: SponsorTier[] =
  sponsorsJson.tiers as SponsorTier[];

export const SPONSOR_SEASON: string = sponsorsJson.season;
