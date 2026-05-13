import Link from "next/link";
import BroadcastEmbed from "../components/BroadcastEmbed";
import BroadcastGrid from "../components/BroadcastGrid";
import PageHeader from "../components/PageHeader";
import {
  CHANNEL,
  allBroadcasts,
  featuredBroadcast,
  sportLabel,
  statusOf,
} from "../data/broadcasts";

export const metadata = {
  title: "Watch — SLOTAB",
};

export default function WatchPage() {
  const broadcasts = allBroadcasts();
  const featured = featuredBroadcast();
  const featuredStatus = featured ? statusOf(featured) : null;
  const others = featured
    ? broadcasts.filter((b) => b.broadcastId !== featured.broadcastId)
    : broadcasts;

  return (
    <>
      <PageHeader kicker="Live & On-Demand" title="Watch the Tigers" />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center", maxWidth: 720 }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            <strong>SLOTAB pays for Hudl streaming</strong> so every Tigers
            home game from Holt Field and the Big Gym is accessible to alumni,
            grandparents, and out-of-town family. Your donations make this
            possible.
          </p>
        </div>
      </section>

      {featured && (
        <section className="slotab-section alt">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">
                {featuredStatus === "live"
                  ? "Live Now"
                  : featuredStatus === "upcoming"
                    ? "Up Next"
                    : "Latest Game"}
              </span>
              <h2>{featured.title}</h2>
              <p>{sportLabel(featured.sport)}</p>
            </div>
            <div className="slotab-broadcast-featured">
              <BroadcastEmbed
                broadcastId={featured.broadcastId}
                title={featured.title}
                autoplay={featuredStatus === "live"}
              />
              <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
                <Link
                  href={`/watch/${featured.broadcastId}`}
                  className="slotab-btn"
                >
                  Game details &amp; share link →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Catalog</span>
            <h2>This Season&apos;s Games</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              Tap any card to open the game page with the full embedded
              player. Live games stream during the broadcast and stay
              available on-demand afterward.
            </p>
          </div>
          <BroadcastGrid broadcasts={others} showFilters />
          <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
            <Link
              href={CHANNEL.archiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="slotab-btn"
            >
              Full Archive on Hudl Fan Portal →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
