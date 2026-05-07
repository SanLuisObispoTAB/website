import Link from "next/link";
import BecomeASponsor from "../components/BecomeASponsor";
import ProposedTiers from "../components/ProposedTiers";
import SponsorWall from "../components/SponsorWall";
import TigerPageHeader from "../components/tiger/TigerPageHeader";

export default function MembershipPage() {
  return (
    <>
      <TigerPageHeader
        kicker="Support Tiger Athletics"
        title="Sponsors & Membership"
      />

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Draft for 2026-05-11 Board Demo</span>
            <h2>Proposed Membership Tiers</h2>
            <p style={{ maxWidth: 720, margin: "1rem auto 0" }}>
              The board asked for a simpler structure where every donor is
              automatically a member. This is a 5-tier draft drawn from
              comparable HS, college, and arts non-profit ladders. Naming
              and benefits are open for discussion.
            </p>
          </div>
          <ProposedTiers />
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
            <strong>Businesses:</strong> see the Business Sponsors section
            below for Platinum / Gold / Silver / Bronze tiers, or contact
            the Membership VP for the printed sponsor sheet.
          </p>
          <p
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
              flexWrap: "wrap",
              marginTop: "1.5rem",
            }}
          >
            <Link
              href="/donate"
              className="tiger-btn tiger-btn-primary tiger-btn-arrow"
            >
              Donate &amp; Become a Member
            </Link>
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">2025–2026</span>
            <h2>Business Sponsors</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              Thank you to all of our generous business sponsors. Your
              continued support of our Tiger athletes is greatly appreciated.
            </p>
          </div>
          <BecomeASponsor />
          <SponsorWall />
        </div>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">2025–2026</span>
            <h2>General Memberships</h2>
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
