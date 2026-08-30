import Link from "next/link";
import HofCeremonyStrip from "../components/HofCeremonyStrip";
import HofDonorWall from "../components/HofDonorWall";
import HofFund, { HofLegacyStrip } from "../components/HofFund";
import InducteeGrid from "../components/InducteeGrid";
import PageHeader from "../components/PageHeader";
import hofData from "../data/hof.json";

export const metadata = {
  title: "Hall of Fame — SLOTAB",
};

// hof.json ships `committee: []` until the real roster lands, which infers as
// never[], so the shape is declared here rather than read off the JSON.
type CommitteeMember = { name: string; role: string; note?: string };

export default function HallOfFamePage() {
  const {
    missionStatement,
    officialPage,
    nominationForms,
    nominationCriteria,
    alumniMembership,
  } = hofData;
  const committee = hofData.committee as CommitteeMember[];

  return (
    <>
      <PageHeader
        kicker="Honoring Tiger Excellence"
        title="Athletics Hall of Fame"
      />

      {/* The Hall of Fame Fund — the fundraising band (#184, reframed #186).
          FIRST BLOCK ON THE PAGE, at Erik's call 2026-08-21: it opened below
          the mission and the save-the-date, which put the only ask on the page
          under the fold on a laptop. The ceremony strip now sits directly
          beneath it (the ask still reads next to the night it pays for) and
          the mission — context, not a call to action — moves below both. */}
      <HofFund />

      {/* Ceremony — induction at Booster Bash. Directly under the fund band:
          the save-the-date is what the money is for. Extracted to a component
          in #185 so the unlisted review page renders the same strip, not a
          copy of it that drifts the next time the venue moves. */}
      <HofCeremonyStrip />

      {/* The fund's own thank-you wall (#212). After the ask and the
          save-the-date, because it answers "who else has?" — a question
          somebody asks once they have already read the request, not before it.
          Renders nothing while the wall is empty. */}
      <HofDonorWall />

      {/* Legacy photo strip — after the save-the-date, as the transition from
          the ask into what the Hall of Fame actually is. */}
      <HofLegacyStrip />

      {/* Mission + official link */}
      <section className="slotab-section">
        <div className="slotab-container slotab-prose" style={{ textAlign: "center" }}>
          <p style={{ fontSize: "1.15rem" }}>{missionStatement}</p>
          <p>
            <Link
              href={officialPage}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-btn"
            >
              Visit the Official SLOHS HOF Page
            </Link>
          </p>
        </div>
      </section>

      {/* Past Inductees — filterable grid */}
      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">46 Inductees and Counting</span>
            <h2>Past Inductees</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              Every Tiger athlete, coach, and contributor enshrined in the
              SLOHS Hall of Fame since its founding. Filter by sport or
              search by name.
            </p>
          </div>
          <InducteeGrid />
        </div>
      </section>

      {/* Nomination criteria */}
      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Know a Tiger Legend?</span>
            <h2>Nominate an Inductee</h2>
          </div>
          <div className="slotab-grid" style={{ maxWidth: 920, margin: "0 auto" }}>
            <div className="slotab-card">
              <h3>Athlete Criteria</h3>
              <ul>
                {nominationCriteria.athlete.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <Link
                href={nominationForms.athlete}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-btn dark"
              >
                Nominate an Athlete
              </Link>
            </div>
            <div className="slotab-card">
              <h3>Coach Criteria</h3>
              <ul>
                {nominationCriteria.coach.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <Link
                href={nominationForms.coach}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-btn dark"
              >
                Nominate a Coach
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Committee — hidden until the real roster lands (it was a single
          "TBD / Chair" row, which read as an unfinished page). */}
      {committee.length > 0 && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">The People Who Do the Work</span>
              <h2>Hall of Fame Committee</h2>
            </div>
            <div className="slotab-prose">
              <ul className="slotab-board">
                {committee.map((m) => (
                  <li key={m.name + m.role}>
                    <span>
                      <span className="role">{m.role}:</span> {m.name}
                    </span>
                    {m.note && (
                      <span style={{ color: "var(--slotab-muted)", fontSize: "0.9rem" }}>
                        {m.note}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Alumni Membership CTA — hidden until the tier actually exists.
          The 2026-27 sheet (/membership) has no Alumni level and the sign-up
          URL was a dead "#", so this promised a product we can't deliver.
          Set alumniMembership.joinUrl in hof.json to bring it back. */}
      {alumniMembership.joinUrl && (
        <section className="slotab-section alt">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">New for Tiger Alumni</span>
              <h2>{alumniMembership.title}</h2>
            </div>
            <div
              className="slotab-prose"
              style={{ textAlign: "center", maxWidth: 680 }}
            >
              <p>{alumniMembership.blurb}</p>
              <Link
                href={alumniMembership.joinUrl}
                className="slotab-btn"
                style={{ marginTop: "1rem" }}
              >
                Become an Alumni Member
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
