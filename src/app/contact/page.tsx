import PageHeader from "../components/PageHeader";
import boardData from "../data/board.json";

type BoardMember = {
  role: string;
  name: string;
  email?: string;
};

const YEAR: string = boardData.year;
const BOARD = boardData.members as BoardMember[];

export default function ContactPage() {
  return (
    <>
      <PageHeader kicker="Get in Touch" title="Contact SLOTAB" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <h2>{YEAR} Board Members</h2>
          <ul className="slotab-board">
            {BOARD.map((m) => (
              <li key={m.role}>
                <span>
                  <span className="role">{m.role}:</span> {m.name}
                </span>
                {m.email && (
                  <a href={`mailto:${m.email}`}>{m.email}</a>
                )}
              </li>
            ))}
          </ul>

          <h2 style={{ marginTop: "3rem" }}>Send Us a Message</h2>
          <p>
            Have a question about membership, sponsorship, volunteering, or
            an upcoming event? Email us at{" "}
            <a href="mailto:slotabpres@gmail.com">slotabpres@gmail.com</a>{" "}
            and we&apos;ll route your message to the right board member.
          </p>
        </div>
      </section>
    </>
  );
}
