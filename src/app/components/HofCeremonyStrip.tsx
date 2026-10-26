import Link from "next/link";
import EventPhotos, { type EventPhoto } from "./EventPhotos";
import hofData from "../data/hof.json";
import hofInductees from "../data/hof-inductees.json";
import { hasPassed } from "../data/event-dates";

// The gold "Save the Date" strip on /hall-of-fame.
//
// Extracted when the unlisted review page at /preview/hof-fund was built (that
// page is gone as of #189, but the reason it forced this extraction stands)
// (#185): that page has to show the AD the *proposed* Hall of Fame page, and a
// hand-copied strip would drift from the real one the first time the venue or
// the date changed — which has already happened once (Oct 3 / Holland Ranch →
// Oct 10 / Octagon Barn, #106). One component, two callers, one date.
//
// The markup is identical to the inline version it replaced on /hall-of-fame.

export default function HofCeremonyStrip() {
  const { ceremony } = hofData;
  if (hasPassed(ceremony.date)) return <InductedStrip />;
  // Same label as the band's own buttons — one string, so a rename can't leave
  // two buttons on one page disagreeing about what the fund is called.
  const fund = hofData.fund as { ctaLabel: string };

  return (
    <section className="slotab-feature-strip">
      <div className="slotab-container">
        <span
          className="slotab-kicker"
          style={{
            display: "block",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem",
          }}
        >
          Save the Date
        </span>
        <h2>{ceremony.title} — at the Booster Bash</h2>
        <p style={{ fontSize: "1.1rem" }}>
          <strong>{ceremony.dateLabel}</strong> · {ceremony.venueName}
        </p>
        <p style={{ maxWidth: 640, margin: "0.5rem auto 1.5rem" }}>
          {ceremony.venueDetail}
        </p>
        {/* Each CTA renders only once a real URL is set in hof.json —
            a dead "#" button on a save-the-date is worse than none. */}
        <div className="slotab-btn-row" style={{ justifyContent: "center" }}>
          {ceremony.ticketsUrl && (
            <Link href={ceremony.ticketsUrl} className="slotab-btn dark">
              Booster Bash Tickets
            </Link>
          )}
          {ceremony.donateUrl ? (
            <Link
              href={ceremony.donateUrl}
              className="slotab-btn dark"
              style={{ background: "transparent", color: "var(--slotab-black)" }}
            >
              Donate to the HOF Fund
            </Link>
          ) : (
            /* No dedicated HOF donate URL is set, but there is now a real
               Hall of Fame designation on the donate form, so this goes
               straight to it rather than to the generic donate page. It used
               to point at `#fund`; since the reorder that band is directly
               ABOVE this strip, and a button that scrolls a reader back up
               to what they just read is worse than no button. */
            <Link
              href="/hall-of-fame/donate"
              className="slotab-btn dark"
            >
              {fund.ctaLabel}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

/** The strip once the induction night is over (#260): welcomes the class by
 *  name, then the night's photos — or a placeholder until they're added in
 *  hof.json → ceremony.gallery. Names come from the same file as the
 *  inductee grid, matched on the ceremony's year, so they can't drift. */
function InductedStrip() {
  const { ceremony } = hofData;
  const fund = hofData.fund as { ctaLabel: string };
  const gallery = (ceremony as { gallery?: EventPhoto[] }).gallery;
  const year = ceremony.date.slice(0, 4);
  const names = (
    hofInductees.inductees as { name: string; yearInducted: string }[]
  )
    .filter((i) => i.yearInducted === year)
    .map((i) => i.name);

  return (
    <section className="slotab-feature-strip">
      <div className="slotab-container">
        <span
          className="slotab-kicker"
          style={{
            display: "block",
            letterSpacing: "0.2em",
            marginBottom: "0.5rem",
          }}
        >
          Inducted {ceremony.dateLabel}
        </span>
        <h2>Welcome to the Hall, Class of {year}</h2>
        {names.length > 0 && (
          <p className="slotab-hof-class-names">{names.join(" · ")}</p>
        )}
        <p style={{ maxWidth: 640, margin: "0.5rem auto 0" }}>
          Inducted at the Booster Bash at {ceremony.venueName}. Thank you to
          everyone who came out to celebrate them.
        </p>
        <EventPhotos photos={gallery} eventName="the induction" />
        <div className="slotab-btn-row" style={{ justifyContent: "center" }}>
          <Link href="#inductees" className="slotab-btn dark">
            Meet the Inductees
          </Link>
          <Link
            href="/hall-of-fame/donate"
            className="slotab-btn dark"
            style={{ background: "transparent", color: "var(--slotab-black)" }}
          >
            {fund.ctaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
