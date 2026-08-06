import sponsorsJson from "./sponsors.json";

export type Sponsor = {
  name: string;
  logo: string;
  /** Optional sponsor website. When present, the logo on the sponsor wall
   * is wrapped in an external link. */
  website?: string;
};

// Tier names follow the 2026-27 sponsorship offering. The wall is
// re-tiered fresh each season; these labels replaced the prior
// Platinum/Gold/Silver/Bronze ladder (Platinum→Champion, Bronze→Varsity).
export type SponsorTier = {
  tier: "Champion" | "Gold" | "Silver" | "Varsity";
  sponsors: Sponsor[];
};

// Sponsor tiers are editable via Decap CMS at
// /admin/#/collections/sponsors
export const SPONSOR_TIERS: SponsorTier[] =
  sponsorsJson.tiers as SponsorTier[];

export const SPONSOR_SEASON: string = sponsorsJson.season;
