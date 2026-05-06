import sponsorsJson from "./sponsors.json";

export type Sponsor = {
  name: string;
  logo: string;
  /** Optional sponsor website. When present, the logo on the sponsor wall
   * is wrapped in an external link. */
  website?: string;
};

export type SponsorTier = {
  tier: "Platinum" | "Gold" | "Silver" | "Bronze";
  sponsors: Sponsor[];
};

// Sponsor tiers are editable via Decap CMS at
// /admin/#/collections/sponsors
export const SPONSOR_TIERS: SponsorTier[] =
  sponsorsJson.tiers as SponsorTier[];

export const SPONSOR_SEASON: string = sponsorsJson.season;
