import Image from "next/image";
import { SPONSOR_TIERS } from "../data/sponsors";

const TIER_SIZES = {
  Platinum: { w: 360, h: 200, className: "platinum" },
  Gold: { w: 260, h: 150, className: "gold" },
  Silver: { w: 200, h: 120, className: "silver" },
  Bronze: { w: 160, h: 90, className: "bronze" },
} as const;

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
                <div key={s.logo} className="slotab-sponsor-logo">
                  <Image
                    src={s.logo}
                    alt={s.name}
                    width={size.w}
                    height={size.h}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
