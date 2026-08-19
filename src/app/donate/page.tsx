import { Suspense } from "react";
import DonateForm from "../components/DonateForm";
import TigerPageHeader from "../components/tiger/TigerPageHeader";

export const metadata = {
  title: "Donate — SLOTAB",
};

export default function DonatePage() {
  return (
    <>
      <TigerPageHeader
        kicker="Support SLOHS Athletics"
        title="Donate to the Tigers"
      />

      <section className="tiger-section">
        <div className="tiger-container slotab-donate-layout">
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
              right, or enter your own amount &mdash; every gift is
              tax-deductible and goes straight to the sport you choose.
            </p>
            <ul className="slotab-donate-bullets">
              <li>Minimum gift: $25</li>
              <li>Tax-deductible 501(c)(3)</li>
              <li>75% to your sport, 25% to shared programs</li>
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
