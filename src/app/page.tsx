import Image from "next/image";
import Link from "next/link";
import ClassicHero from "./components/tiger/ClassicHero";
import PlatinumCarousel from "./components/PlatinumCarousel";
import TeamsCarousel from "./components/tiger/TeamsCarousel";
import TigerSponsorWall from "./components/tiger/TigerSponsorWall";
import { isDonateDriveActive } from "./data/campaign";
import { ALL_EVENTS } from "./data/events";
import hofInductees from "./data/hof-inductees.json";

const STATS = [
  { num: "27", label: "CIF-sanctioned teams" },
  { num: "600+", label: "Student-athletes annually" },
  { num: "$1.4M", label: "Raised since 2012" },
  { num: "501(c)(3)", label: "Non-profit · EIN 45-4897120" },
];

const WAYS_TO_SUPPORT = [
  {
    num: "01",
    title: "Become a Member",
    body: "Membership is the foundation of SLOTAB. It funds uniforms, equipment, travel, and the broader needs of every Tigers team. Join at any level — from Tiger Friend to Champion Sponsor.",
    cta: "See Membership Levels →",
    href: "/membership",
    primary: true,
  },
  {
    num: "02",
    title: "Volunteer",
    body: "Concession stand, apparel booth, gate, or Booster Bash. Every hour goes straight to the athletes.",
    cta: "Volunteer Opportunities →",
    href: "/volunteer",
  },
];

// What the general fund and designated gifts actually pay for. Deliberately
// categories, not dollar figures — the real per-category totals come from the
// Treasurer's ledger (see /impact) and nothing goes on this page until then.
const IMPACT_CATEGORIES = [
  "Equipment & gear",
  "Travel & tournaments",
  "Facility upgrades",
  "Athlete meals & snacks",
];

// Build the home calendar from the live event sources (slotab-events.json
// + scraped weekly-events.json + MaxPreps fallback). Filter to events from
// today onward, sort ascending, take the first 5.
function buildHomeCalendar(): {
  date: string;
  day: string;
  title: string;
  meta: string;
  tag?: string;
  href: string;
}[] {
  const todayMidnight = new Date();
  todayMidnight.setHours(0, 0, 0, 0);
  const fmtDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });
  const fmtDay = new Intl.DateTimeFormat("en-US", { weekday: "short" });
  const fmtTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return ALL_EVENTS.filter((e) => new Date(e.date) >= todayMidnight)
    .slice(0, 5)
    .map((e) => {
      const d = new Date(e.date);
      const time = fmtTime.format(d);
      const meta = e.detail ? e.detail : `${time} · ${e.categoryLabel}`;
      return {
        date: fmtDate.format(d).toUpperCase(),
        day: fmtDay.format(d).toUpperCase(),
        title: e.title,
        meta,
        tag: e.isSport ? undefined : "SLOTAB",
        // Events with a dedicated page deep-link to it; everything else
        // falls through to the full calendar.
        href: e.href ?? "/upcoming",
      };
    });
}

const CALENDAR = buildHomeCalendar();

// Fall-season designs, swapped in from the spring three (baseball, track,
// beach volleyball) at the 2026-27 rollover. These are the fall sports we
// currently hold shirt art for; refresh when the fall run goes to print.
const FEATURED_MERCH = [
  { name: "Tiger Volleyball", src: "/merch/SLOHS_Volleyball_2.png" },
  { name: "Tiger Tennis", src: "/merch/SLOHS_Tennis_2-1.png" },
  { name: "Tiger Golf", src: "/merch/SLOHS_Golf_2.png" },
];

// Six real inductees from the most recent class, pulled from the same file
// that backs /hall-of-fame so this strip can never drift from the actual roll.
type Inductee = { name: string; yearInducted: string; sport: string };
const HOF_PREVIEW = (() => {
  const all = hofInductees.inductees as Inductee[];
  const latest = all
    .map((i) => i.yearInducted)
    .sort()
    .at(-1);
  return all
    .filter((i) => i.yearInducted === latest)
    .slice(0, 6)
    .map((i) => ({ year: i.yearInducted, name: i.name, sport: i.sport }));
})();

