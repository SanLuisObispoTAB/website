// Interim bridge to SLOTAB's existing hosted Square storefront.
//
// WHY THIS EXISTS
// The /donate form was built as a UI prototype with its submit button stubbed
// behind Q1 — the still-open board decision between calling the Square API
// directly and keeping the hosted storefront. That stub shipped to production
// at launch, so a donor who filled in the form got a browser alert instead of
// a checkout. This module routes them to the real storefront in the meantime.
//
// WHAT CARRIES OVER, AND WHAT DOESN'T
// The storefront has a per-sport donation item, so linking to the right one
// puts the designation *in the Square transaction itself* — which is what the
// Treasurer reconciles against, and is stronger than any note we could pass
// alongside. Each item also exposes a $0.00 "enter your own amount" option, so
// there is no upper limit despite the "$10.00 - $100.00" label on the listing.
//
// What does NOT carry: recurring/monthly (these are one-time items), the
// 4-year lock-in, the sponsor-wall display preference, and membership tier
// enrolment. Those are captured separately — see DonateForm.
//
// Retire this whole file once Q1 is decided and the real integration lands.

const STORE = "https://slotab-3.square.site";

/** Team slug → Square product path. Verified against the live storefront on
 *  2026-08-17 by reading its rendered product links.
 *
 *  Three deliberate collapses, because the storefront is less granular than
 *  our team list — it predates this season's structure:
 *   - boys-wrestling + girls-wrestling → one WRESTLING item
 *   - cheer + winter-cheer + competitive-cheer → one CHEER item
 *  The storefront also carries a DANCE item we have no team page for. */
const PATH_BY_SLUG: Record<string, string> = {
  baseball: "/product/baseball/29",
  "boys-basketball": "/product/basketball-boys/27",
  "girls-basketball": "/product/basketball-girls/91",
  "beach-volleyball": "/product/beach-volleyball/82",
  cheer: "/product/cheer/83",
  "winter-cheer": "/product/cheer/83",
  "competitive-cheer": "/product/cheer/83",
  "cross-country": "/product/cross-country/86",
  "flag-football": "/product/flag-football/TDJVK2NHKP6FBDCFEX55MTK7",
  football: "/product/football/81",
  "boys-golf": "/product/golf-boys/93",
  "girls-golf": "/product/golf-girls/88",
  "boys-soccer": "/product/soccer-boys/94",
  "girls-soccer": "/product/soccer-girls/95",
  softball: "/product/softball/96",
  stunt: "/product/stunt/97",
  "boys-swim-dive": "/product/swim-diving-boys/98",
  "girls-swim-dive": "/product/swim-diving-girls/99",
  "boys-tennis": "/product/tennis-boys/100",
  "girls-tennis": "/product/tennis-girls/87",
  "track-field": "/product/track-field/80",
  "boys-volleyball": "/product/volleyball-boys/90",
  "girls-volleyball": "/product/volleyball-girls/89",
  "boys-water-polo": "/product/water-polo-boys/84",
  "girls-water-polo": "/product/water-polo-girls/85",
  "boys-wrestling": "/product/wrestling/101",
  "girls-wrestling": "/product/wrestling/101",
};

const GENERAL_PATH = "/product/general-athletics/92";

/** Checkout URL for a designation. Anything without its own storefront item —
 *  including the "general" option — lands on GENERAL ATHLETICS rather than the
 *  store's front page, so the donor never has to hunt for the right tile. */
export function squareDonateUrl(teamSlug: string): string {
  return `${STORE}${PATH_BY_SLUG[teamSlug] ?? GENERAL_PATH}`;
}

/** True when the designation reaches Square as its own line item. False means
 *  the gift will land under GENERAL ATHLETICS and the team split has to be
 *  applied by hand — which the donor is told, rather than being left to
 *  assume their team got it. */
export function hasOwnSquareItem(teamSlug: string): boolean {
  return teamSlug in PATH_BY_SLUG;
}

/** The storefront's own name for the item a slug lands on. Shown to the donor
 *  before they leave, because it is what will appear on their receipt and it
 *  does not always match the name on our site — all three cheer programmes
 *  land on "CHEER", and both wrestling teams on "WRESTLING". Better to say so
 *  than to let someone think their winter squad was itemised separately. */
const LABEL_BY_PATH: Record<string, string> = {
  "/product/baseball/29": "BASEBALL",
  "/product/basketball-boys/27": "BASKETBALL | BOYS",
  "/product/basketball-girls/91": "BASKETBALL | GIRLS",
  "/product/beach-volleyball/82": "BEACH VOLLEYBALL",
  "/product/cheer/83": "CHEER",
  "/product/cross-country/86": "CROSS COUNTRY",
  "/product/flag-football/TDJVK2NHKP6FBDCFEX55MTK7": "FLAG FOOTBALL",
  "/product/football/81": "FOOTBALL",
  "/product/golf-boys/93": "GOLF | BOYS",
  "/product/golf-girls/88": "GOLF | GIRLS",
  "/product/soccer-boys/94": "SOCCER | BOYS",
  "/product/soccer-girls/95": "SOCCER | GIRLS",
  "/product/softball/96": "SOFTBALL",
  "/product/stunt/97": "STUNT",
  "/product/swim-diving-boys/98": "SWIM & DIVING | BOYS",
  "/product/swim-diving-girls/99": "SWIM & DIVING | GIRLS",
  "/product/tennis-boys/100": "TENNIS | BOYS",
  "/product/tennis-girls/87": "TENNIS | GIRLS",
  "/product/track-field/80": "TRACK & FIELD",
  "/product/volleyball-boys/90": "VOLLEYBALL | BOYS",
  "/product/volleyball-girls/89": "VOLLEYBALL | GIRLS",
  "/product/water-polo-boys/84": "WATER POLO | BOYS",
  "/product/water-polo-girls/85": "WATER POLO | GIRLS",
  "/product/wrestling/101": "WRESTLING",
  [GENERAL_PATH]: "GENERAL ATHLETICS",
};

export function squareItemLabel(teamSlug: string): string {
  return LABEL_BY_PATH[PATH_BY_SLUG[teamSlug] ?? GENERAL_PATH] ?? "GENERAL ATHLETICS";
}
