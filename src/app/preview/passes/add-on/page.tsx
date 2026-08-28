import Link from "next/link";
import PassFlowPrototype from "../../../components/PassFlowPrototype";
import TigerPageHeader from "../../../components/tiger/TigerPageHeader";

// OPTION A — passes as an add-on block inside the one-page giving form.
// See ../page.tsx for why these preview routes exist and when to delete them.

export const metadata = {
  title: "Passes: option A (prototype) — SLOTAB",
  robots: { index: false, follow: false },
};

export default function PassAddOnPreviewPage() {
  return (
    <>
      <section className="slotab-draft-banner">
        <div className="slotab-container">
          <span className="slotab-draft-flag">Option A · prototype</span>
          <p>
            <strong>Nothing is charged here.</strong> The form works all the way
            to checkout and then stops, showing what Square would have been
            sent. Compare with{" "}
            <Link href="/preview/passes/step">option B</Link>, or go back to{" "}
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
            <h2>Passes live inside the form.</h2>
            <p>
              This is today&apos;s donate page with one block added: once an
              amount and a sport are chosen, an <em>Add game passes</em> section
              appears above your details. Everything else is unchanged.
            </p>
            <ul className="slotab-donate-bullets">
              <li>No extra screen — nobody is stopped on the way to paying</li>
              <li>The pass block knows what your level already includes</li>
              <li>
                A skimmer heading for the donate button may never read it
              </li>
            </ul>
            <p>
              <strong>Try $5,000</strong> — it reaches the Gold level, which
              includes eight passes, and the block should say so before offering
              a ninth.
            </p>
          </div>

          <div className="slotab-donate-card">
            <PassFlowPrototype variant="inline" />
          </div>
        </div>
      </section>
    </>
  );
}
