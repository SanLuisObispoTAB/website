import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
// Prices come from the catalogue rather than being typed here. They are now
// *charged* as well as displayed — the passes add-on (#208) bills from the same
// array — and a page advertising $250 beside a checkout charging something else
// is the #143 failure with a different product on it.
import { PASS_TYPES, passTypeById } from "../data/passes";

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
    "Catch every Tiger home game — season pass options for SLOHS athletics and how to get yours.",
};

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
              <Link href="/membership" className="slotab-btn">
                Get a Pass
              </Link>
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
              <Link href="/membership" className="slotab-btn">
                Get a Pass
              </Link>
            </div>
          </div>

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
