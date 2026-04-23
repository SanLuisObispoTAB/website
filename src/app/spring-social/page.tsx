import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";

export default function SpringSocialPage() {
  return (
    <>
      <PageHeader kicker="Annual Event" title="Spring Social" />
      <section className="slotab-section">
        <div className="slotab-container">
          <div className="slotab-flyer">
            <Image
              src="/booster-bash/flyer.jpg"
              alt="Retro Tiger flyer — SLOTAB Spring Social"
              width={1200}
              height={1500}
              priority
            />
          </div>

          <div
            className="slotab-card dark"
            style={{ maxWidth: 640, margin: "0 auto", textAlign: "center" }}
          >
            <h3 style={{ fontSize: "1.5rem" }}>Thursday, April 9</h3>
            <p style={{ fontSize: "1.1rem", margin: "0.5rem 0 1rem" }}>
              5:30 – 8:00 PM
            </p>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.25rem" }}>
              <strong>The Hub</strong>
            </p>
            <p style={{ marginBottom: "1.5rem" }}>
              1701 Monterey Street, San Luis Obispo
            </p>
            <Link href="#" className="slotab-btn">
              RSVP
            </Link>
          </div>

          <div className="slotab-prose" style={{ marginTop: "3rem" }}>
            <h2>Join Us</h2>
            <p>
              Come celebrate another great year of Tiger athletics at the
              SLOTAB Spring Social. Connect with fellow parents, coaches, and
              supporters, and help us look forward to next season.
            </p>
            <p>
              Interested in contributing an auction item or sponsoring the
              event? Contact us on the{" "}
              <Link href="/contact">contact page</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
