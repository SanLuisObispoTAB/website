import Link from "next/link";
import JoinForm from "../components/JoinForm";
import PageHeader from "../components/PageHeader";
import SponsorWall from "../components/SponsorWall";

export default function MembershipPage() {
  return (
    <>
      <PageHeader
        kicker="Support Tiger Athletics"
        title="Sponsors & Membership"
      />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <h2>What is a SLOTAB Membership?</h2>
          <p>
            Family and friends of SLOHS athletes looking to support SLO
            Athletics can do so by joining SLOTAB. All proceeds raised from
            memberships go into SLOTAB&apos;s general fund. You may also join at
            a sponsorship level and sponsor specific team(s) at SLOHS.
          </p>
          <p>
            The athletic director and coaches work together with SLOTAB to
            ensure that each program&apos;s needs are met. Memberships support
            coaches with equipment, travel expenses, tournament fees, sports
            facility improvements and much more.
          </p>

          <div id="join" style={{ maxWidth: 720, margin: "2rem auto 1rem" }}>
            <h2 style={{ textAlign: "center" }}>Join Online</h2>
            <p style={{ textAlign: "center", color: "var(--slotab-muted)" }}>
              Submissions create a contact record in Springly (when connected)
              and email the membership chair.
            </p>
            <JoinForm />
          </div>

          <h2>How to Join</h2>
          <p>
            <strong>Individuals:</strong> Download and return the SLOTAB
            General Membership form, or join online at the link above.
          </p>
          <p>
            <strong>Businesses:</strong> Request the SLOTAB Business Sponsorship
            form for tier details and benefits.
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
