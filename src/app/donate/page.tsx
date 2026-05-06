import { Suspense } from "react";
import DonateForm from "../components/DonateForm";
import PageHeader from "../components/PageHeader";

export const metadata = {
  title: "Donate — SLOTAB",
};

export default function DonatePage() {
  return (
    <>
      <PageHeader
        kicker="Support SLOHS Athletics"
        title="Donate to the Tigers"
      />

      <section className="slotab-section">
        <div className="slotab-container slotab-donate-layout">
          <div className="slotab-donate-intro slotab-prose">
            <h2>Every gift fuels a real Tiger.</h2>
            <p>
              <strong>75%</strong> of every designated gift goes directly
              to the team you choose. <strong>25%</strong> goes to the
              SLOTAB General Fund &mdash; not overhead, but the shared
              programs that benefit every Tigers team: Hudl streaming,
              senior banners, T-shirts, sectional fees, and support for
              programs that fundraise less successfully on their own.
            </p>
            <p>
              Any donation makes you a SLOTAB member. Pick a tier on the
              right, or enter your own amount &mdash; recurring monthly
              gifts start at $10/mo and unlock the same tiers as a one-
              time annual gift.
            </p>
            <ul className="slotab-donate-bullets">
              <li>One-time minimum: $25</li>
              <li>Monthly recurring minimum: $10</li>
              <li>Tax-deductible 501(c)(3)</li>
              <li>Cancel recurring any time</li>
            </ul>
          </div>

          <div className="slotab-donate-card">
            <Suspense
              fallback={
                <div className="slotab-donate-form" aria-busy="true">
                  Loading donation form…
                </div>
              }
            >
              <DonateForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
