import Link from "next/link";
import { type NewsItem, splitLead, teamHref } from "../data/athletics-news";

/** One recap: the team name in bold (linked to its page when the recap is
 *  about exactly one team that has a page), then the newsletter's text as
 *  written. A recap that runs to several paragraphs keeps its breaks. */
export function NewsRecap({
  item,
  showTeamLink = true,
}: {
  item: NewsItem;
  showTeamLink?: boolean;
}) {
  const { lead, rest } = splitLead(item);
  const href =
    showTeamLink && item.teams?.length === 1
      ? teamHref(item.teams[0])
      : undefined;
  const leadText = lead ?? item.heading;
  const leadNode = href ? (
    <Link href={href} className="slotab-news-lead">
      {leadText}
    </Link>
  ) : (
    <strong className="slotab-news-lead">{leadText}</strong>
  );

  const [first, ...more] = rest.split(/\n\s*\n/);

  return (
    <>
      <p className="slotab-news-recap">
        {leadNode}
        {lead ? first : <> — {first.trim()}</>}
      </p>
      {more.map((para, i) => (
        <p key={i} className="slotab-news-recap">
          {para.trim()}
        </p>
      ))}
    </>
  );
}
