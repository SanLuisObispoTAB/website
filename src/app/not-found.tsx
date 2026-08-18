import Link from "next/link";
import PageHeader from "./components/PageHeader";

export const metadata = {
  title: "Page Not Found — SLOTAB",
};

// Replaces the stock Next.js 404, which was a bare "This page could not be
// found" on a white page with no masthead, no nav and no way onward — a dead
// end for anyone arriving on a pre-cutover link.
//
// `next.config.ts` redirects every old URL we can prove existed. This page is
// for the ones we can't: a mistyped address, a link off a printed flyer, a
// deep WordPress URL the Internet Archive never captured. It says plainly
// that the site moved (so the visitor knows it's not their mistake) and puts
// the six things people actually come here for one click away.
export default function NotFound() {
  return (
    <>
      <PageHeader kicker="404" title="That page has moved" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose slotab-notfound">
          <p style={{ fontSize: "1.15rem" }}>
            SLOTAB launched a new website in August 2026, and a few old links
            didn&apos;t survive the move. If you followed a bookmark, a search
            result, or a link in an older email, that&apos;s almost certainly
            what happened here.
          </p>
          <p>Everything is still on the site — try one of these:</p>
          <div className="slotab-btn-row">
            <Link href="/" className="slotab-btn">
              Home
            </Link>
            <Link href="/teams" className="slotab-btn outline">
              Teams
            </Link>
            <Link href="/membership" className="slotab-btn outline">
              Join
            </Link>
            <Link href="/donate" className="slotab-btn outline">
              Donate
            </Link>
            <Link href="/upcoming" className="slotab-btn outline">
              Events
            </Link>
            <Link href="/contact" className="slotab-btn outline">
              Contact
            </Link>
          </div>
          <p className="slotab-notfound-note">
            Seeing an older version of the site somewhere? Your browser saved
            a copy before the switch. Reload the page once and it will pick up
            the new one.
          </p>
        </div>
      </section>
    </>
  );
}
