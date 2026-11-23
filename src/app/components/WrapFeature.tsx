import Link from "next/link";
import { featuredWrap, pendingTeams } from "../data/season-wraps";

/** Dark link card for the current season wrap-up (#268), shown atop /news
 *  and under the home page's Tiger News strip while it is featured
 *  (season-wraps.ts `featuredWrap`). Renders nothing otherwise. */
export default function WrapFeature() {
  const w = featuredWrap();
  if (!w) return null;
  const pending = pendingTeams(w).length;
  return (
    <Link href={`/news/${w.id}`} className="slotab-wrap-feature">
      <span className="slotab-wrap-feature-kicker">
        Season wrap-up · {w.teams.length} teams
        {pending > 0 ? ` · ${pending} still competing` : ""}
      </span>
      <span className="slotab-wrap-feature-title">{w.title}</span>
      <span className="slotab-wrap-feature-go">
        Celebrate the season →
      </span>
    </Link>
  );
}
