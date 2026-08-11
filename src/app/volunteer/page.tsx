import Link from "next/link";
import PageHeader from "../components/PageHeader";
import slotabEvents from "../data/slotab-events.json";

// Meeting dates come from the same CMS-editable file that feeds /upcoming and
// the home calendar, so the board maintains them in one place. This replaced a
// hardcoded 2025-26 list that went stale the moment the year turned over.
type RawEvent = {
  id: string;
  title: string;
  date: string;
  categoryLabel: string;
  detail?: string;
  /** Short annotation for a meeting that breaks the usual cadence — e.g.
   *  September, which moves a week because the first Monday is Labor Day. */
  note?: string;
};
const MEETING_FMT = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});
// Home football game dates needing volunteers, from the board 2026-08-11.
// Kept here rather than in slotab-events.json on purpose: the games themselves
// arrive on the calendar from the SLOHS weekly sheet, and adding them again
// would double-list every Friday night.
const FOOTBALL_VOLUNTEER_DATES = [
  "2026-08-21",
  "2026-08-28",
  "2026-09-11",
  "2026-10-02",
  "2026-10-09",
  "2026-10-30",
];
const GAME_FMT = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});
const HOME_GAMES = FOOTBALL_VOLUNTEER_DATES.map((d) =>
  GAME_FMT.format(new Date(`${d}T00:00:00Z`)),
);

// Meetings already held are dimmed rather than dropped — the list doubles as
// the year's schedule, so a parent should still see the full cadence.
const TODAY_MIDNIGHT = new Date();
TODAY_MIDNIGHT.setHours(0, 0, 0, 0);

const MEETINGS = (slotabEvents.events as RawEvent[])
  .filter((e) => /meeting/i.test(e.categoryLabel))
  .sort((a, b) => a.date.localeCompare(b.date))
  .map((e) => {
    const label = MEETING_FMT.format(new Date(e.date));
    const base = /monthly slotab meeting/i.test(e.title)
      ? label
      : `${label} — ${e.title}`;
    return {
      text: e.note ? `${base} — ${e.note}` : base,
      past: new Date(e.date) < TODAY_MIDNIGHT,
    };
  });

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
          {MEETINGS.length > 0 ? (
            <ul>
              {MEETINGS.map((m) => (
                <li key={m.text} className={m.past ? "slotab-meeting-past" : undefined}>
                  {m.text}
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: "var(--slotab-muted)" }}>
              The 2026-27 meeting dates are being set and will be listed here
              and on the{" "}
              <Link href="/upcoming">events calendar</Link> once confirmed.
            </p>
          )}

          <h2>Volunteer Opportunities</h2>
          <ul>
            <li>
              <strong>Back to School Day — Thursday, August 13:</strong> SLOTAB
              staffs the merch table all day.{" "}
              <Link href="/back-to-school">Grab a shift →</Link>
            </li>
            <li>
              <strong>Home football games:</strong> we need volunteers at every
              home game this fall — concessions, gate, and the apparel booth.
              <ul>
                {HOME_GAMES.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </li>
            <li>
              <strong>Booster Bash — Saturday, October 10:</strong> Our largest
              fundraiser of the year, at the Octagon Barn. Volunteers welcome,
              silent/live auction items welcome, and setup/cleanup help is
              always needed. <Link href="/booster-bash">Event details →</Link>
            </li>
            <li>
              <strong>Ongoing:</strong> We are in continued need of volunteers
              for concession stands, gate ticketing, and the apparel booth.
            </li>
          </ul>
          <p>
            Dates for each are posted on the{" "}
            <Link href="/upcoming">events calendar</Link> as they&apos;re
            confirmed.
          </p>

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
