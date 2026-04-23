import PageHeader from "../components/PageHeader";

const MEETINGS = [
  "August 4, 2025 — First meeting of the year",
  "September 8, 2025",
  "October 6, 2025",
  "November 3, 2025",
  "December 8, 2025",
  "January 12, 2026",
  "February 2, 2026",
  "March 9, 2026",
  "April 13, 2026",
  "May 4, 2026 — Last meeting",
];

export default function VolunteerPage() {
  return (
    <>
      <PageHeader kicker="Get Involved" title="Volunteer" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <p>
            Would you like to get more involved with supporting SLOHS
            athletics? There are many ways to help — from attending a monthly
            board meeting to working a shift at the concession stand.
          </p>

          <h2>Monthly Meetings</h2>
          <p>
            SLOTAB holds monthly meetings, typically on the first Monday of
            each month at 6:00 PM (unless that date falls on a school
            holiday), at Cannon, 1050 Southwood Drive. A Zoom option is
            available. All are welcome to attend.
          </p>
          <ul>
            {MEETINGS.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>

          <h2>Volunteer Opportunities</h2>
          <ul>
            <li>
              <strong>August 7, 2025 — Welcome Back Day:</strong> SLOTAB table
              from 8:00 AM to 4:00 PM. Volunteers needed.
            </li>
            <li>
              <strong>October 4, 2025 — Booster Bash:</strong> Volunteers
              welcome, silent/live auction items welcome, setup/cleanup help
              needed.
            </li>
            <li>
              <strong>Ongoing:</strong> We are in continued need of volunteers
              for concession stands, gate ticketing, and the apparel booth.
            </li>
          </ul>

          <h2>Team Liaisons</h2>
          <p>
            Each sports team (Varsity &amp; JV) has 1–2 team liaisons. Duties
            include:
          </p>
          <ul>
            <li>
              Help assist with communication between the head coach, SLOTAB,
              and other parents on the team
            </li>
            <li>Assist the head coach with fundraising opportunities</li>
            <li>Coordinate the team Booster Bash auction basket in the Fall</li>
            <li>Encourage parents to become SLOTAB members</li>
            <li>
              Volunteer on behalf of SLOTAB at school events (Welcome Day,
              Back to School Night, etc.)
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
