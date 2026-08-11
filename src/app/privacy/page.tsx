import PageHeader from "../components/PageHeader";
import ConsentControls from "../components/ConsentControls";

export const metadata = {
  title: "Privacy & Cookies — SLOTAB",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHeader kicker="Plain English" title="Privacy &amp; Cookies" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <p style={{ fontSize: "1.15rem" }}>
            SLOTAB is a volunteer-run 501(c)(3) supporting SLOHS
            student-athletes. We collect as little as we can get away with,
            and we don&apos;t sell or share any of it.
          </p>

          <h2>What we store</h2>
          <p>
            If you click <strong>Accept</strong> on the cookie banner, we
            store two small cookies on your own device:
          </p>
          <ul>
            <li>
              <strong>Your choice</strong> — so we stop asking. This one is
              set whether you accept or decline.
            </li>
            <li>
              <strong>A visit record</strong> — how many times you&apos;ve
              visited, the date of your first visit, and which of four
              sections you&apos;ve reached: Membership, Sponsorship, Donate,
              and Volunteer.
            </li>
          </ul>
          <p>
            That&apos;s the whole list. It tells the board which parts of the
            site are actually helping families, so we spend our (volunteer)
            time on the right things.
          </p>

          <h2>What we don&apos;t do</h2>
          <ul>
            <li>No advertising cookies, and no ad networks.</li>
            <li>
              No third-party trackers following you to other websites.
            </li>
            <li>
              No names, emails, or anything that identifies you personally.
            </li>
            <li>We never sell or share any of it.</li>
          </ul>

          <h2>Page analytics</h2>
          <p>
            With your consent we also use Vercel Web Analytics, which counts
            page views and reports them to us in aggregate. It doesn&apos;t
            use advertising identifiers and doesn&apos;t track you across
            other sites.
          </p>

          <h2>Children</h2>
          <p>
            This site is written for parents, alumni, and community
            supporters. We don&apos;t knowingly collect information from
            children, and nothing we store identifies an individual.
          </p>

          <h2>Changing your mind</h2>
          <p>
            You can change your answer at any time. Declining also deletes
            the visit record we&apos;d already stored.
          </p>
          <ConsentControls />

          <h2>Questions</h2>
          <p>
            Email{" "}
            <a href="mailto:slotabpres@gmail.com">slotabpres@gmail.com</a>{" "}
            and we&apos;ll route it to the right board member.
          </p>
        </div>
      </section>
    </>
  );
}
