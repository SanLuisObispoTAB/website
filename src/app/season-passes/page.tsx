import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";

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
              <h3>All Sports Annual Pass</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#ffcd38", margin: "0.5rem 0" }}>
                $250
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
              <h3>Single Season Pass</h3>
              <p style={{ fontSize: "2rem", fontWeight: 700, color: "#ffcd38", margin: "0.5rem 0" }}>
                $125
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
