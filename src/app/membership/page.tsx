import Link from "next/link";
import MembershipTiers from "../components/MembershipTiers";
import SponsorWall from "../components/SponsorWall";
import { SPONSOR_SEASON } from "../data/sponsors";
import { DONOR_WALL } from "../data/donors";
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
          <div className="slotab-section-title" id="members">
            <span className="slotab-kicker">{DONOR_WALL.season.replace("-", "–")}</span>
            <h2>Thank You to Our Members</h2>
          </div>
          <div className="slotab-prose">
            <p style={{ textAlign: "center" }}>
              Thank you to all our SLOTAB members. Your contribution is greatly
              appreciated.
            </p>

            {DONOR_WALL.tiers.map((tier) => (
              <div className="slotab-tier" key={tier.tier}>
                <h3>{tier.tier}</h3>
                {tier.note && (
                  <p style={{ fontSize: "0.95rem", marginBottom: "0.75rem" }}>
                    {tier.note}
                  </p>
                )}
                {tier.link && (
                  <Link href={tier.link.href} className="slotab-btn dark">
                    {tier.link.label}
                  </Link>
                )}
                {tier.donors.length > 0 && (
                  <ul>
                    {tier.donors.map((d) => (
                      <li key={d.name}>{d.name}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
