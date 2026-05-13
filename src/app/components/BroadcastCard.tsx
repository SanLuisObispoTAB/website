import Image from "next/image";
import Link from "next/link";
import {
  type Broadcast,
  SPORT_FALLBACK_PHOTOS,
  sportLabel,
  statusOf,
} from "../data/broadcasts";

type Props = {
  broadcast: Broadcast;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function BroadcastCard({ broadcast }: Props) {
  const status = statusOf(broadcast);
  const photo =
    SPORT_FALLBACK_PHOTOS[broadcast.sport] ?? "/photos/about-hero.jpg";
  const versus = broadcast.opponent
    ? broadcast.isHome === false
      ? `@ ${broadcast.opponent}`
      : `vs ${broadcast.opponent}`
    : null;

  return (
    <Link
      href={`/watch/${broadcast.broadcastId}`}
      className="slotab-broadcast-card"
    >
      <div className="slotab-broadcast-card-thumb">
        <Image
          src={photo}
          alt={broadcast.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <div className="slotab-broadcast-card-overlay" />
        <div className="slotab-broadcast-card-play" aria-hidden>▶</div>
        {status === "live" && (
          <span className="slotab-broadcast-badge live">
            <span className="slotab-broadcast-badge-dot" /> LIVE
          </span>
        )}
        {status === "upcoming" && (
          <span className="slotab-broadcast-badge upcoming">Upcoming</span>
        )}
      </div>
      <div className="slotab-broadcast-card-body">
        <div className="slotab-broadcast-card-tag">{sportLabel(broadcast.sport)}</div>
        <div className="slotab-broadcast-card-title">{broadcast.title}</div>
        <div className="slotab-broadcast-card-meta">
          {formatDate(broadcast.date)}
          {status === "upcoming" && ` · ${formatTime(broadcast.date)}`}
          {versus && ` · ${versus}`}
        </div>
      </div>
    </Link>
  );
}
