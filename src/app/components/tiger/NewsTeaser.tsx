import Link from "next/link";
import {
  LATEST_ISSUE,
  formatIssueDateShort,
  isRecentIssue,
  issueAnchor,
  teaserText,
} from "../../data/athletics-news";

/** The newest Tiger News week, where a visitor sees it on arrival (#266).
 *  `card`: inside the hero, top-right over the photo (desktop).
 *  `bar`: a slim link above the hero (phones and small tablets).
 *  CSS shows exactly one of the two at any width. */
export default function NewsTeaser({ variant }: { variant: "card" | "bar" }) {
  const issue = LATEST_ISSUE;
  if (!issue || issue.items.length === 0) return null;

  const href = `/news#${issueAnchor(issue.date)}`;
  const fresh = isRecentIssue(issue);
  const count = issue.items.length;
  const recaps = `${count} team recap${count === 1 ? "" : "s"}`;

  if (variant === "bar") {
    return (
      <Link href={href} className="tiger-news-bar">
        <span className="tiger-news-bar-tag">
          {fresh ? "New · Tiger News" : "Tiger News"}
        </span>
        <span className="tiger-news-bar-text">
          {recaps} from the week of {formatIssueDateShort(issue.date)}
        </span>
        <span className="tiger-news-bar-go" aria-hidden="true">
          →
        </span>
      </Link>
    );
  }

  const [first, ...rest] = issue.items;
  const others = rest.map((i) => i.heading);
  const shownOthers = others.slice(0, 3);
  const more = others.length - shownOthers.length;

  return (
    <Link href={href} className="tiger-news-card">
      <span className="tiger-news-card-eyebrow">
        {fresh && <span className="tiger-news-card-new">New</span>}
        Tiger News · Week of {formatIssueDateShort(issue.date)}
      </span>
      <span className="tiger-news-card-title">{first.heading}</span>
      <span className="tiger-news-card-body">{teaserText(first)}</span>
      {shownOthers.length > 0 && (
        <span className="tiger-news-card-more">
          Also: {shownOthers.join(" · ")}
          {more > 0 ? ` · +${more} more` : ""}
        </span>
      )}
      <span className="tiger-news-card-go">Read all {recaps} →</span>
    </Link>
  );
}
