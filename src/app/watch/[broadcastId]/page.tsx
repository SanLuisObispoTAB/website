import Link from "next/link";
import { notFound } from "next/navigation";
import BroadcastEmbed from "../../components/BroadcastEmbed";
import BroadcastGrid from "../../components/BroadcastGrid";
import PageHeader from "../../components/PageHeader";
import {
  CHANNEL,
  allBroadcasts,
  broadcastsForSport,
  getBroadcast,
  sportLabel,
  statusOf,
} from "../../data/broadcasts";

type Params = { broadcastId: string };

export function generateStaticParams(): Params[] {
  return allBroadcasts().map((b) => ({ broadcastId: b.broadcastId }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
) {
  const { broadcastId } = await params;
  const b = getBroadcast(broadcastId);
  if (!b) return { title: "Broadcast not found — SLOTAB" };
  return {
    title: `${b.title} — Watch on SLOTAB`,
    description:
      b.description ??
      `SLOHS ${sportLabel(b.sport)} — live and on-demand on slotab.org. Hudl streaming sponsored by SLOTAB.`,
  };
}

export default async function BroadcastPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { broadcastId } = await params;
  const broadcast = getBroadcast(broadcastId);
  if (!broadcast) notFound();

  const status = statusOf(broadcast);
  const versus = broadcast.opponent
    ? broadcast.isHome === false
      ? `@ ${broadcast.opponent}`
      : `vs ${broadcast.opponent}`
    : null;

  const related = broadcastsForSport(broadcast.sport)
    .filter((b) => b.broadcastId !== broadcast.broadcastId)
    .slice(0, 3);

  return (
    <>
      <PageHeader
        kicker={
          status === "live"
            ? "LIVE NOW"
            : status === "upcoming"
              ? "Upcoming"
              : "Archive"
        }
        title={broadcast.title}
      />

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-broadcast-detail-grid">
            <div>
              <BroadcastEmbed
                broadcastId={broadcast.broadcastId}
                title={broadcast.title}
                autoplay={status === "live"}
              />
            </div>
            <aside className="slotab-broadcast-detail-meta">
              <div className="slotab-broadcast-detail-row">
                <div className="slotab-broadcast-detail-label">Sport</div>
                <div className="slotab-broadcast-detail-value">
                  {sportLabel(broadcast.sport)}
                </div>
              </div>
              <div className="slotab-broadcast-detail-row">
                <div className="slotab-broadcast-detail-label">
                  {status === "upcoming" ? "Game time" : "Date"}
                </div>
                <div className="slotab-broadcast-detail-value">
                  {new Date(broadcast.date).toLocaleString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
              {versus && (
                <div className="slotab-broadcast-detail-row">
                  <div className="slotab-broadcast-detail-label">Opponent</div>
                  <div className="slotab-broadcast-detail-value">{versus}</div>
                </div>
              )}
              {broadcast.description && (
                <div className="slotab-broadcast-detail-row">
                  <div className="slotab-broadcast-detail-label">About</div>
                  <div className="slotab-broadcast-detail-value">
                    {broadcast.description}
                  </div>
                </div>
              )}
              <div className="slotab-broadcast-detail-row">
                <div className="slotab-broadcast-detail-label">Source</div>
                <div className="slotab-broadcast-detail-value">
                  <Link
                    href={CHANNEL.fanPortalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="slotab-ulink"
                  >
                    {CHANNEL.name} ↗
                  </Link>
                </div>
              </div>
              <p className="slotab-broadcast-detail-sponsor">
                Streaming brought to you by SLOTAB members and sponsors.
                <Link href="/donate"> Donate →</Link>
              </p>
            </aside>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="slotab-section alt">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">More {sportLabel(broadcast.sport)}</span>
              <h2>Other recent broadcasts</h2>
            </div>
            <BroadcastGrid broadcasts={related} />
          </div>
        </section>
      )}
    </>
  );
}
