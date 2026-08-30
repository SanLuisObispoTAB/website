import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
// Prices come from the catalogue rather than being typed here. They are now
// *charged* as well as displayed — the passes add-on (#208) bills from the same
// array — and a page advertising $250 beside a checkout charging something else
// is the #143 failure with a different product on it.
import { PASS_TYPES, passStoreUrl, passTypeById } from "../data/passes";

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

// Looked up by id so a reordering of the catalogue can't silently swap which
// card shows which price. Falls back to the array order if an id ever changes.
const ANNUAL = passTypeById("all-sports-annual") ?? PASS_TYPES[0];
const SINGLE = passTypeById("single-season") ?? PASS_TYPES[1];

export const metadata = {
  title: "Season Passes — SLOTAB",
  description:
    "Catch every Tiger home game — season pass options for SLOHS athletics and buy yours online.",
};

// THIS PAGE COULD NOT SELL A PASS UNTIL #213.
//
// Erik: *"the new website, on the passes page, takes the person to membership
// rather than letting them purchase a pass."* Both "Get a Pass" buttons pointed
// at `/membership` — a page about joining the club, which does not sell passes
// and never did. Somebody who arrived wanting a pass, with the price in front
// of them, was sent to read about membership tiers instead. The old WordPress
// site sold them; this was a regression at the cutover, not a missing feature.
//
// Both passes have existed as real Square storefront items the whole time, at
// exactly these prices. The buttons now go there. See `passes.ts` for why the
// storefront is the right home for a pass — briefly: the Single Season Pass
// carries its required Fall/Winter/Spring option on the Square item itself, and
// a storefront sale raises Square's *order* notification, which names the item
// and the buyer, rather than the bare *payment* notification a minted link
// raises (#187).

export default function SeasonPassesPage() {
  return (
    <>
      <PageHeader kicker="Catch Every Home Game" title="Season Passes" />
      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-grid" style={{ maxWidth: 820, margin: "0 auto" }}>
            <div className="slotab-card dark">
              <div className="slotab-pass-image">
                <Image
                  src="/season-passes/all-season.jpg"
                  alt="All Sports Annual Pass"
                  width={400}
                  height={400}
                />
              </div>
              <h3>{ANNUAL.name}</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#ffcd38", margin: "0.5rem 0" }}>
                {MONEY.format(ANNUAL.price)}
              </p>
              <p>
                Gain entry to all SLOHS Fall, Winter, and Spring regular
                season home games during the school year.
              </p>
              {/* A plain anchor, not next/link: this leaves the site for the
                  club's Square store. The label says "Buy" rather than "Get a
                  Pass" because it now does what it says. */}
              <a href={passStoreUrl(ANNUAL)} className="slotab-btn">
                Buy an Annual Pass →
              </a>
            </div>
            <div className="slotab-card dark">
              <div className="slotab-pass-image">
                <Image
                  src="/season-passes/single-season.jpg"
                  alt="Single Season Pass"
                  width={400}
                  height={400}
                />
              </div>
              <h3>{SINGLE.name}</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#ffcd38", margin: "0.5rem 0" }}>
                {MONEY.format(SINGLE.price)}
              </p>
              <p>
                Gain entry to SLOHS regular season home games during one
                season (Fall, Winter, or Spring).
              </p>
              {/* Said here rather than discovered on the next page: the season
                  is a required choice on the Square item, so a buyer who skips
                  it cannot check out. Better to arrive expecting the question. */}
              <p className="slotab-pass-note">
                You&apos;ll choose Fall, Winter or Spring at checkout.
              </p>
              <a href={passStoreUrl(SINGLE)} className="slotab-btn">
                Buy a Season Pass →
              </a>
            </div>
          </div>

          {/* The store's own purchase button reads "Join/Renew" on both pass
              items — the storefront's wording for everything it sells, not a
              sign you have landed on a membership. Said here because this page
              exists to stop exactly that confusion, and a buyer who reaches a
              button labelled "Join" after clicking "Buy a pass" is entitled to
              wonder whether they took a wrong turn. */}
          <p className="slotab-pass-store-note">
            Passes are sold through the club&apos;s Square store, so both
            buttons open checkout on <strong>square.site</strong>, where the
            purchase button reads <strong>Join/Renew</strong> — that is the
            store&apos;s wording for every item, and you are buying a pass.
            Payment is handled by Square; SLOTAB never sees your card details.
          </p>

          <div className="slotab-prose" style={{ marginTop: "3rem", textAlign: "center" }}>
            <p>
              All Sports Annual Passes are also included with select SLO Tiger
              Athletic Booster Club General and Business Membership levels.
              See the{" "}
              <Link href="/membership">membership page</Link>{" "}
              for details.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
