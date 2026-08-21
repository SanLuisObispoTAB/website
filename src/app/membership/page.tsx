import Link from "next/link";
import MembershipTiers from "../components/MembershipTiers";
import SponsorWall from "../components/SponsorWall";
import { SPONSOR_SEASON } from "../data/sponsors";
import TigerPageHeader from "../components/tiger/TigerPageHeader";
import { SponsorshipMarker } from "../components/ConsentGate";

export default function MembershipPage() {

  return (
    <>
      <TigerPageHeader
        kicker="Support Tiger Athletics"
        title="Sponsors & Membership"
      />

      {/* Businesses arrive here on the Sponsorship lead's say-so, so their
          path comes before the general membership copy rather than after it. */}

      <section className="slotab-section alt" id="sponsorship-tiers">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">2026–2027</span>
            <h2>Memberships &amp; Sponsorships</h2>
            <p style={{ maxWidth: 720, margin: "1rem auto 0" }}>
              SLO Tiger Athletic Booster Club (SLOTAB) is a non-profit
              501(c)(3) supporting student-athletes at San Luis Obispo High
              School. We raise funds for uniforms, equipment, travel, and
              more. Open to parents, businesses, alumni, faculty, and
              friends — join at any level.
            </p>
          </div>
          <MembershipTiers />
        </div>
      </section>

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ maxWidth: 760, textAlign: "center" }}
        >
          <h2>Joining is donating.</h2>
          <p>
            Per the 2026 board decision, every donation enrolls you as a
            SLOTAB member. There&apos;s no separate signup form &mdash; pick
            an amount, designate a team (or the general fund), and your
            membership lands at the matching tier automatically.
          </p>
          <p style={{ color: "var(--tiger-graphite)" }}>
            <strong>Businesses &amp; individuals:</strong> the Sponsorship
            Tiers above (Champion, Gold, Silver, Tiger Pride, Varsity) layer
            game-day visibility and ad perks on top of your membership.
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            {/* Season comes from the sponsor data rather than being typed
                here — this line still read 2025–2026 for a fortnight after
                the wall itself had been rebuilt for 2026-27. */}
            <span className="slotab-kicker">
              {SPONSOR_SEASON.replace("-", "–")}
            </span>
            <h2>Business Sponsors</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              Thank you to all of our generous business sponsors. Your
              continued support of our Tiger athletes is greatly appreciated.
              This wall is built fresh each season and grows as businesses
              come on board — join them and your logo appears here.
            </p>
          </div>
          <SponsorshipMarker />
          <SponsorWall />
        </div>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">2026–2027</span>
            <h2>Thank You to Our Members</h2>
          </div>
          <div className="slotab-prose">
            <p style={{ textAlign: "center" }}>
              Thank you to all our SLOTAB members. Your contribution is greatly
              appreciated.
            </p>

            <div className="slotab-tier">
              <h3>Tiger Pride Membership</h3>
              <ul>
                <li>Fisher Family</li>
                <li>Renaissance Foundation</li>
                <li>Brian &amp; Anne Wallace</li>
              </ul>
            </div>

            <div className="slotab-tier">
              <h3>Alumni Membership · New</h3>
              <p style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                For former SLOHS Tigers who want to stay connected and
                support current Tiger athletes. Alumni Members are
                recognized at the annual Booster Bash and invited to the
                Hall of Fame induction ceremony.
              </p>
              <Link href="/hall-of-fame" className="slotab-btn dark">
                Learn More on the Hall of Fame Page
              </Link>
            </div>

            <div className="slotab-tier">
              <h3>Champion Membership</h3>
              <ul>
                <li>Tom &amp; Nicole Katona</li>
                <li>Jen Melton</li>
                <li>Lindsey Noland</li>
                <li>Marcy Rourke</li>
                <li>Joanna Whitcher</li>
                <li>Min Zhou</li>
              </ul>
            </div>

            <div className="slotab-tier">
              <h3>Coach Membership</h3>
              <ul>
                <li>Andrew &amp; Kira Abercromby</li>
                <li>Brandie Andrews</li>
                <li>Margaret Bodemer</li>
                <li>Loni Carbonella</li>
                <li>Grant de la Motte</li>
                <li>Yeung Family</li>
                <li>Daniel Gomes</li>
                <li>Brian &amp; Jerusha Greenwood</li>
                <li>Carrie Hartford</li>
                <li>Matt &amp; Beth Henard</li>
                <li>Johnson Family</li>
                <li>Arya Jones</li>
                <li>Derek Kasel</li>
                <li>Kim Kaufman</li>
                <li>Trevor Keith</li>
                <li>Mike &amp; Heather Kirschner</li>
                <li>John Oliver</li>
                <li>Thomas Ortiz</li>
                <li>Martinez Pezua</li>
                <li>Timothy Romano</li>
                <li>Lori Shields</li>
                <li>Amy Sullivan</li>
                <li>Bryan Sullivan</li>
                <li>Morgan Torell</li>
                <li>Libby Waterbury</li>
                <li>Kendra Williams</li>
                <li>James Willimek</li>
                <li>Matthew Woods</li>
                <li>Mary Youngs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
