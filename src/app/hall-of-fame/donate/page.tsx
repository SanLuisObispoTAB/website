import { Suspense } from "react";
import Link from "next/link";
import hofData from "../../data/hof.json";
import HofDonateForm from "../../components/HofDonateForm";
import HofThermometer from "../../components/HofThermometer";
import TigerPageHeader from "../../components/tiger/TigerPageHeader";

// The Hall of Fame Fund's own donation page (#210).
//
// Erik, 2026-08-29: *"The HOF donation was intended to be its own campaign… it
// is a separate campaign with a separate donation page."*
//
// WHY IT LIVES UNDER /hall-of-fame RATHER THAN UNDER /donate
// The URL is the statement. `/donate/hall-of-fame` would read as a variant of
// the membership flow — one more way to do the thing that page does — which is
// precisely the framing #209 removed. `/hall-of-fame/donate` reads as what it
// is: the campaign, and its ask. It also means the fund's page and its checkout
// share a path, so a link to either is obviously part of the same thing.
//
// WHAT THIS PAGE OWES THE CAMPAIGN
// Enough of the argument to stand on its own. Somebody may arrive here from a
// text message or an alumni email without ever seeing the band on
// `/hall-of-fame`, so the lead, the 100%-no-split fact, the thermometer and the
// alumni callout are all here — not because the copy should be duplicated, but
// because a donation page that only says "how much?" converts the people who
// were already convinced and nobody else. Every string is read from
// `hof.json`, so the board edits both surfaces in one place at /admin.

export const metadata = {
  title: "Give to the Hall of Fame Fund — SLOTAB",
  description:
    "Support the SLOHS Athletics Hall of Fame — engraved awards, induction medallions, wall nameplates and the ceremony program. 100% of every gift goes to honoring inductees.",
};

type Level = { amount: number; item: string; blurb: string; featured?: boolean };
type Fund = {
  enabled: boolean;
  kicker: string;
  lead: string;
  splitNote?: string;
  levels: Level[];
  levelsNote: string;
  alumniCallout?: { title: string; body: string };
};

export default function HofDonatePage() {
  const fund = hofData.fund as Fund;
  const { ceremony } = hofData;

  return (
    <>
      <TigerPageHeader
        kicker={fund.kicker}
        title="Give to the Hall of Fame"
      />

      <section className="tiger-section">
        <div className="tiger-container slotab-donate-layout">
          <div className="slotab-donate-intro slotab-prose">
            <p className="slotab-hof-give-lead">{fund.lead}</p>

            {fund.splitNote && (
              <p className="slotab-hof-give-split">{fund.splitNote}</p>
            )}

            <HofThermometer />

            <p className="slotab-hof-give-note">{fund.levelsNote}</p>

            {fund.alumniCallout && (
              <div className="slotab-hof-give-alumni">
                <h2>{fund.alumniCallout.title}</h2>
                <p>{fund.alumniCallout.body}</p>
              </div>
            )}

            {/* The induction this pays for, named. A gift toward "awards" is
                abstract; a gift toward a night with a date and a barn is not.
                The ticket link is deliberately NOT repeated here — this page
                has one ask, and offering a $150 event ticket beside a $50 gift
                splits it. */}
            <p className="slotab-hof-give-ceremony">
              Next induction: <strong>{ceremony.title}</strong> ·{" "}
              {ceremony.dateLabel} at {ceremony.venueName}.
            </p>

            <p className="slotab-hof-give-back">
              <Link href="/hall-of-fame">
                ← Read about the Hall of Fame and see the full roll
              </Link>
            </p>
          </div>

          <div className="slotab-donate-card">
            <Suspense
              fallback={
                <div className="slotab-donate-form" aria-busy="true">
                  Loading…
                </div>
              }
            >
              <HofDonateForm />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
