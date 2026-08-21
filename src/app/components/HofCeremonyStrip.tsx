import Link from "next/link";
import hofData from "../data/hof.json";

// The gold "Save the Date" strip on /hall-of-fame.
//
// Extracted from the page when the unlisted review page at /preview/hof-fund
// was built (#185): that page has to show the AD the *proposed* page, and a
// second hand-copied strip would drift from the real one the first time the
// venue or the date changed — which has already happened once (Oct 3 / Holland
// Ranch → Oct 10 / Octagon Barn, #106). One component, two callers, one date.
//
// The markup is unchanged from the inline version it replaces.

export default function HofCeremonyStrip() {
  const { ceremony } = hofData;

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
              href="/donate?tab=general&team=hall-of-fame"
              className="slotab-btn dark"
            >
              Fund the HOF Class of 2026
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
