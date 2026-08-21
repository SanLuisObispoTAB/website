import { Suspense } from "react";
import Link from "next/link";
import PageHeader from "../components/PageHeader";
import SponsorEnquiry from "../components/SponsorEnquiry";
import { sponsorTierById } from "../data/sponsor-tiers";
import teamsData from "../data/teams.json";
import { specialFund } from "../data/special-funds";
// The induction date, so a Hall of Fame donor is told when the thing they just
// paid for happens. One source with /hall-of-fame — the date has already moved
// once (Oct 3 → Oct 10) and must never disagree between two pages.
import hofData from "../data/hof.json";

const { ceremony } = hofData;

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
  const fund = designation ? specialFund(designation) : undefined;

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
          <SponsorEnquiry
            email="slotabmembership@gmail.com"
            subject={subject}
            body={body}
            buttonLabel="Send us your logo & details"
            buttonClassName="slotab-btn"
          />
          <Link href="/membership" className="slotab-btn outline">
            Back to sponsorships
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <p style={{ fontSize: "1.15rem" }}>
        Thank you — your gift
        {team ? <> to <strong>{team.name}</strong></> : null}
        {fund ? <> to <strong>{fund.label}</strong></> : null} is complete, and
        Square has emailed your receipt.
      </p>
      {/* A fund donor needs a different second paragraph: theirs bought a
          specific thing on a specific night, and saying "uniforms, equipment,
          travel" would describe a gift they didn't make. */}
      {fund ? (
        <p>
          It goes straight to honoring this year&apos;s inductees — the engraved
          award, the medallion, the nameplate on the wall in the Big Gym. Your
          gift also enrolls you as a SLOTAB member at the matching tier, and
          you&apos;re welcome at the induction on{" "}
          {ceremony.dateLabel} at {ceremony.venueName}.
        </p>
      ) : (
        <p>
          Every donation enrolls you as a SLOTAB member at the matching tier.
          Your support pays for uniforms, equipment, travel and the shared
          programs that reach every Tiger team.
        </p>
      )}
      <div className="slotab-btn-row">
        <Link href="/" className="slotab-btn">
          Back to Home
        </Link>
        {fund ? (
          <Link href="/hall-of-fame" className="slotab-btn outline">
            See the Hall of Fame
          </Link>
        ) : (
          <Link href="/teams" className="slotab-btn outline">
            Explore the Teams
          </Link>
        )}
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
