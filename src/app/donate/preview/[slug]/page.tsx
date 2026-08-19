import { Suspense } from "react";
import { notFound } from "next/navigation";
import DonateForm from "../../../components/DonateForm";
import TigerPageHeader from "../../../components/tiger/TigerPageHeader";
import { squarePreviewSlug } from "../../../../lib/square";

// A staging copy of /donate that exercises the NEW Square checkout while the
// public /donate keeps using the old storefront.
//
// WHY THIS EXISTS
// Phase one is built but runs on sandbox credentials, and the guard in
// lib/square.ts (rightly) refuses to mint sandbox links on the live site — a
// real parent handed a sandbox checkout would believe they had donated while
// no money moved. That guard leaves no way to validate the new flow in
// production, which is what this page restores: reachable only with the secret
// slug, and the one request shape allowed to use sandbox on the live site.
//
// The slug lives in SQUARE_PREVIEW_SLUG, never in this repo — a slug in source
// control is not a secret. Unset, or shorter than 8 characters, and this route
// 404s, which is the right default for a page that shouldn't exist for anyone
// who wasn't handed the link.
//
// DELETE THIS ROUTE once the production token lands and /donate runs the real
// flow. It has no purpose after that, and a forgotten test checkout on a
// fundraising site is a liability.

export const metadata = {
  title: "Donate (test) — SLOTAB",
  // Belt and braces. The proxy only noindexes non-canonical hosts, and this
  // route can be reached on slotab.org itself.
  robots: { index: false, follow: false },
};

export default async function DonatePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const expected = squarePreviewSlug();
  // Plain equality is fine here: an attacker who can guess this has only won
  // the ability to create sandbox orders. The API does the careful comparison.
  if (!expected || slug !== expected) notFound();

  return (
    <>
      <TigerPageHeader kicker="Internal test page" title="Donate (test)" />

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-preview-banner" role="alert">
            <strong>This is a test page. No money moves here.</strong>
            <p>
              Checkout runs against Square&apos;s <strong>sandbox</strong>, so
              real cards are declined and nothing is charged. Use Square&apos;s
              test card <code>4111 1111 1111 1111</code>, any future expiry,
              any CVV, and postal code <code>94103</code>.
            </p>
            <p>
              The public <a href="/donate">/donate</a> page is unaffected and
              still uses the existing Square storefront. Swap the two by setting
              a production token — see decision #145.
            </p>
          </div>
        </div>
      </section>

      <section className="tiger-section">
        <div className="tiger-container slotab-donate-layout">
          <div className="slotab-donate-intro slotab-prose">
            <h2>What to check</h2>
            <ul>
              <li>
                The amount you pick here arrives on Square <em>already set</em>
                — you should never retype it.
              </li>
              <li>
                The line item names your exact designation, including
                boys/girls, e.g. <em>Volleyball (Girls) — SLOTAB donation</em>.
              </li>
              <li>Your email is prefilled on the checkout form.</li>
              <li>
                Paying returns you to a thank-you page on slotab.org rather than
                stranding you on Square.
              </li>
              <li>
                Submitting with no designation chosen is refused, and the gold
                box turns red.
              </li>
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
              <DonateForm previewToken={slug} />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
