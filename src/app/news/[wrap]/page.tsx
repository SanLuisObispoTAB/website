import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import {
  SEASON_WRAPS,
  formatWrapDate,
  getWrap,
  pendingTeams,
  wrapTeamHref,
  wrapTeamPhoto,
} from "../../data/season-wraps";

// One page per season wrap-up (decision #268): /news/fall-2026, and later
// /news/winter-2027 etc. — each a new entry in season-wraps.json, no code.
export const dynamicParams = false;

export function generateStaticParams() {
  return SEASON_WRAPS.map((w) => ({ wrap: w.id }));
}

type Params = { params: Promise<{ wrap: string }> };

export async function generateMetadata({ params }: Params) {
  const w = getWrap((await params).wrap);
  if (!w) return {};
  return {
    title: `${w.title} — SLOTAB`,
    description: w.intro,
  };
}

export default async function SeasonWrapPage({ params }: Params) {
  const w = getWrap((await params).wrap);
  if (!w) notFound();

  const pending = pendingTeams(w);
  const updated = w.updated && w.updated !== w.published ? w.updated : undefined;

  return (
    <>
      <PageHeader
        kicker={`Tiger News · ${w.season} ${w.schoolYear} Season Wrap-up`}
        title={w.title}
      />
      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-wrap-intro slotab-prose">
            <p className="slotab-wrap-lede">{w.intro}</p>
            <p className="slotab-wrap-meta">
              Posted {formatWrapDate(w.published)}
              {updated && <> · Updated {formatWrapDate(updated)}</>} · Drawn
              from the school&apos;s weekly recaps on{" "}
              <Link href="/news">Tiger News</Link>
            </p>
            {pending.length > 0 && (
              <p className="slotab-wrap-pending">
                <strong>Still competing:</strong>{" "}
                {pending.map((t) => t.name).join(" and ")}{" "}
                {pending.length === 1 ? "has" : "have"} postseason results
                still to come. We&apos;ll add them here as they&apos;re
                reported.
              </p>
            )}
          </div>

          <nav className="slotab-news-weeks" aria-label="Jump to a team">
            {w.teams.map((t) => (
              <a key={t.name} href={`#${t.teams[0]}`}>
                {t.name}
              </a>
            ))}
          </nav>

          <div className="slotab-wrap-teams">
            {w.teams.map((t) => {
              const href = wrapTeamHref(t);
              const photo = wrapTeamPhoto(t);
              return (
                <article
                  key={t.name}
                  id={t.teams[0]}
                  className="slotab-wrap-team"
                >
                  {photo && (
                    <div className="slotab-wrap-team-photo">
                      <Image
                        src={photo}
                        alt={`SLO High ${t.name}`}
                        fill
                        sizes="(max-width: 720px) 100vw, 280px"
                      />
                    </div>
                  )}
                  <div className="slotab-wrap-team-body">
                    <span className="slotab-wrap-team-name">
                      {t.name}
                      {t.stillCompeting && (
                        <span className="slotab-wrap-tag">Still competing</span>
                      )}
                    </span>
                    <h2>{t.headline}</h2>
                    <ul>
                      {t.highlights.map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                    {t.stillCompeting && (
                      <p className="slotab-wrap-team-pending">
                        {t.stillCompeting}
                      </p>
                    )}
                    {href && (
                      <Link href={href} className="slotab-news-link">
                        {t.name} team page →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {w.thanks && (
            <aside className="slotab-news-notice slotab-wrap-thanks">
              <h3>{w.thanks.title}</h3>
              <p>{w.thanks.body}</p>
              <ul>
                <li>
                  <Link href="/membership" className="slotab-news-link">
                    Become a member →
                  </Link>
                </li>
                <li>
                  <Link href="/donate" className="slotab-news-link">
                    Donate to a team →
                  </Link>
                </li>
              </ul>
            </aside>
          )}
        </div>
      </section>
    </>
  );
}
