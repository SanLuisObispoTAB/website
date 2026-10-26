import Link from "next/link";
import PageHeader from "../components/PageHeader";
import { NewsRecap } from "../components/AthleticsNews";
import {
  NEWS_ISSUES,
  formatIssueDate,
  formatIssueDateShort,
  issueAnchor,
} from "../data/athletics-news";

export const metadata = {
  title: "Athletics News — SLOTAB",
  description:
    "Weekly SLO High Tiger athletics recaps from the SLOHS newsletter: results, league titles, playoff news, and standout performances.",
};

export default function NewsPage() {
  return (
    <>
      <PageHeader kicker="Tiger Athletics" title="Athletics News" />
      <section className="slotab-section">
        <div className="slotab-container">
          <div
            className="slotab-prose"
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <p style={{ margin: 0 }}>
              Each week the SLO High athletic department shares how our teams
              did in the SLOHS newsletter. We post those recaps here, in the
              department&apos;s own words. For game times and locations, see{" "}
              <Link href="/upcoming">
                Upcoming Events
              </Link>
              .
            </p>
          </div>

          {NEWS_ISSUES.length > 1 && (
            <nav className="slotab-news-weeks" aria-label="Jump to a week">
              {NEWS_ISSUES.map((issue) => (
                <a key={issue.date} href={`#${issueAnchor(issue.date)}`}>
                  {formatIssueDateShort(issue.date)}
                </a>
              ))}
            </nav>
          )}

          <div className="slotab-news-issues">
            {NEWS_ISSUES.map((issue) => (
              <article
                key={issue.date}
                id={issueAnchor(issue.date)}
                className="slotab-news-issue"
              >
                <header className="slotab-news-issue-head">
                  <span className="slotab-kicker">Week of</span>
                  <h2>{formatIssueDate(issue.date)}</h2>
                  <p className="slotab-news-source">
                    From the {issue.title}
                  </p>
                </header>

                {issue.items.length > 0 ? (
                  issue.items.map((item, i) => (
                    <NewsRecap key={`${item.heading}-${i}`} item={item} />
                  ))
                ) : (
                  <p className="slotab-news-recap slotab-news-empty">
                    No team recaps in this week&apos;s newsletter.
                  </p>
                )}

                {issue.notices?.map((n) => (
                  <aside key={n.title} className="slotab-news-notice">
                    <h3>{n.title}</h3>
                    <p>{n.body}</p>
                    {n.links && n.links.length > 0 && (
                      <ul>
                        {n.links.map((l) => (
                          <li key={l.url}>
                            <a
                              href={l.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="slotab-news-link"
                            >
                              {l.label} ↗
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </aside>
                ))}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
