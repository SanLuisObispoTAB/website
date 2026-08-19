import { Suspense } from "react";
import { notFound } from "next/navigation";
import DonateForm from "../../../components/DonateForm";
import TigerPageHeader from "../../../components/tiger/TigerPageHeader";
import {
  squarePreviewSlug,
  isSquareConfigured,
  verifySquareCredentials,
} from "../../../../lib/square";

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

// Re-checks the credentials on every load rather than baking a stale verdict
// into a build — the whole point is to reflect what Vercel holds right now.
export const dynamic = "force-dynamic";

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

  // Which warning to show. `isSquareConfigured()` with no preview unlock is
  // true only when the credentials are production-grade, so this doubles as
  // "are we pointed at real money?".
  const sandbox = !isSquareConfigured();
  const creds = await verifySquareCredentials();

  return (
    <>
      <TigerPageHeader kicker="Internal test page" title="Donate (test)" />

      <section className="slotab-section">
        <div className="slotab-container">
          {sandbox ? (
            <div className="slotab-preview-banner" role="alert">
              <strong>Test page — no money moves here.</strong>
              <p>
                Checkout runs against Square&apos;s <strong>sandbox</strong>, so
                nothing is charged and no card is accepted.
              </p>
              <p className="slotab-preview-heads-up">
                <strong>Expect one extra screen that donors will never see.</strong>{" "}
                In test mode Square shows a grey{" "}
                <em>&ldquo;Checkout API Sandbox Testing Panel&rdquo;</em> first.
                Click <strong>Preview Link</strong> on it to see the real
                checkout page. That panel is a Square testing artefact — in
                production the Donate button goes straight to checkout.
              </p>
              <p>
                Square won&apos;t let you finish a payment in test mode
                (&ldquo;this preview cannot be used to complete a payment&rdquo;)
                — that&apos;s their limitation, not a fault in our flow. To see
                where donors land afterwards, open the{" "}
                <a href="/thank-you?kind=donation&amp;designation=girls-volleyball">
                  thank-you page
                </a>{" "}
                directly.
              </p>
            </div>
          ) : (
            <div className="slotab-preview-banner" role="alert">
              <strong>
                Test page — but this is the REAL Square checkout.
              </strong>
              <p>
                Square is in <strong>production</strong> mode, so anything you
                pay here is a <strong>real charge on a real card</strong>. Any
                test gift must be refunded from the Square dashboard.
              </p>
              <p>
                The public <a href="/donate">/donate</a> page is still on the
                old storefront until <code>SQUARE_LIVE_DONATE</code> is set to{" "}
                <code>true</code>, so what you see here is exactly what donors
                will get at launch — before they get it.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="slotab-section" style={{ paddingTop: 0 }}>
        <div className="slotab-container">
          <div
            className={`slotab-cred-check ${creds.ok ? "ok" : "bad"}`}
            role="status"
          >
            <h2>Square configuration</h2>
            <dl>
              <dt>Mode</dt>
              <dd>
                <strong>{creds.environment}</strong>
                {creds.environment === "production"
                  ? " — real charges"
                  : " — test only, no money moves"}
              </dd>
              <dt>Token</dt>
              <dd>
                {creds.locations.length > 0
                  ? `✅ authenticated${creds.merchantId ? ` (merchant ${creds.merchantId})` : ""}`
                  : "❌ could not authenticate"}
              </dd>
              <dt>Location</dt>
              <dd>
                {creds.locationMatches
                  ? `✅ matched — "${creds.locationName}" (${creds.locationStatus})`
                  : "❌ not found in this account"}
              </dd>
              <dt>Can take payments</dt>
              <dd>
                {creds.locationCanTakePayments
                  ? "✅ yes — ACTIVE with card processing"
                  : creds.locationStatus !== "ACTIVE"
                    ? `❌ no — location is ${creds.locationStatus}, not ACTIVE`
                    : "❌ no — card processing not enabled here"}
              </dd>
            </dl>

            {!creds.ok && creds.error && (
              <p className="slotab-cred-hint">
                <strong>{creds.error}</strong>
              </p>
            )}

            {creds.locations.length > 0 && (
              <>
                <p>Every location this token can see:</p>
                <ul>
                  {creds.locations.map((l) => (
                    <li key={l.id}>
                      <code>{l.id}</code> — {l.name} · {l.status} ·{" "}
                      {l.canTakePayments
                        ? "can take payments"
                        : l.hasCardCapability
                          ? "CANNOT — deactivated"
                          : "CANNOT — no card processing"}
                    </li>
                  ))}
                </ul>
                <p className="slotab-cred-hint">
                  A location marked <em>deactivated</em> still lists card
                  processing but Square refuses payments there — reactivate it
                  in the Square dashboard (Account &amp; Settings → Business →
                  Locations). Otherwise point <code>SQUARE_LOCATION_ID</code> at
                  an ACTIVE one and redeploy.
                </p>
              </>
            )}
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
                The checkout page carries <strong>SLOTAB&apos;s</strong> name
                and the gift&apos;s designation, not a generic storefront item.
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
