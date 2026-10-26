import Image from "next/image";
import Link from "next/link";
import PageHeader from "./PageHeader";
import EventPhotos, { type EventPhoto } from "./EventPhotos";
import featuredEvents from "../data/featured-events.json";
import { hasPassed } from "../data/event-dates";

export type FeaturedEvent = {
  slug: string;
  kicker: string;
  title: string;
  dateLabel?: string;
  timeLabel?: string;
  /** ISO date — kept in sync with slotab-events.json, which drives the calendar. */
  date?: string;
  venueName?: string;
  venueDetail?: string;
  /** Flyer or hero image. Empty until the real artwork arrives; the frame is
   *  skipped entirely rather than rendering a broken image. */
  photo?: string;
  photoAlt?: string;
  /** Intrinsic dimensions of `photo`. Default assumes a portrait flyer; a
   *  landscape photo gets a wider frame so it isn't squeezed into 600px. */
  photoWidth?: number;
  photoHeight?: number;
  /** Lead copy, rendered directly under the artwork and *above* the
   *  date/venue card — for a welcome or announcement that should be the
   *  first thing read. `body` still renders below the card as usual. The
   *  first line is set larger, so put the headline sentence there. */
  intro?: string[];
  body?: string[];
  /** Event-specific contact address. Falls back to a link to /contact. */
  contactEmail?: string;
  ctaLabel?: string;
  /** Empty means the CTA is not rendered — never ship a button that goes
   *  nowhere (same rule as the Hall of Fame ticket links). */
  ctaUrl?: string;
  /** Scannable tag pointing at the same place as ctaUrl. Useful for someone
   *  reading on a laptop who wants tickets on their phone, and for anyone
   *  screenshotting the page to share. Only rendered alongside a live CTA. */
  qrImage?: string;
  qrCaption?: string;
  links?: { label: string; url: string }[];

  // ---- After the event (#260) ------------------------------------------
  // Once `date` has passed, the page becomes a record of the night: the
  // ticket button, QR code, lead copy, body and links above are all hidden
  // (they're written in the future tense), and these show instead.

  /** Small text above the title once the event is over. */
  pastKicker?: string;
  /** A few paragraphs about how it went. */
  recap?: string[];
  /** Photos from the event. Empty shows a "photos coming soon" placeholder. */
  gallery?: EventPhoto[];
  /** Buttons that still make sense afterwards (the future-tense `links`
   *  are hidden). */
  pastLinks?: { label: string; url: string }[];
};

export function getFeaturedEvent(slug: string): FeaturedEvent | undefined {
  return (featuredEvents.events as FeaturedEvent[]).find(
    (e) => e.slug === slug,
  );
}

