import Link from "next/link";
import HofCeremonyStrip from "../../components/HofCeremonyStrip";
import HofFund, { HofLegacyStrip } from "../../components/HofFund";
import PageHeader from "../../components/PageHeader";

// An unlisted review copy of the proposed /hall-of-fame opening, built so the
// Athletic Director can look at the Hall of Fame Fund band before it goes
// public (#185). He has since reviewed it and asked for the standing-fund
// framing this now carries (#186), so this copy is the revision, not the
// version he first saw.
//
// WHY IT IS A REAL PAGE ON PRODUCTION AND NOT A VERCEL PREVIEW LINK
// The AD reviews on the SLOHS district network, and that network **blocks the
// `vercel.app` address** — the reason the `slotab.ravens-peak-consulting.com`
// CNAME alias exists at all (see docs/editor-onboarding.md, "The editor page
// won't load at all"). A Vercel preview deployment is doubly unusable there:
// blocked by the firewall, and behind Vercel SSO, which the AD has no account
// for. So the review copy has to be served by the production deployment, which
// the alias also serves. Send the AD the alias URL:
//
//     https://slotab.ravens-peak-consulting.com/preview/hof-fund
//
// HOW IT IS HIDDEN
// Nothing links here — not the nav, not the footer, not /hall-of-fame — and it
// is deliberately absent from `sitemap.ts`. `robots: index:false` below is the
// belt-and-braces half: the proxy only marks NON-canonical hosts `noindex`, and
// this route is reachable on slotab.org itself, so the page has to say so for
// itself. Precedent and reasoning: /donate/preview/[slug] (#149).
//
// Not secret, though — an unlisted URL is not an access control, so the draft
// banner below states plainly that the figures are unconfirmed. That is what
// makes a stumbled-upon copy harmless rather than a page quoting engraver
// pricing nobody has quoted.
//
// DELETE THIS ROUTE once the band is live on /hall-of-fame. A stale second copy
// of a fundraising page is exactly the kind of thing that gets found, linked,
// and donated against a year after the class it names was inducted.

export const metadata = {
  title: "Hall of Fame Fund (draft) — SLOTAB",
  robots: { index: false, follow: false },
};

export default function HofFundPreviewPage() {
  return (
    <>
      {/* The draft notice comes first and is unmissable. A reviewer who cannot
          tell a proposal from the live site gives feedback on the wrong thing,
          and anyone else who finds the URL needs to know the numbers are not
          final before they read six of them. */}
      <section className="slotab-draft-banner">
        <div className="slotab-container">
          <span className="slotab-draft-flag">Draft for review</span>
          <p>
            This is a <strong>proposal</strong>, not a published page. It shows
            the Hall of Fame Fund block as it would open{" "}
            <Link href="/hall-of-fame">the Hall of Fame page</Link>, with the
            Booster Bash save-the-date beneath it.
          </p>
          <p className="slotab-draft-asks">
            <strong>Revised on your feedback:</strong> this is now a standing
            fund for the Hall of Fame going forward — not a Class of 2026 drive
            — and alumni are addressed directly, in the block above the buttons.
            Still needed before it goes live:{" "}
            <strong>the fundraising goal</strong> you&apos;re putting together
            (the progress bar is built and waiting, hidden until there is a real
            number), and{" "}
            <strong>confirmation of what each level actually buys</strong> — the
            six amounts below are the committee&apos;s working plan, not
            engraver pricing. Reply with corrections and they are a five-minute
            change.
          </p>
        </div>
      </section>

      <PageHeader
        kicker="Honoring Tiger Excellence"
        title="Athletics Hall of Fame"
      />

      <HofFund />
      <HofCeremonyStrip />
      <HofLegacyStrip />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center" }}
        >
          <p>
            Below this point the page continues exactly as it does today — the
            mission statement, all 46 past inductees, and the nomination
            criteria. Nothing there changes.
          </p>
          <p>
            <Link href="/hall-of-fame" className="slotab-btn outline">
              See the current live page
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
