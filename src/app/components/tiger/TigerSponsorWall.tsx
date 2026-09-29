import Image from "next/image";
import { SPONSOR_TIERS, tierSlug, type Sponsor } from "../../data/sponsors";

type Props = {
  /** "compact" hides the lowest (Varsity) tier on the homepage.
   * "full" shows everything. */
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
  // Tile and logo sizing is shared with the /membership wall — see
  // SPONSOR WALL SIZING in slotab.css.
  //
  // A sponsor with no artwork yet gets their name set as a wordmark. They
  // have paid; being absent from the wall is the one outcome that is
  // actually wrong. This is also why alphaPath() is only called inside the
  // branch — it would happily build "/sponsors/alpha/undefined" otherwise.
  const inner = s.logo ? (
    <Image
      src={alphaPath(s.logo)}
      alt={s.name}
      width={300}
      height={144}
      // Same sizing as SponsorWall's tiles, so a logo renders at the same
      // size on both walls; the per-tier cap is --sp-logo-max-h (slotab.css).
      style={{
        objectFit: "contain",
        width: "100%",
        height: "100%",
      }}
    />
  ) : (
    <span className="tiger-sponsor-wordmark">{s.name}</span>
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
  // Drop empty tiers as well as the compact-mode Varsity cut. Early in a
  // season the wall is sparse — the 2026-27 rebuild opened with no Champion
  // sponsor at all — and an empty tier would render a heading over nothing.
  const tiers = SPONSOR_TIERS.filter(
    (t) =>
      t.sponsors.length > 0 && (mode !== "compact" || t.tier !== "Varsity"),
  );

  return (
    <div className="tiger-sponsor-wall">
      {tiers.map(({ tier, sponsors }) => {
        const cls = tierSlug(tier);
        return (
          <div key={tier} className={`tiger-sponsors-tier ${cls}-tier`}>
            <div className="tiger-sponsors-tier-label">{tier} Sponsors</div>
            <div className={`tiger-sponsors-grid ${cls}`}>
              {sponsors.map((s) => (
                <Tile key={`${tier}-${s.name}`} s={s} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
