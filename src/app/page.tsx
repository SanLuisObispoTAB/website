import Image from "next/image";
import Link from "next/link";
import ClassicHero from "./components/tiger/ClassicHero";
import TigerSponsorWall from "./components/tiger/TigerSponsorWall";

const STATS = [
  { num: "27", label: "CIF-sanctioned teams" },
  { num: "600+", label: "Student-athletes annually" },
  { num: "$1.4M", label: "Raised since 2012" },
  { num: "501(c)(3)", label: "Non-profit · EIN 45-4897120" },
];

const THREE_WAYS = [
  {
    num: "01",
    title: "Donate to SLOTAB",
    body: "75% of every gift goes directly to the team you designate. 25% goes to the general fund that benefits every Tigers team — Hudl, senior banners, T-shirts.",
    cta: "Make a Donation →",
    href: "/donate",
  },
  {
    num: "02",
    title: "Sponsor a Team",
    body: "Local businesses sponsor SLOTAB at Platinum, Gold, Silver, or Bronze tiers — or sponsor a specific team directly.",
    cta: "Business Sponsorship →",
    href: "/membership",
  },
  {
    num: "03",
    title: "Volunteer",
    body: "Concession stand, apparel booth, gate, or Booster Bash. Every hour goes straight to the athletes.",
    cta: "Volunteer Opportunities →",
    href: "/volunteer",
  },
];

const IMPACT_FIGURES = [
  ["$48,200", "Equipment & gear"],
  ["$31,500", "Travel & tournaments"],
  ["$22,800", "Facility upgrades"],
  ["$14,300", "Athlete meals & snacks"],
];

const FEATURED_TEAMS = [
  {
    name: "Football",
    season: "Fall",
    img: "/photos/football-helmets.jpg",
    record: "8–3",
    href: "/teams/football",
  },
  {
    name: "Girls Volleyball",
    season: "Fall",
    img: "/photos/volleyball-set.jpg",
    record: "21–4",
    href: "/teams/girls-volleyball",
  },
  {
    name: "Boys Water Polo",
    season: "Fall",
    img: "/photos/water-polo-boys-2.jpg",
    record: "14–6",
    href: "/teams",
  },
  {
    name: "Girls Tennis",
    season: "Fall",
    img: "/photos/tennis-team.jpg",
    record: "12–2",
    href: "/teams",
  },
];

const CALENDAR = [
  {
    date: "APR 9",
    day: "THU",
    title: "Spring Social",
    meta: "5:30–8:00 PM · The Hub, 1701 Monterey St",
    tag: "Featured",
    href: "/spring-social",
  },
  {
    date: "APR 13",
    day: "MON",
    title: "SLOTAB Monthly Meeting",
    meta: "6:00 PM · Cannon Boardroom (Zoom available)",
    href: "/upcoming",
  },
  {
    date: "APR 18",
    day: "SAT",
    title: "Track & Field — Tiger Invitational",
    meta: "9:00 AM · Holt Field",
    href: "/upcoming",
  },
  {
    date: "MAY 4",
    day: "MON",
    title: "Final SLOTAB Meeting of the Year",
    meta: "6:00 PM · Cannon Boardroom",
    href: "/upcoming",
  },
  {
    date: "MAY 12",
    day: "TUE",
    title: "Physical Night — SLOTAB on site",
    meta: "4:00–8:00 PM · SLOHS Gym Lobby",
    href: "/upcoming",
  },
];

const HOF_PREVIEW = [
  { year: "2024", name: "Coach Mary Cisneros", sport: "Volleyball · 28 Years" },
  { year: "2023", name: "Marcus Hall '05", sport: "Football · NFL" },
  { year: "2023", name: "Elena Park '12", sport: "Track · Olympic Trials" },
  { year: "2022", name: "1994 State Champions", sport: "Boys Soccer" },
  { year: "2022", name: "Dr. Robert Teitge", sport: "Founding Boosters" },
  { year: "2021", name: "Sarah Whitfield '08", sport: "Tennis · D1 All-American" },
];

