import Image from "next/image";
import Link from "next/link";
import hofData from "../data/hof.json";

// The Hall of Fame Fund band on /hall-of-fame (#184, reframed #186, #187).
//
// TWO FACTS THE COPY MUST KEEP STRAIGHT
// 1. SLOHS inducts a class EVERY OTHER YEAR, not every year (the AD, #187).
//    The first draft got this wrong in five separate strings. If you write new
//    copy here, do not reintroduce it — and note the biennial cadence is an
//    argument FOR the fund, not a complication: the money that arrives between
//    inductions is what makes the next one right.
// 2. It is a standing fund, not a class drive — see below.
//
// IT IS A STANDING FUND, NOT A CLASS DRIVE
// It shipped as a "Class of 2026" campaign. The Athletic Director's review
// changed that: "the goal is to fund the Hall of Fame in general and not just
// this class. The alumni are an integral part of the Tiger Community and we
// should continually reach that audience." So the copy is deliberately
// class-agnostic — naming one class is exactly what dates a page the morning
// after an induction, and it tells an alum who graduated in 1994 that this
// year's drive is not about them. Keep it that way when editing.
//
// WHY IT LOOKS DIFFERENT FROM THE REST OF THE PAGE
// Everything else on /hall-of-fame is a record: mission, criteria, 46 names in
// a filterable grid. This is the one block asking for money, and a request that
// reads like the paragraph above it gets skimmed with the paragraph above it.
// So it is the page's only dark band — black ground, archival black-and-white
// photograph, gold rules top and bottom — which is also the visual language of
// the thing being funded (a plaque, a medallion, a trophy case).
//
// WHAT THE COPY HAS TO DO
// Nobody gives to "the Hall of Fame fund". They give to a specific object
// handed to a specific person on a specific night, so the ladder is written as
// objects — nameplate, medallion, award — not as amounts. Each card deep-links
// its own figure into the donate form (`?amount=`), because the gap between "I
// should give $250" and a typed 2-5-0 is where donations die.
//
// EVERYTHING EDITABLE LIVES IN hof.json (Decap: Hall of Fame → Hall of Fame
// Fund). Levels, copy, photos, the button label and the goal are all data —
// the button label included, because it has now been renamed twice in three
// days and that should never need a deploy. `goalDollars` held 0 until the AD
// gave a real figure, because an invented goal on a 501(c)(3) donation page is
// worse than no goal at all; it is now $10,000 (#187) and the thermometer
// renders. `raisedDollars` is refreshed by hand from /board/square-report —
// weekly, and always together with `raisedAsOf`, which is what keeps the
// figure publishing at all (#190 started it at $0).

type Level = {
  amount: number;
  item: string;
  blurb: string;
  featured?: boolean;
};

