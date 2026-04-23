import Link from "next/link";
import HudlGrid from "../components/HudlGrid";
import PageHeader from "../components/PageHeader";
import hudlData from "../data/hudl.json";

export const metadata = {
  title: "Watch — SLOTAB",
};

export default function WatchPage() {
  const { channel, currentSeason, seasons, nfhsPlaceholder } = hudlData;

  return (
    <>
      <PageHeader kicker="Live & On-Demand" title="Watch the Tigers" />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center" }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            SLOHS streams home games from Holt Field and the Big Gym through
            Hudl. Can&apos;t make it in person? Share the link with out-of-
            town family so they can cheer for the Tigers too.
          </p>
          <p>
            <Link
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-btn"
            >
              Visit the Official Hudl Fan Page
            </Link>
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">{currentSeason}</span>
            <h2>This Season&apos;s Games</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              Click any card to watch on Hudl. Games stream live during
              the broadcast and stay available on-demand afterward.
            </p>
          </div>
          <HudlGrid />
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link
              href={channel.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-btn"
            >
              View the Full Video Archive on Hudl
            </Link>
          </div>
        </div>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Past Seasons</span>
            <h2>Browse the Archive</h2>
          </div>
          <div
            className="slotab-grid"
            style={{ maxWidth: 820, margin: "0 auto" }}
          >
            {seasons.map((s) => (
              <Link
                key={s.label}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-card"
                style={{ textDecoration: "none" }}
              >
                <h3>{s.label}</h3>
                <p style={{ margin: 0, color: "var(--slotab-muted)" }}>
                  Open the {s.label} season archive on fan.hudl.com →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* NFHS placeholder — to be discussed at the next board meeting */}
      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">For Board Discussion</span>
            <h2>NFHS Network — include or not?</h2>
          </div>
          <div
            className="slotab-prose"
            style={{ textAlign: "center", maxWidth: 680 }}
          >
            <div
              style={{
                background: "#fffbe5",
                border: "2px dashed var(--slotab-gold)",
                padding: "1.25rem 1.5rem",
                textAlign: "left",
              }}
            >
              <p style={{ margin: 0, fontWeight: 600 }}>
                {nfhsPlaceholder.question}
              </p>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.95rem",
                  color: "var(--slotab-ink)",
                }}
              >
                {nfhsPlaceholder.context}
              </p>
              <p
                style={{
                  margin: "0.75rem 0 0",
                  fontSize: "0.85rem",
                  color: "var(--slotab-muted)",
                }}
              >
                Reference:{" "}
                <Link
                  href={nfhsPlaceholder.nfhsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  SLOHS on NFHS Network
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
