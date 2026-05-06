import Link from "next/link";
import HeroCarousel from "./components/HeroCarousel";
import HudlGrid from "./components/HudlGrid";
import PlatinumCarousel from "./components/PlatinumCarousel";

export default function SlotabHome() {
  return (
    <>
      <HeroCarousel />

      <section className="slotab-impact-strip">
        <div className="slotab-container slotab-impact-strip-inner">
          <div className="slotab-impact-strip-lead">
            <span className="slotab-kicker">Where Your Dollars Go</span>
            <h2>
              Every donation funds a real purchase for Tiger athletes.
            </h2>
            <p>
              From sport-specific shirts for every athlete to tackle
              dummies, scoreboard panels, tournament travel, and post-
              practice snacks — see exactly what the booster club
              bought last season.
            </p>
          </div>
          <div className="slotab-impact-strip-cta">
            <Link href="/impact" className="slotab-btn">
              See the Impact
            </Link>
          </div>
        </div>
      </section>

      <section className="slotab-feature-strip">
        <h2>Next Up: Spring Social</h2>
        <p>
          Thursday, April 9 • 5:30–8:00 PM at The Hub, 1701 Monterey Street.
          Join us for SLOTAB&apos;s annual spring social.
        </p>
        <Link href="/spring-social" className="slotab-btn dark">
          Event Details
        </Link>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Upcoming</span>
            <h2>What&apos;s On the Calendar</h2>
          </div>
          <ul className="slotab-events" style={{ maxWidth: 820, margin: "0 auto" }}>
            <li>
              <span className="date">Apr 9</span>
              <div>
                <strong>Spring Social</strong> — 5:30–8:00 PM at The Hub
              </div>
            </li>
            <li>
              <span className="date">Apr 13</span>
              <div>
                <strong>SLOTAB Monthly Meeting</strong> — 6:00 PM, Cannon (Zoom available)
              </div>
            </li>
            <li>
              <span className="date">May 4</span>
              <div>
                <strong>Final SLOTAB Meeting of the Year</strong> — 6:00 PM
              </div>
            </li>
            <li>
              <span className="date">May 2026</span>
              <div>
                <strong>Physical Night</strong> — SLOTAB booth on site
              </div>
            </li>
          </ul>
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/upcoming" className="slotab-btn">
              See All Events
            </Link>
          </div>
        </div>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Watch the Tigers on Hudl</span>
            <h2>Live &amp; On-Demand Games</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              SLOHS streams home games from Holt Field and the Big Gym.
              Catch a game live or watch the replay.
            </p>
          </div>
          <HudlGrid limit={3} showFilters={false} />
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link href="/watch" className="slotab-btn">
              Open the Watch Tab
            </Link>
          </div>
        </div>
      </section>

      <PlatinumCarousel />

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Who We Are</span>
            <h2>Parents, Alumni &amp; Tigers for Life</h2>
          </div>
          <div className="slotab-prose" style={{ textAlign: "center" }}>
            <p>
              SLOTAB is a 501(c)(3) charitable organization of parents,
              guardians, grandparents, alumni, coaches, faculty, and community
              members. Proceeds from memberships, sponsorships, and fundraising
              events support the SLOHS Athletic Department in compliance with
              Title IX of the educational code.
            </p>
            <Link href="/about" className="slotab-btn">
              Learn More About SLOTAB
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
