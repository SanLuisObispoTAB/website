import Link from "next/link";
import PageHeader from "../../components/PageHeader";
import { PASS_TYPES } from "../../data/passes";
import { SPONSOR_TIERS } from "../../data/sponsor-tiers";

// The board's way in to the two pass-flow prototypes.
//
// WHY AN UNLISTED PAGE ON PRODUCTION AND NOT A VERCEL PREVIEW LINK
// Same reason /preview/hof-fund was one (#185): board members read this on
// phones and on the SLOHS district network, and that network blocks the
// vercel.app address — which is why the slotab.ravens-peak-consulting.com CNAME
// alias exists at all. A Vercel preview deployment is doubly unusable there:
// blocked by the firewall, and behind Vercel SSO that no board member has an
// account for. Send the alias URL:
//
//     https://slotab.ravens-peak-consulting.com/preview/passes
//
// It is deliberately NOT behind the /board password either. The point is that a
// board member can open it from a text message during a meeting; a login screen
// between them and a five-minute click-through is how the feedback doesn't
// happen. Nothing here is confidential — the prices are on /season-passes and
// the tiers are on /membership.
//
// HOW IT IS HIDDEN
// Nothing links here — not the nav, not the footer, not /donate — and it is
// absent from `sitemap.ts`. `robots: index:false` is the other half: the proxy
// only marks NON-canonical hosts noindex, and this route is reachable on
// slotab.org itself, so the page says so for itself.
//
// DELETE THIS WHOLE FOLDER once the board picks a layout and it lands in
// `DonateForm`. Two half-live copies of a payment flow are exactly the kind of
// thing that gets found and used a year later.

export const metadata = {
  title: "Game passes in the giving flow (prototype) — SLOTAB",
  robots: { index: false, follow: false },
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PassPreviewIndex() {
  return (
    <>
      <section className="slotab-draft-banner">
        <div className="slotab-container">
          <span className="slotab-draft-flag">Prototype for board review</span>
          <p>
            This is a <strong>proposal</strong>, not a live page. Both versions
            below run the real form logic and{" "}
            <strong>stop before Square</strong> — you can click all the way
            through and nothing is charged, because no payment link is ever
            created.
          </p>
          <p className="slotab-draft-asks">
            <strong>Trina&apos;s ask, 28 August:</strong> let people buy game
            passes as part of joining. Two shapes for it are built here — an{" "}
            <strong>add-on inside the form</strong> and a{" "}
            <strong>screen of its own after the level is chosen</strong>. Try
            both and tell us which one you want; the answer is a small change
            either way.
          </p>
        </div>
      </section>

      <PageHeader
        kicker="Prototype · not live"
        title="Game passes in the giving flow"
      />

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-proto-choices">
            <div className="slotab-proto-choice">
              <span className="slotab-proto-choice-tag">Option A</span>
              <h2>Add-on inside the form</h2>
              <p>
                One page, as today, with an <em>Add game passes</em> block
                between the gift and your details. The pass options appear as
                soon as an amount and a sport are chosen.
              </p>
              <p className="slotab-proto-choice-note">
                <strong>Fewer clicks</strong> — nobody is stopped on the way to
                paying. <strong>Easier to miss</strong> — a parent skimming
                toward the donate button may never read it.
              </p>
              <Link href="/preview/passes/add-on" className="slotab-btn">
                Try option A →
              </Link>
            </div>

            <div className="slotab-proto-choice">
              <span className="slotab-proto-choice-tag">Option B</span>
              <h2>A follow-on screen</h2>
              <p>
                Three steps: your gift, then a screen that asks about passes,
                then your details. The pass question is unmissable and knows the
                level you just chose.
              </p>
              <p className="slotab-proto-choice-note">
                <strong>Harder to miss</strong> — every giver sees the offer and
                answers it. <strong>One more click</strong> for everyone who
                doesn&apos;t want a pass, on a form parents already abandon.
              </p>
              <Link href="/preview/passes/step" className="slotab-btn">
                Try option B →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container slotab-prose" style={{ maxWidth: 760 }}>
          <h2>What to try</h2>
          <ul>
            <li>
              <strong>Give $50, then add a pass.</strong> The running total and
              the review screen should both show the gift and the pass kept
              apart — they are not the same kind of money.
            </li>
            <li>
              <strong>Give $5,000.</strong> That lands at{" "}
              <em>Gold Sponsor</em>, which includes eight passes, so the panel
              should lead with &ldquo;you already receive 8&rdquo; before
              offering a ninth. This is the case Trina asked for by name.
            </li>
            <li>
              <strong>Buy a Single Season Pass.</strong> It asks which season —
              a pass with no season named is one the club cannot print.
            </li>
            <li>
              <strong>Press the last button.</strong> It does not pay. It shows
              exactly what Square would be sent, and what is still to build.
            </li>
          </ul>

          <h2>What we need decided</h2>
          <ol>
            <li>
              <strong>Which layout</strong> — A or B.
            </li>
            <li>
              <strong>Do donations carry the tier&apos;s passes?</strong> A{" "}
              {MONEY.format(SPONSOR_TIERS[1].annual)} gift from a parent reaches
              the <em>{SPONSOR_TIERS[1].name}</em> level by amount alone,
              without anyone buying a sponsorship. The prototype currently says{" "}
              <strong>yes, it includes the {SPONSOR_TIERS[1].passesIncluded}{" "}
              passes</strong>, because that is what the tier cards on{" "}
              <Link href="/membership">/membership</Link> promise with no
              qualifier — but nobody has actually ruled on it, and it is the
              same question already open from the sport-designation review. At{" "}
              {MONEY.format(SPONSOR_TIERS[0].annual)} it is{" "}
              {SPONSOR_TIERS[0].passesIncluded} passes, or{" "}
              {MONEY.format(PASS_TYPES[0].price * SPONSOR_TIERS[0].passesIncluded)}{" "}
              of gate value, so it is worth an explicit answer rather than a
              default.
            </li>
            <li>
              <strong>Who issues a purchased pass, and how?</strong> Included
              sponsorship passes go out via GoFan today. A pass bought on the
              website has no such step yet — somebody has to be told to send it.
            </li>
            <li>
              <strong>Are these the right two products?</strong>{" "}
              {PASS_TYPES.map((p) => `${p.name} ${MONEY.format(p.price)}`).join(
                " and ",
              )}
              , straight off{" "}
              <Link href="/season-passes">the season passes page</Link>. Family
              or student pricing would be a third.
            </li>
          </ol>

          <h2>What this does not do</h2>
          <p>
            It takes no money and creates nothing in Square. The public{" "}
            <Link href="/donate">/donate</Link> page is untouched and still
            works exactly as it did — this prototype is a separate copy, so
            nothing here can affect a real donation while the board is deciding.
          </p>
        </div>
      </section>
    </>
  );
}
