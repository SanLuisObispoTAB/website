import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import { sponsorTierById } from "../data/sponsor-tiers";
import teamsData from "../data/teams.json";

export const metadata = { title: "Thank You — SLOTAB" };

type Team = { slug: string; name: string };

// Where Square returns a buyer after payment. Square appends its own
// `orderId`/`transactionId` params to whatever we set, so ours survive.
//
// Sponsors land here with real work still to do: a checkout can take $5,000 but
// it cannot collect a logo file or ask which field you want your banner on. So
// the sponsor version of this page is a handoff, not just a receipt — the same
// pattern #140 established for donation intent Square can't carry.
function ThankYouBody({
  kind,
  tierId,
  designation,
}: {
  kind?: string;
  tierId?: string;
  designation?: string;
}) {
  const tier = tierId ? sponsorTierById(tierId) : undefined;
  const team = designation
    ? (teamsData.teams as Team[]).find((t) => t.slug === designation)
    : undefined;

  if (kind === "sponsorship") {
    const subject = `Sponsorship details${tier ? ` — ${tier.name}` : ""}`;
    const body = [
      `We've just completed our ${tier?.name ?? "sponsorship"} payment. Our details:`,
      "",
      "Business name:",
      "Contact name:",
      "Phone:",
      "",
      "Preferred banner location(s):",
      tier?.id === "champion" ? "Featured game — sport of choice:" : null,
      "",
      "Our logo is attached (vector or high-resolution PNG preferred).",
    ]
      .filter((l) => l !== null)
      .join("\n");
    const mailto =
      "mailto:slotabmembership@gmail.com" +
      `?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    return (
      <>
        <p style={{ fontSize: "1.15rem" }}>
          Thank you — your{" "}
          <strong>{tier?.name ?? "sponsorship"}</strong> is confirmed, and
          Square has emailed your receipt.
        </p>
        <p>
          <strong>One thing left.</strong> We still need your logo and your
          banner preference before we can put your business in front of
          anyone — the checkout had nowhere to ask.
        </p>
        <div className="slotab-btn-row">
          <a href={mailto} className="slotab-btn">
            Send us your logo &amp; details
          </a>
          <Link href="/membership" className="slotab-btn outline">
            Back to sponsorships
          </Link>
        </div>
        <p className="slotab-thanks-note">
          Opens a pre-written email to our membership team. Attach your logo and
          we&apos;ll take it from there.
        </p>
      </>
    );
  }

  return (
    <>
      <p style={{ fontSize: "1.15rem" }}>
        Thank you — your gift{team ? <> to <strong>{team.name}</strong></> : null}{" "}
        is complete, and Square has emailed your receipt.
      </p>
      <p>
        Every donation enrols you as a SLOTAB member at the matching tier. Your
        support pays for uniforms, equipment, travel and the shared programs
        that reach every Tiger team.
      </p>
      <div className="slotab-btn-row">
        <Link href="/" className="slotab-btn">
          Back to Home
        </Link>
        <Link href="/teams" className="slotab-btn outline">
          Explore the Teams
        </Link>
      </div>
      <p className="slotab-thanks-note">
        Questions about your donation? Email{" "}
        <a href="mailto:slotabmembership@gmail.com">
          slotabmembership@gmail.com
        </a>
        .
      </p>
    </>
  );
}

export default async function ThankYouPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;

  return (
    <>
      <PageHeader kicker="Go Tigers" title="Thank you" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose slotab-thanks">
          <Suspense fallback={null}>
            <ThankYouBody
              kind={one(params.kind)}
              tierId={one(params.tier)}
              designation={one(params.designation)}
            />
          </Suspense>
        </div>
      </section>
    </>
  );
}