type Fund = {
  enabled: boolean;
  designation: string;
  kicker: string;
  title: string;
  lead: string;
  body: string[];
  /** The 75/25 fact. Its own field rather than a third body paragraph: the body
   *  is a two-column grid, so an odd third paragraph orphaned under the left
   *  column. This is a standing note about the gift, not part of the argument,
   *  and reads better full width beneath both columns. */
  splitNote?: string;
  heroPhoto: string;
  heroPhotoPosition?: string;
  ctaLabel: string;
  goalDollars: number;
  raisedDollars: number;
  /** ISO date (YYYY-MM-DD) the raised figure was read off
   *  /board/square-report. An ISO date rather than a display string on
   *  purpose: it is what makes the figure a *dated* claim the code can check,
   *  and a free-text "September 12" cannot be compared to anything. Rendered
   *  for humans below. Empty = no figure published yet. */
  raisedAsOf: string;
  /** How many days a raised figure stays publishable. The board promised a
   *  WEEKLY refresh (2026-08-25), so this is the grace period on that promise:
   *  past it the bar stops asserting a number and falls back to showing the
   *  goal alone. A thermometer that quietly freezes is the standard failure of
   *  this widget, and the one thing worse than no number is a stale number
   *  under a 501(c)(3) logo. Default 14 — two missed weeks. */
  raisedStaleAfterDays?: number;
  /** The phrase the thermometer figures are read against, e.g. "for the Hall of
   *  Fame Fund". Data rather than a literal, so the sentence never has to name
   *  a single class again. */
  goalLabel: string;
  levels: Level[];
  levelsNote: string;
  gallery: { photo: string; caption: string }[];
  /** The AD's core point, given its own block: alumni are the audience for this
   *  fund, and they need to be addressed directly rather than left to infer it
   *  from a paragraph about engraving. */
  alumniCallout?: { title: string; body: string };
  tributeHint: string;
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** When this build was made, used to age the raised figure.
 *
 *  Module scope, not the component body, for two reasons that happen to agree:
 *  the React compiler rejects `Date.now()` during render as impure (correctly —
 *  a value that changes between renders is exactly what it guards against), and
 *  build time is the semantics actually wanted here. Evaluated once per build,
 *  so the staleness flip lands on the next rebuild after the boundary — the
 *  same trade-off `isDonateDriveActive` documents in campaign.ts, and the same
 *  reason it is safe: deploys and the events cron rebuild this site regularly. */
const BUILT_AT_MS = Date.now();

/** The photo strip. Exported separately from the band because the page now
 *  opens with the ask and puts the save-the-date directly beneath it — the
 *  photographs belong after that, as the transition into the mission copy,
 *  not wedged between the ask and the night it pays for. */
export function HofLegacyStrip() {
  const fund = hofData.fund as Fund;
  if (!fund?.enabled || fund.gallery.length === 0) return null;
  return (
    <section className="slotab-section slotab-hof-legacy">
      <div className="slotab-container">
        <div className="slotab-hof-legacy-grid">
          {fund.gallery.map((shot) => (
            <figure key={shot.photo} className="slotab-hof-legacy-item">
              <Image
                src={shot.photo}
                alt={shot.caption}
                width={1200}
                height={800}
                sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 360px"
                loading="lazy"
              />
              <figcaption>{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HofFund() {
  const fund = hofData.fund as Fund;
  const { ceremony } = hofData;
  if (!fund?.enabled) return null;

  // `tab=general` because /donate opens on the Sponsorship half by default
  // (Trina, 2026-08-21) — a parent sent here for the Hall of Fame would
  // otherwise land on a business form and have to find their way back.
  const donateHref = (amount?: number) =>
    `/donate?tab=general&team=${fund.designation}` +
    (amount ? `&amount=${amount}` : "");

  const hasGoal = fund.goalDollars > 0;
  // A raised total is a DATED CLAIM, not a fact — the house rule the status doc
  // spells out. `raisedAsOf` is what turns one into the other, so the figure is
  // published only once someone has stamped a date on it by reading the Hall of
  // Fame row off /board/square-report. Until then the bar shows the goal alone.
  //
  // That gate held a figure back until #190: the designation had been live in the
  // donate form since #184, so "$0 raised" was a claim about money that might
  // already have come in, printed under a 501(c)(3) logo. The board has since
  // chosen to start the bar at zero (2026-08-27) rather than run the goal-only
  // state — a fine call, but it means the number now published counts WEBSITE
  // gifts from that date. A cheque handed to the Treasurer does not reach it on
  // its own; it has to be added to `raisedDollars` by hand.
  // Aged against BUILT_AT_MS — see the note on that constant. Doing this on the
  // server rather than in the browser also keeps the markup deterministic and
  // avoids a hydration mismatch on a date boundary.
  const asOf = fund.raisedAsOf.trim();
  const asOfMs = asOf ? Date.parse(`${asOf}T12:00:00Z`) : NaN;
  const staleAfterDays = fund.raisedStaleAfterDays ?? 14;
  const ageDays = Number.isNaN(asOfMs)
    ? Infinity
    : (BUILT_AT_MS - asOfMs) / 86_400_000;
  // A figure is publishable only while it is both present and fresh.
  const hasRaisedFigure = !Number.isNaN(asOfMs) && ageDays <= staleAfterDays;
  const asOfLabel = Number.isNaN(asOfMs)
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(asOfMs);
  const pct =
    hasGoal && hasRaisedFigure
      ? Math.min(100, Math.round((fund.raisedDollars / fund.goalDollars) * 100))
      : 0;

  return (
    <section className="slotab-hof-fund" id="fund">
        <Image
          src={fund.heroPhoto}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          style={{
            objectFit: "cover",
            objectPosition: fund.heroPhotoPosition ?? "center center",
          }}
        />
        <div className="slotab-hof-fund-overlay" />

        <div className="slotab-hof-fund-inner">
          <div className="slotab-hof-fund-head">
            <span className="slotab-kicker">{fund.kicker}</span>
            <h2>{fund.title}</h2>
            <p className="slotab-hof-fund-lead">{fund.lead}</p>
            {/* A second ask, at the top. The band runs ~1500px on a laptop, so
                the buttons at its foot are a long scroll from the headline that
                did the persuading — and a donor already convinced should not
                have to read a six-rung ladder to find a button. The pair at the
                bottom stays for the donor who does read it. */}
            <p className="slotab-hof-fund-head-cta">
              <Link href={donateHref()} className="slotab-btn">
                {fund.ctaLabel}
              </Link>
            </p>
          </div>

          <div className="slotab-hof-fund-body">
            {fund.body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          {fund.splitNote && (
            <p className="slotab-hof-fund-split">{fund.splitNote}</p>
          )}

          {/* Thermometer — only once there is a real target to measure
              against. See the note in hof.json. */}
          {hasGoal && (
            <div className="slotab-hof-goal">
              <div className="slotab-hof-goal-figures">
                {hasRaisedFigure ? (
                  <>
                    <strong>{MONEY.format(fund.raisedDollars)}</strong>
                    <span>
                      raised of {MONEY.format(fund.goalDollars)}{" "}
                      {fund.goalLabel}
                    </span>
                  </>
                ) : (
                  <>
                    <strong>{MONEY.format(fund.goalDollars)}</strong>
                    <span>the goal {fund.goalLabel}</span>
                  </>
                )}
              </div>
              <div
                className="slotab-hof-goal-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={
                  hasRaisedFigure
                    ? `Hall of Fame fund progress: ${pct}% of goal`
                    : "Hall of Fame fund progress: not yet published"
                }
              >
                <div
                  className="slotab-hof-goal-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="slotab-hof-goal-asof">
                {hasRaisedFigure
                  ? `As of ${asOfLabel}. Updated weekly.`
                  : "The bar fills as gifts come in, updated weekly."}
              </p>
            </div>
          )}

          {/* The ladder. Written as objects, not amounts — see the note at the
              top of this file. */}
          <ul className="slotab-hof-levels">
            {fund.levels.map((level) => (
              <li
                key={level.amount}
                className={`slotab-hof-level${level.featured ? " featured" : ""}`}
              >
                <Link href={donateHref(level.amount)}>
                  {level.featured && (
                    <span className="slotab-hof-level-flag">
                      Most meaningful
                    </span>
                  )}
                  <span className="slotab-hof-level-amount">
                    {MONEY.format(level.amount)}
                  </span>
                  <span className="slotab-hof-level-item">{level.item}</span>
                  <span className="slotab-hof-level-blurb">{level.blurb}</span>
                  <span className="slotab-hof-level-go" aria-hidden="true">
                    Give {MONEY.format(level.amount)} →
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <p className="slotab-hof-levels-note">{fund.levelsNote}</p>

          {/* Alumni block, between the ladder and the CTA row: it is the reason
              to give for the audience the AD wants reached, so it belongs
              immediately before the button rather than buried in body copy. */}
          {fund.alumniCallout && (
            <div className="slotab-hof-alumni">
              <h3>{fund.alumniCallout.title}</h3>
              <p>{fund.alumniCallout.body}</p>
            </div>
          )}

          <div className="slotab-hof-fund-cta">
            <Link href={donateHref()} className="slotab-btn">
              {fund.ctaLabel}
            </Link>
            {ceremony.ticketsUrl && (
              <Link
                href={ceremony.ticketsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-btn outline"
              >
                Be there {ceremony.dateLabel.replace(/,.*/, "")} — Bash tickets
              </Link>
            )}
          </div>

          <p className="slotab-hof-fund-fineprint">
            {fund.tributeHint} SLOTAB is a 501(c)(3); gifts are tax-deductible
            to the extent allowed by law.
          </p>
        </div>
    </section>
  );
}
