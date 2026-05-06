import Image from "next/image";
import { SPONSOR_TIERS, type Sponsor } from "../data/sponsors";

const TIER_SIZES = {
  Platinum: { w: 360, h: 200, className: "platinum" },
  Gold: { w: 260, h: 150, className: "gold" },
  Silver: { w: 200, h: 120, className: "silver" },
  Bronze: { w: 160, h: 90, className: "bronze" },
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
  const inner = (
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
      {SPONSOR_TIERS.map(({ tier, sponsors }) => {
        const size = TIER_SIZES[tier];
        return (
          <div key={tier} className={`slotab-sponsor-tier ${size.className}`}>
            <h3>{tier} Sponsors</h3>
            <div className="slotab-sponsor-grid">
              {sponsors.map((s) => (
                <LogoTile
                  key={s.logo}
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