export default function FeaturedEventPage({
  event,
}: {
  event: FeaturedEvent;
}) {
  if (hasPassed(event.date)) return <PastEventPage event={event} />;

  const hasWhen = Boolean(event.dateLabel || event.timeLabel);
  const hasCard =
    hasWhen || Boolean(event.venueName) || Boolean(event.ctaUrl);

  return (
    <>
      <PageHeader kicker={event.kicker} title={event.title} />
      <section className="slotab-section">
        <div className="slotab-container">
          {event.photo && (
            <div
              className={`slotab-flyer${
                (event.photoWidth ?? 1200) > (event.photoHeight ?? 1500)
                  ? " wide"
                  : ""
              }`}
            >
              <Image
                src={event.photo}
                alt={event.photoAlt || `${event.title} flyer`}
                width={event.photoWidth ?? 1200}
                height={event.photoHeight ?? 1500}
                sizes="(max-width: 940px) 100vw, 900px"
                priority
              />
            </div>
          )}

          {event.intro && event.intro.length > 0 && (
            <div className="slotab-event-intro slotab-prose">
              {event.intro.map((para, i) => (
                <p key={para} className={i === 0 ? "lead" : undefined}>
                  {para}
                </p>
              ))}
            </div>
          )}

          {hasCard && (
            <div
              className="slotab-card dark"
              style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}
            >
              {event.dateLabel && (
                <h3 style={{ fontSize: "1.5rem" }}>{event.dateLabel}</h3>
              )}
              {event.timeLabel && (
                <p style={{ fontSize: "1.1rem", margin: "0.5rem 0 1rem" }}>
                  {event.timeLabel}
                </p>
              )}
              {event.venueName && (
                <p style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
                  <strong>{event.venueName}</strong>
                </p>
              )}
              {event.venueDetail && (
                <p style={{ marginBottom: event.ctaUrl ? "1.5rem" : 0 }}>
                  {event.venueDetail}
                </p>
              )}
              {event.ctaUrl && (
                <Link
                  href={event.ctaUrl}
                  className="slotab-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {event.ctaLabel || "Learn More"}
                </Link>
              )}
              {event.ctaUrl && event.qrImage && (
                <div className="slotab-event-qr">
                  <Image
                    src={event.qrImage}
                    alt={`QR code linking to ${event.ctaLabel || "the event page"}`}
                    width={160}
                    height={160}
                  />
                  <span>{event.qrCaption || "Scan to open on your phone"}</span>
                </div>
              )}
            </div>
          )}

          {event.body && event.body.length > 0 && (
            <div className="slotab-prose" style={{ marginTop: "3rem" }}>
              {event.body.map((para) => (
                <p key={para}>{para}</p>
              ))}
              <p>
                Questions about this event?{" "}
                {event.contactEmail ? (
                  <>
                    Email{" "}
                    <a href={`mailto:${event.contactEmail}`}>
                      {event.contactEmail}
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Reach the board on the{" "}
                    <Link href="/contact">contact page</Link>.
                  </>
                )}
              </p>
            </div>
          )}

          {event.links && event.links.length > 0 && (
            <div
              className="slotab-btn-row"
              style={{ justifyContent: "center", marginTop: "2.5rem" }}
            >
              {event.links.map((l) => {
                const external =
                  l.url.startsWith("http") || l.url.startsWith("mailto:");
                const isMail = l.url.startsWith("mailto:");
                return (
                  <Link
                    key={l.url}
                    href={l.url}
                    className="slotab-btn outline"
                    {...(external && !isMail
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : {})}
                  >
                    {l.label}
                    {isMail ? " ✉" : external ? " ↗" : " →"}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}

/** The same page once the event is over: a record of the night rather than
 *  an invitation. Keeps the artwork, date and venue; drops tickets, QR code
 *  and every future-tense paragraph; adds the recap and the photos (or a
 *  placeholder until they arrive). */
function PastEventPage({ event }: { event: FeaturedEvent }) {
  return (
    <>
      <PageHeader kicker={event.pastKicker || "Thank You"} title={event.title} />
      <section className="slotab-section">
        <div className="slotab-container">
          {event.photo && (
            <div
              className={`slotab-flyer slotab-flyer-past${
                (event.photoWidth ?? 1200) > (event.photoHeight ?? 1500)
                  ? " wide"
                  : ""
              }`}
            >
              <Image
                src={event.photo}
                alt={event.photoAlt || `${event.title} artwork`}
                width={event.photoWidth ?? 1200}
                height={event.photoHeight ?? 1500}
                sizes="(max-width: 940px) 100vw, 480px"
                priority
              />
            </div>
          )}

          {(event.dateLabel || event.venueName) && (
            <p className="slotab-event-held">
              Held {event.dateLabel}
              {event.venueName ? <> · {event.venueName}</> : null}
            </p>
          )}

          {event.recap && event.recap.length > 0 && (
            <div className="slotab-event-intro slotab-prose">
              {event.recap.map((para, i) => (
                <p key={para} className={i === 0 ? "lead" : undefined}>
                  {para}
                </p>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Photos</span>
            <h2>{event.title} in Pictures</h2>
          </div>
          <EventPhotos photos={event.gallery} eventName={event.title} />

          {event.pastLinks && event.pastLinks.length > 0 && (
            <div
              className="slotab-btn-row"
              style={{ justifyContent: "center", marginTop: "2.5rem" }}
            >
              {event.pastLinks.map((l) => (
                <Link key={l.url} href={l.url} className="slotab-btn outline">
                  {l.label} →
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
