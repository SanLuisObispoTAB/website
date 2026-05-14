import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "../../components/PageHeader";
import boardData from "../../data/board.json";
import handoffData from "../../data/board-handoff.json";

type Handoff = {
  id: string;
  year: string;
  role: string;
  role_slug: string;
  incumbent: string;
  successor?: string;
  completed_date?: string;
  what_worked?: string;
  what_broke?: string;
  who_to_call?: string;
  punted_decisions?: string;
  vendor_relationships?: string;
  passwords_vault_pointer?: string;
  calendar_landmarks?: string;
  open_todos?: string;
  anything_else?: string;
};

type RosterMember = { role: string; name: string; email?: string };

function slugifyRole(role: string): string {
  return role
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/—/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// See src/app/board/page.tsx for the rationale on /admin (no hash
// deep-link) in a new tab.
const ADMIN_URL = "/admin";

export const metadata = {
  title: "Board Handoff — SLOTAB",
  robots: { index: false, follow: false },
};

const PROMPTS: { key: keyof Handoff; label: string; hint: string }[] = [
  {
    key: "what_worked",
    label: "What worked this year",
    hint: "3-5 bullets the next officer should keep doing.",
  },
  {
    key: "what_broke",
    label: "What broke / what I'd do differently",
    hint: "Be specific. This is the most-read section.",
  },
  {
    key: "who_to_call",
    label: "Who to call first when something breaks",
    hint: "Names + best contact method. Personality notes welcome.",
  },
  {
    key: "punted_decisions",
    label: "Decisions I punted to next year",
    hint: "What got deferred, and why.",
  },
  {
    key: "vendor_relationships",
    label: "Vendor relationships",
    hint: "Who's friendly, who needs handling, who to email vs. call.",
  },
  {
    key: "passwords_vault_pointer",
    label: "Where the logins live (NOT the logins)",
    hint: "Point at the vault. Never paste passwords here.",
  },
  {
    key: "calendar_landmarks",
    label: "Calendar landmarks that snuck up on me",
    hint: "Dates the next officer needs to know about NOW.",
  },
  {
    key: "open_todos",
    label: "Open TODOs at handover",
    hint: "What's unfinished. Day 1 reading.",
  },
  {
    key: "anything_else",
    label: "Anything else the next officer needs",
    hint: "History, tribal knowledge, anything that doesn't fit above.",
  },
];

export default async function BoardRolePage(props: {
  params: Promise<{ role: string }>;
}) {
  const { role: roleSlug } = await props.params;

  const roster = (boardData.members as RosterMember[]) ?? [];
  const handoffs = (handoffData.handoffs as Handoff[]) ?? [];

  const rosterEntry = roster.find((m) => slugifyRole(m.role) === roleSlug);
  const roleNotes = handoffs
    .filter((h) => h.role_slug === roleSlug)
    .sort((a, b) => (a.year < b.year ? 1 : -1));

  if (!rosterEntry && roleNotes.length === 0) {
    notFound();
  }

  const roleName = rosterEntry?.role || roleNotes[0]?.role || roleSlug;

  return (
    <>
      <PageHeader kicker="Board Handoff" title={roleName} />
      <section className="slotab-section">
        <div className="slotab-container">
          <p style={{ marginBottom: "1.5rem" }}>
            <Link href="/board">← All roles</Link>
            {rosterEntry && (
              <>
                {" · "}
                <span>
                  Current officer (2025-26):{" "}
                  <strong>{rosterEntry.name}</strong>
                </span>
              </>
            )}
          </p>

          {roleNotes.length === 0 ? (
            <div
              style={{
                background: "#f7f6f1",
                border: "1px solid #d8d3c4",
                padding: "1.5rem",
                borderRadius: 4,
              }}
            >
              <p style={{ marginBottom: "1.25rem" }}>
                No handoff notes for this role yet. The outgoing officer
                writes the first one.
              </p>
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-btn"
              >
                ✎ Start a handoff note →
              </a>
              <p
                style={{
                  marginTop: "0.75rem",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Opens the admin in a new tab. After GitHub login,
                click <em>Board Handoff Notes</em> in the sidebar.
              </p>
            </div>
          ) : (
            roleNotes.map((note) => (
              <article
                key={note.id}
                style={{
                  border: "1px solid #d8d3c4",
                  background: "#fbfaf6",
                  padding: "1.5rem 1.75rem",
                  marginBottom: "2rem",
                  borderRadius: 4,
                }}
              >
                <header
                  style={{
                    borderBottom: "2px solid var(--slotab-gold)",
                    paddingBottom: "0.75rem",
                    marginBottom: "1.25rem",
                  }}
                >
                  <div className="slotab-kicker">{note.year}</div>
                  <h2 style={{ margin: "0.25rem 0 0.25rem" }}>
                    {note.incumbent}
                    {note.successor && note.successor !== "—" && (
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 400,
                          color: "#555",
                        }}
                      >
                        {" "}
                        → {note.successor}
                      </span>
                    )}
                  </h2>
                  {note.completed_date && (
                    <div style={{ fontSize: "0.85rem", color: "#666" }}>
                      Completed {note.completed_date}
                    </div>
                  )}
                </header>

                <dl style={{ margin: 0 }}>
                  {PROMPTS.map((p) => {
                    const value = (note[p.key] as string | undefined) || "";
                    if (!value.trim()) return null;
                    return (
                      <div
                        key={p.key}
                        style={{ marginBottom: "1.25rem" }}
                      >
                        <dt
                          style={{
                            fontWeight: 700,
                            marginBottom: "0.35rem",
                          }}
                        >
                          {p.label}
                        </dt>
                        <dd
                          style={{
                            margin: 0,
                            whiteSpace: "pre-wrap",
                            color: "#222",
                          }}
                        >
                          {value}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </article>
            ))
          )}

          {roleNotes.length > 0 && (
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1.5rem",
                borderTop: "1px solid #d8d3c4",
              }}
            >
              <a
                href={ADMIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="slotab-btn outline"
              >
                ✎ Add a new handoff note for this role →
              </a>
              <p
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.85rem",
                  color: "#666",
                }}
              >
                Opens admin in a new tab. After GitHub login, click{" "}
                <em>Board Handoff Notes</em> in the sidebar.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
