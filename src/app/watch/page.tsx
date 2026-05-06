import Link from "next/link";
import HudlGrid from "../components/HudlGrid";
import PageHeader from "../components/PageHeader";
import hudlData from "../data/hudl.json";

export const metadata = {
  title: "Watch — SLOTAB",
};

export default function WatchPage() {
  const { channel, currentSeason, seasons } = hudlData;

  return (
    <>
      <PageHeader kicker="Live & On-Demand" title="Watch the Tigers" />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center" }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            <strong>SLOTAB pays for Hudl streaming</strong> so every Tigers
            home game from Holt Field and the Big Gym is accessible to alumni,
            grandparents, and out-of-town family. Your donations make this
            possible.
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

    </>
  );
}
