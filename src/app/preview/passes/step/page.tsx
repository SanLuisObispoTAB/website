import Link from "next/link";
import PassFlowPrototype from "../../../components/PassFlowPrototype";
import TigerPageHeader from "../../../components/tiger/TigerPageHeader";

// OPTION B — passes on a screen of their own, after the level is chosen.
// See ../page.tsx for why these preview routes exist and when to delete them.

export const metadata = {
  title: "Passes: option B (prototype) — SLOTAB",
  robots: { index: false, follow: false },
};

export default function PassStepPreviewPage() {
  return (
    <>
      <section className="slotab-draft-banner">
        <div className="slotab-container">
          <span className="slotab-draft-flag">Option B · prototype</span>
          <p>
            <strong>Nothing is charged here.</strong> The form works all the way
            to checkout and then stops, showing what Square would have been
            sent. Compare with{" "}
            <Link href="/preview/passes/add-on">option A</Link>, or go back to{" "}
            <Link href="/preview/passes">the overview</Link>.
          </p>
        </div>
      </section>

      <TigerPageHeader
        kicker="Prototype · not live"
        title="Donate to the Tigers"
      />

      <section className="tiger-section">
        <div className="tiger-container slotab-donate-layout">
          <div className="slotab-donate-intro slotab-prose">
            <h2>Passes get asked about.</h2>
            <p>
              Three steps instead of one page. You choose your gift, then a
              screen asks whether you want passes — knowing the level you just
              reached — and then you give your details.
            </p>
            <ul className="slotab-donate-bullets">
              <li>Every giver sees the offer and answers it</li>
              <li>The question can name the level: &ldquo;you receive 8&rdquo;</li>
              <li>One more click for everyone who doesn&apos;t want a pass</li>
            </ul>
            <p>
              <strong>Try $5,000</strong> — the pass screen should open with
              what Gold already includes rather than a price list.
            </p>
          </div>

          <div className="slotab-donate-card">
            <PassFlowPrototype variant="step" />
          </div>
        </div>
      </section>
    </>
  );
}
