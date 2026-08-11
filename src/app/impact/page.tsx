import Link from "next/link";
import ImpactLedger from "../components/ImpactLedger";
import PageHeader from "../components/PageHeader";
import impactData from "../data/impact.json";

export const metadata = {
  title: "Impact — SLOTAB",
};

export default function ImpactPage() {
  return (
    <>
      <PageHeader
        kicker="Where Your Dollars Go"
        title="SLOTAB Impact"
      />

      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center" }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            Every dollar donated to SLOTAB goes directly back to SLOHS
            student-athletes — equipment, facility improvements, team
            travel, uniforms, and the sport-specific t-shirt every athlete
            receives. In the {impactData.fiscalYear} school year that came
            to{" "}
            <strong>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: impactData.currency,
                maximumFractionDigits: 0,
              }).format(impactData.summary.total)}
            </strong>{" "}
            across {impactData.summary.programsSupported} programs. Here is
            where it went.
          </p>
          <p style={{ fontSize: "0.95rem", color: "var(--slotab-muted)" }}>
            <em>
              75% of a designated donation goes to the team you name — the
              figure your coach sees in their account. The remaining 25% is the
              SLOTAB general fund, which pays for the things every team uses:
              Hudl streaming, senior banners, and the sport-specific shirt
              every athlete gets.
            </em>
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <ImpactLedger />
        </div>
      </section>

      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Keep It Going</span>
            <h2>Support the Next Purchase</h2>
          </div>
          <div
            className="slotab-prose"
            style={{ textAlign: "center", maxWidth: 680 }}
          >
            <p>
              None of this happens without members, sponsors, and
              volunteers. Every membership tier, sponsorship level, and
              Booster Bash ticket goes directly into funding the next
              team request.
            </p>
            <div
              className="slotab-btn-row"
              style={{ justifyContent: "center", marginTop: "1.5rem" }}
            >
              <Link href="/membership" className="slotab-btn">
                Become a Member
              </Link>
              <Link
                href="/membership"
                className="slotab-btn outline"
                style={{ borderColor: "var(--slotab-black)", color: "var(--slotab-black)" }}
              >
                Business Sponsorship
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
