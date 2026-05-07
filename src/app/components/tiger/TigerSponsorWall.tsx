import Image from "next/image";
import { SPONSOR_TIERS, type Sponsor } from "../../data/sponsors";

type Props = {
  /** "compact" hides Bronze tier on the homepage. "full" shows everything. */
  mode?: "compact" | "full";
};

// Map original logo path to its alpha-channel PNG counterpart in
// public/sponsors/alpha/<tier>/<name>.png. Generated via ImageMagick
// `-fuzz 18% -transparent white -trim`.
function alphaPath(originalLogo: string): string {
  return originalLogo
    .replace(/^\/sponsors\//, "/sponsors/alpha/")
    .replace(/\.(jpe?g|png|webp)$/i, ".png");
}

function Tile({ s }: { s: Sponsor }) {
  const src = alphaPath(s.logo);
  // max-height is controlled by tier-specific CSS (.platinum-tier
  // .tiger-sponsor-tile img, etc.) so each tier scales independently.
  const inner = (
    <Image
      src={src}
      alt={s.name}
      width={300}
      height={144}
      style={{
        maxWidth: "100%",
        objectFit: "contain",
      }}
    />
  );
  if (s.website) {
    return (
      <a
        href={s.website}
        target="_blank"
        rel="noopener noreferrer"
        className="tiger-sponsor-tile"
        aria-label={`${s.name} (opens in a new tab)`}
      >
        {inner}
      </a>
    );
  }
  return (
    <div className="tiger-sponsor-tile" aria-label={s.name}>
      {inner}
    </div>
  );
}

export default function TigerSponsorWall({ mode = "full" }: Props) {
  const tiers = SPONSOR_TIERS.filter(
    (t) => mode !== "compact" || t.tier !== "Bronze",
  );

  return (
    <div>
      {tiers.map(({ tier, sponsors }) => {
        const cls = tier.toLowerCase();
        return (
          <div key={tier} className={`tiger-sponsors-tier ${cls}-tier`}>
            <div className="tiger-sponsors-tier-label">{tier}</div>
            <div className={`tiger-sponsors-grid ${cls}`}>
              {sponsors.map((s) => (
                <Tile key={`${tier}-${s.name}-${s.logo}`} s={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
