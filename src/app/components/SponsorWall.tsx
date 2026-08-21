import Image from "next/image";
import { SPONSOR_TIERS, type Sponsor } from "../data/sponsors";

// Ladder order, top down: Champion $10,000 · Gold $5,000 · Silver $2,500 ·
// Tiger Pride $1,000 · Varsity $500. Sizes step down with the tier.
const TIER_SIZES = {
  Champion: { w: 360, h: 200, className: "champion" },
  Gold: { w: 260, h: 150, className: "gold" },
  Silver: { w: 200, h: 120, className: "silver" },
  // No space in the class — "Tiger Pride".toLowerCase() would split in two.
  "Tiger Pride": { w: 180, h: 105, className: "tigerpride" },
  Varsity: { w: 160, h: 90, className: "varsity" },
} as const;

function LogoTile({
  s,
  width,
  height,
}: {
  s: Sponsor;
  width: number;
  height: number;
}) {
  // No artwork yet — set the business name as a wordmark rather than drop
  // the sponsor. They have paid; being absent from the wall is the one
  // outcome that is actually wrong.
  const inner = s.logo ? (
    <Image
      src={s.logo}
      alt={s.name}
      width={width}
      height={height}
      style={{
        objectFit: "contain",
        width: "100%",
        height: "100%",
      }}
    />
  ) : (
    <span className="slotab-sponsor-wordmark">{s.name}</span>
  );
  if (s.website) {
    return (
      <a
        href={s.website}
        target="_blank"
        rel="noopener noreferrer"
        className="slotab-sponsor-logo"
        aria-label={`${s.name} (opens in a new tab)`}
      >
        {inner}
      </a>
    );
  }
  return <div className="slotab-sponsor-logo">{inner}</div>;
}

export default function SponsorWall() {
  return (
    <div className="slotab-sponsor-wall">
      {SPONSOR_TIERS.filter((t) => t.sponsors.length > 0).map(({
        tier,
        sponsors,
      }) => {
        const size = TIER_SIZES[tier];
        return (
          <div key={tier} className={`slotab-sponsor-tier ${size.className}`}>
            <h3>{tier} Sponsors</h3>
            <div className="slotab-sponsor-grid">
              {sponsors.map((s) => (
                // Keyed on name, not logo: a sponsor without artwork has no
                // logo to key on, and two of them would collide on undefined.
                <LogoTile
                  key={s.name}
                  s={s}
                  width={size.w}
                  height={size.h}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
