import Link from "next/link";

export default function SiteBanner() {
  return (
    <div className="tiger-banner">
      <Link href="/" className="tiger-banner-link" aria-label="SLOTAB home">
        <span className="tiger-banner-wordmark">
          <span className="tiger-banner-text slo">SLO</span>
          <span className="tiger-banner-divider" aria-hidden="true" />
          <span className="tiger-banner-text tab">TAB</span>
        </span>
        <span className="tiger-banner-tagline">
          <span>San Luis Obispo</span>
          <span className="tiger-banner-dot" aria-hidden="true" />
          <span>Tiger Athletic Boosters</span>
        </span>
      </Link>
    </div>
  );
}
