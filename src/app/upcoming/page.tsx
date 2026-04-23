import EventsList from "../components/EventsList";
import PageHeader from "../components/PageHeader";

export default function UpcomingPage() {
  return (
    <>
      <PageHeader
        kicker="Mark Your Calendar"
        title="Upcoming Events"
      />
      <section className="slotab-section">
        <div className="slotab-container">
          <div
            className="slotab-prose"
            style={{ textAlign: "center", marginBottom: "2.5rem" }}
          >
            <p style={{ margin: 0 }}>
              All SLOHS varsity games and SLOTAB events for the current month
              and beyond. Use the filters below to turn each sport and the
              booster events on or off. Schedules are sourced from MaxPreps.
            </p>
          </div>
          <EventsList />
        </div>
      </section>
    </>
  );
}
