import Image from "next/image";
import Link from "next/link";
import hofData from "../data/hof.json";

// The Class of 2026 fundraising band on /hall-of-fame (#184).
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
// EVERYTHING EDITABLE LIVES IN hof.json (Decap: Hall of Fame → Fund the Class).
// Levels, copy, photos, and the goal are data. In particular `goalDollars` is 0
// until the AD supplies a real target: the thermometer renders only when it is
// set, because an invented goal on a 501(c)(3) donation page is worse than no
// goal at all.

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
  heroPhoto: string;
  heroPhotoPosition?: string;
  goalDollars: number;
  raisedDollars: number;
  raisedAsOf: string;
  levels: Level[];
  levelsNote: string;
  gallery: { photo: string; caption: string }[];
  tributeHint: string;
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

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
  const pct = hasGoal
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
                Fund the HOF Class of 2026
              </Link>
            </p>
          </div>

          <div className="slotab-hof-fund-body">
            {fund.body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          {/* Thermometer — only once there is a real target to measure
              against. See the note in hof.json. */}
          {hasGoal && (
            <div className="slotab-hof-goal">
              <div className="slotab-hof-goal-figures">
                <strong>{MONEY.format(fund.raisedDollars)}</strong>
                <span>
                  raised of {MONEY.format(fund.goalDollars)} for the Class of{" "}
                  2026
                </span>
              </div>
              <div
                className="slotab-hof-goal-track"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Hall of Fame fund progress: ${pct}% of goal`}
              >
                <div
                  className="slotab-hof-goal-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              {fund.raisedAsOf && (
                <p className="slotab-hof-goal-asof">
                  As of {fund.raisedAsOf}. Updated after each SLOTAB meeting.
                </p>
              )}
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

          <div className="slotab-hof-fund-cta">
            <Link href={donateHref()} className="slotab-btn">
              Fund the HOF Class of 2026
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