export default function ClassicHomePage() {
  // Seasonal Donate drive: feature the prominent Donate CTA only while a
  // drive is running (board direction, 2026-08). Resolved at build time
  // here and passed to client components so hydration stays consistent.
  const donateActive = isDonateDriveActive();

  return (
    <>
      <ClassicHero donateActive={donateActive} />

      {/* Stats bar */}
      <section className="tiger-stats">
        <div className="tiger-container">
          <div className="tiger-stats-grid">
            {STATS.map((s) => (
              <div key={s.label} className="tiger-stat">
                <div className="tiger-stat-num">{s.num}</div>
                <div className="tiger-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ways to support */}
      <section className="tiger-section tiger-three-ways">
        <div className="tiger-container">
          <div className="tiger-section-head">
            <span className="tiger-eyebrow">How You Can Help</span>
            <h2>Two ways to support Tiger athletics.</h2>
            <p>
              Memberships and volunteer hours fund equipment, travel,
              facilities, and the small things that make a season.
            </p>
          </div>
          <div className="tiger-three-grid tiger-two-grid">
            {WAYS_TO_SUPPORT.map((c) => (
              <div
                key={c.num}
                className={`tiger-three-card tiger-card-lift${
                  c.primary ? " tiger-three-card-primary" : ""
                }`}
              >
                <div className="tiger-three-num">{c.num} —</div>
                <h3 className="tiger-three-title">{c.title}</h3>
                <p className="tiger-three-body">{c.body}</p>
                <Link href={c.href} className="tiger-ulink tiger-three-cta">
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="tiger-two-note">
            Want to back a specific sport? You can{" "}
            <Link href="/donate" className="tiger-ulink">
              donate directly to any team
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Impact split */}
      <section className="tiger-section tiger-impact">
        <div className="tiger-container">
          <div className="tiger-impact-grid">
            <div>
              <span className="tiger-eyebrow">Where Your Dollars Go</span>
              <h2 className="tiger-impact-headline">
                Every donation funds a real{" "}
                <em>purchase</em> for Tiger athletes.
              </h2>
              <p className="tiger-impact-body">
                From sport-specific shirts for every athlete to tackle dummies,
                scoreboard panels, tournament travel, and post-practice snacks
                — booster dollars turn into equipment a coach can point at.
              </p>
              <div className="tiger-impact-figures">
                {IMPACT_CATEGORIES.map((label) => (
                  <div key={label} className="tiger-impact-fig">
                    <div className="tiger-impact-fig-label">{label}</div>
                  </div>
                ))}
              </div>
              <Link
                href="/impact"
                className="tiger-btn tiger-btn-dark tiger-btn-arrow"
                style={{ marginTop: "36px" }}
              >
                See the Full Impact
              </Link>
            </div>
            <div className="tiger-impact-figure-wrap">
              <div className="tiger-impact-photo">
                <Image
                  src="/photos/gbball-hartford.jpg"
                  alt="Bailey Hartford · Senior Captain"
                  width={680}
                  height={560}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="tiger-impact-card">
                <div className="tiger-impact-card-eyebrow">The Split</div>
                <div className="tiger-impact-card-num">75 / 25</div>
                <div className="tiger-impact-card-sub">
                  75% to the team you designate · 25% to the general fund
                  every Tigers team draws on
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PlatinumCarousel />

      {/* Teams carousel — current-trimester teams. "View all" → /teams */}
      <TeamsCarousel />

      {/* Featured Gear strip */}
      <section className="tiger-section tiger-merch-strip">
        <div className="tiger-container">
          <div className="tiger-merch-strip-head">
            <div className="tiger-section-head">
              <span className="tiger-eyebrow">Wear Your Stripes</span>
              <h2>Tiger gear, every sport.</h2>
            </div>
            <Link href="/merch" className="tiger-ulink">
              Shop all designs →
            </Link>
          </div>
          <div className="tiger-merch-grid">
            {FEATURED_MERCH.map((s) => (
              <Link
                key={s.name}
                href="/merch"
                className="tiger-merch-card tiger-card-lift"
              >
                <div className="tiger-merch-card-img">
                  <Image
                    src={s.src}
                    alt={`${s.name} shirt design`}
                    width={480}
                    height={480}
                    sizes="(max-width: 480px) 90vw, (max-width: 880px) 45vw, 30vw"
                  />
                </div>
                <div className="tiger-merch-card-meta">
                  <div className="tiger-merch-card-name">{s.name}</div>
                  <div className="tiger-merch-card-go">SHOP →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Calendar + Watch */}
      <section className="tiger-section tiger-cal-watch">
        <div className="tiger-container">
          <div className="tiger-cal-watch-grid">
            <div>
              <div className="tiger-section-head">
                <span className="tiger-eyebrow">Upcoming</span>
                <h2>What&apos;s on the calendar.</h2>
              </div>
              <div className="tiger-cal-list">
                {CALENDAR.length === 0 && (
                  <p className="tiger-cal-empty">
                    The fall schedule posts here as soon as the SLOHS athletic
                    department publishes it — game times update automatically
                    every week.{" "}
                    <Link href="/upcoming" className="tiger-ulink">
                      See all events →
                    </Link>
                  </p>
                )}
                {CALENDAR.map((e) => (
                  <Link key={e.date + e.title} href={e.href} className="tiger-cal-row">
                    <div>
                      <div className="tiger-cal-date">{e.date}</div>
                      <div className="tiger-cal-day">{e.day}</div>
                    </div>
                    <div>
                      <div className="tiger-cal-title">{e.title}</div>
                      <div className="tiger-cal-meta">{e.meta}</div>
                    </div>
                    <div>
                      {e.tag && <span className="tiger-tag tiger-tag-gold">{e.tag}</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <div className="tiger-section-head">
                <span className="tiger-eyebrow">Watch the Tigers</span>
                <h2>Live &amp; on-demand.</h2>
              </div>
              {/* Promo for the Hudl BlueFrame portal on /watch. No live
                  status or viewer counts — we have no feed for either, and
                  the portal itself is the source of truth for what's on. */}
              <Link href="/watch" className="tiger-watch-feature tiger-card-lift">
                <Image
                  src="/photos/bfball-1-1200x835.jpg"
                  alt="SLOHS Tigers football under the lights"
                  width={800}
                  height={380}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="tiger-watch-feature-overlay" />
                <div className="tiger-watch-tags">
                  <span className="tiger-tag tiger-tag-dark">Tigers Watch Portal</span>
                </div>
                <div className="tiger-watch-feature-body">
                  <div className="tiger-watch-feature-title">
                    Every Tiger broadcast, live and on demand
                  </div>
                  <div className="tiger-watch-feature-meta">
                    ON HUDL · STREAMING SPONSORED BY SLOTAB
                  </div>
                </div>
              </Link>
              <p className="tiger-watch-note">
                Home games stream from the SLOHS Hudl portal — search by sport,
                catch a live game, or pull up the archive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors (dark) */}
      <section className="tiger-sponsors">
        <div className="tiger-container">
          <div className="tiger-sponsors-head">
            <div className="tiger-section-head dark">
              <span className="tiger-eyebrow">Powered By Local</span>
              <h2>Our 2026–27 sponsors.</h2>
            </div>
            <Link
              href="/membership"
              className="tiger-btn tiger-btn-primary tiger-btn-arrow"
            >
              Become a Sponsor
            </Link>
          </div>
          <TigerSponsorWall mode="compact" />
          <div className="tiger-sponsors-foot">
            <Link href="/membership">SEE ALL SPONSORS →</Link>
          </div>
        </div>
      </section>

      {/* Hall of Fame strip */}
      <section className="tiger-section">
        <div className="tiger-container">
          <div className="tiger-hof-grid">
            <div>
              <span className="tiger-eyebrow">Tigers For Life</span>
              <h2 className="tiger-hof-headline">
                Hall of <em>Fame</em>
              </h2>
              <p className="tiger-hof-body">
                Honoring the student-athletes, coaches, and contributors whose
                excellence defines a generation of Tiger athletics. Inductions
                held annually at the Booster Bash.
              </p>
              <Link
                href="/hall-of-fame"
                className="tiger-btn tiger-btn-dark tiger-btn-arrow"
                style={{ marginTop: "28px" }}
              >
                Visit the Hall
              </Link>
            </div>
            <div className="tiger-hof-cards">
              {HOF_PREVIEW.map((h) => (
                <div key={h.name + h.year} className="tiger-hof-card">
                  <div className="tiger-hof-card-year">INDUCTED · {h.year}</div>
                  <div className="tiger-hof-card-name">{h.name}</div>
                  <div className="tiger-hof-card-sport">{h.sport}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing gold CTA */}
      <section className="tiger-section tiger-cta-closing">
        <svg
          className="tiger-cta-paw"
          width={500}
          height={500}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <ellipse cx="12" cy="15" rx="5" ry="4" />
          <ellipse cx="5" cy="9" rx="2" ry="2.5" />
          <ellipse cx="12" cy="6" rx="2" ry="2.5" />
          <ellipse cx="19" cy="9" rx="2" ry="2.5" />
        </svg>
        <div className="tiger-cta-inner">
          <div className="tiger-cta-eyebrow">— Join The Pride</div>
          <h2 className="tiger-cta-headline">
            One school. <em>One pride.</em>
          </h2>
          <p className="tiger-cta-sub">
            Memberships from $50/yr ($5/mo). 100% of every dollar goes to
            SLOHS student-athletes.
          </p>
          <div className="tiger-cta-row">
            {donateActive ? (
              <>
                <Link
                  href="/donate"
                  className="tiger-btn tiger-btn-dark tiger-btn-arrow"
                >
                  Donate Now
                </Link>
                <Link href="/membership" className="tiger-btn tiger-btn-ghost">
                  Become a Member
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/membership"
                  className="tiger-btn tiger-btn-dark tiger-btn-arrow"
                >
                  Become a Member
                </Link>
                <Link href="/donate" className="tiger-btn tiger-btn-ghost">
                  Donate
                </Link>
              </>
            )}
            <Link href="/contact" className="tiger-btn tiger-btn-ghost">
              Contact the Board
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