export default function ClassicHomePage() {
  return (
    <>
      <ClassicHero />

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

      {/* Three Ways */}
      <section className="tiger-section tiger-three-ways">
        <div className="tiger-container">
          <div className="tiger-section-head">
            <span className="tiger-eyebrow">How You Can Help</span>
            <h2>Three ways to support Tiger athletics.</h2>
            <p>
              Memberships, sponsorships, and volunteer hours fund equipment,
              travel, facilities, and the small things that make a season.
            </p>
          </div>
          <div className="tiger-three-grid">
            {THREE_WAYS.map((c) => (
              <div key={c.num} className="tiger-three-card tiger-card-lift">
                <div className="tiger-three-num">{c.num} —</div>
                <h3 className="tiger-three-title">{c.title}</h3>
                <p className="tiger-three-body">{c.body}</p>
                <Link href={c.href} className="tiger-ulink tiger-three-cta">
                  {c.cta}
                </Link>
              </div>
            ))}
          </div>
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
                — see exactly what the booster club bought last season.
              </p>
              <div className="tiger-impact-figures">
                {IMPACT_FIGURES.map(([num, label]) => (
                  <div key={label} className="tiger-impact-fig">
                    <div className="tiger-impact-fig-num">{num}</div>
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
                  src="/photos/basketball-girls.jpg"
                  alt="Bailey Hartford · Senior Captain"
                  width={680}
                  height={560}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <div className="tiger-impact-card">
                <div className="tiger-impact-card-eyebrow">2024–25 Total</div>
                <div className="tiger-impact-card-num">$116,800</div>
                <div className="tiger-impact-card-sub">
                  Raised &amp; deployed for Tiger athletes
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Teams grid */}
      <section className="tiger-section">
        <div className="tiger-container">
          <div className="tiger-teams-head">
            <div className="tiger-section-head">
              <span className="tiger-eyebrow">27 Teams · One Pride</span>
              <h2>Every team. Every season.</h2>
            </div>
            <Link href="/teams" className="tiger-ulink">
              View all teams →
            </Link>
          </div>
          <div className="tiger-teams-grid">
            {FEATURED_TEAMS.map((t) => (
              <Link key={t.name} href={t.href} className="tiger-team-card tiger-card-lift">
                <div className="tiger-team-photo">
                  <Image
                    src={t.img}
                    alt={t.name}
                    width={400}
                    height={320}
                    sizes="(max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="tiger-team-meta">
                  <div>
                    <div className="tiger-team-season">{t.season}</div>
                    <div className="tiger-team-name">{t.name}</div>
                  </div>
                  <div className="tiger-team-record">{t.record}</div>
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
              <Link href="/watch" className="tiger-watch-feature tiger-card-lift">
                <Image
                  src="/photos/volleyball-set.jpg"
                  alt="Girls Beach Volleyball"
                  width={800}
                  height={380}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="tiger-watch-feature-overlay" />
                <div className="tiger-watch-tags">
                  <span className="tiger-live-badge">
                    <span className="tiger-live-dot tiger-pulse" />
                    LIVE
                  </span>
                  <span className="tiger-tag tiger-tag-dark">Beach Volleyball</span>
                </div>
                <div className="tiger-watch-feature-body">
                  <div className="tiger-watch-feature-title">
                    Girls Beach Volleyball vs Morro Bay
                  </div>
                  <div className="tiger-watch-feature-meta">
                    NOW STREAMING ON HUDL · 1,247 watching
                  </div>
                </div>
              </Link>
              <div className="tiger-watch-thumbs">
                {[
                  {
                    sport: "Basketball",
                    title: "V Girls Basketball vs Arroyo Grande",
                    date: "APR 2",
                    img: "/photos/basketball-girls.jpg",
                  },
                  {
                    sport: "Water Polo",
                    title: "Boys Water Polo @ SLO",
                    date: "APR 2",
                    img: "/photos/water-polo-boys-2.jpg",
                  },
                ].map((v) => (
                  <Link key={v.title} href="/watch" className="tiger-watch-thumb">
                    <Image
                      src={v.img}
                      alt={v.title}
                      width={400}
                      height={180}
                      sizes="(max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="tiger-watch-thumb-overlay" />
                    <div className="tiger-watch-thumb-tag">
                      <span className="tiger-tag tiger-tag-dark">{v.sport}</span>
                    </div>
                    <div className="tiger-watch-thumb-body">
                      <div className="tiger-watch-thumb-title">{v.title}</div>
                      <div className="tiger-watch-thumb-date">{v.date}</div>
                    </div>
                  </Link>
                ))}
              </div>
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
              <h2>Our 2025–26 sponsors.</h2>
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
            Memberships start at $25. Recurring gifts start at $10/mo. 100% of
            every dollar goes to SLOHS student-athletes.
          </p>
          <div className="tiger-cta-row">
            <Link
              href="/donate"
              className="tiger-btn tiger-btn-dark tiger-btn-arrow"
            >
              Donate Now
            </Link>
            <Link href="/membership" className="tiger-btn tiger-btn-ghost">
              Become a Member
            </Link>
            <Link href="/contact" className="tiger-btn tiger-btn-ghost">
              Contact the Board
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
