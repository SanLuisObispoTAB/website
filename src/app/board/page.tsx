import Link from "next/link";
import PageHeader from "../components/PageHeader";
import boardData from "../data/board.json";
import handoffData from "../data/board-handoff.json";

type Handoff = {
  id: string;
  year: string;
  role: string;
  role_slug: string;
  incumbent: string;
  completed_date?: string;
};

type RosterMember = { role: string; name: string; email?: string };

export const metadata = {
  title: "Board Hub — SLOTAB",
  robots: { index: false, follow: false },
};

function slugifyRole(role: string): string {
  return role
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/—/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Link to the Decap CMS admin in a new tab. We intentionally do NOT deep-link
// to /admin/#/collections/board_handoff/entries/board_handoff: that hash
// fragment races with Decap's OAuth init (popup-based, postMessage between
// popup and parent), and the parent's deep-link state can swallow the auth
// response — the login pop ups hang. Linking to plain /admin lets Decap
// initialize cleanly; the board member clicks "Board Handoff Notes" in
// the Decap sidebar after login.
const ADMIN_URL = "/admin";

export default function BoardHubPage() {
  const roster = (boardData.members as RosterMember[]) ?? [];
  const handoffs = (handoffData.handoffs as Handoff[]) ?? [];

  // Group handoffs by role_slug for quick lookup.
  const handoffsByRole = new Map<string, Handoff[]>();
  for (const h of handoffs) {
    const list = handoffsByRole.get(h.role_slug) || [];
    list.push(h);
    handoffsByRole.set(h.role_slug, list);
  }

  return (
    <>
      <PageHeader kicker="Board Only · 2025-26" title="Board Hub" />
      <section className="slotab-section">
        <div className="slotab-container">
          <div
            style={{
              background: "#fff8d1",
              border: "2px dashed var(--slotab-gold)",
              padding: "1rem 1.25rem",
              marginBottom: "1.5rem",
              fontSize: "0.95rem",
            }}
          >
            <strong>Organizational memory for SLOTAB&apos;s Board.</strong>
            <br />
            Every officer fills a structured handoff note at the end of
            their term. The new officer reads last year&apos;s before Day
            1.
            <br />
            <br />
            <strong style={{ color: "#9b2818" }}>
              ⚠ Never paste passwords, account numbers, donor lists, or
              other secrets here.
            </strong>{" "}
            This site is built from a public GitHub repo. Describe where
            secrets <em>live</em> (e.g. &ldquo;1Password vault, owner
            Trina&rdquo;) — not what they are.
          </div>

          {/* Big, unmissable CTA for outgoing officers. Opens /admin in a
              new tab; after GitHub login, click "Board Handoff Notes" in
              the Decap sidebar. */}
          <a
            href={ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="slotab-btn"
            style={{
              display: "block",
              textAlign: "center",
              padding: "1.1rem 1.5rem",
              fontSize: "1.05rem",
              marginBottom: "0.5rem",
            }}
          >
            ✎ Outgoing officer? Start your handoff →
          </a>
          <p
            style={{
              textAlign: "center",
              fontSize: "0.85rem",
              color: "#666",
              marginBottom: "2.5rem",
            }}
          >
            Opens the admin in a new tab. After GitHub login, click{" "}
            <em>Board Handoff Notes</em> in the sidebar.
          </p>

          <div
            className="slotab-section-title"
            style={{ textAlign: "left" }}
          >
            <span className="slotab-kicker">
              {roster.length} roles · {handoffs.length} handoff{" "}
              {handoffs.length === 1 ? "note" : "notes"}
            </span>
            <h2>Roles &amp; Handoff Notes</h2>
          </div>

          <div className="slotab-portal-table-wrap">
            <table className="slotab-portal-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Current officer (2025-26)</th>
                  <th>Handoff notes</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((m) => {
                  const slug = slugifyRole(m.role);
                  const notes = handoffsByRole.get(slug) || [];
                  return (
                    <tr key={slug}>
                      <td>
                        <strong>{m.role}</strong>
                      </td>
                      <td>{m.name}</td>
                      <td>
                        {notes.length > 0 ? (
                          <Link href={`/board/${slug}`}>
                            {notes.length} note
                            {notes.length === 1 ? "" : "s"} →
                          </Link>
                        ) : (
                          <span style={{ color: "#999" }}>
                            none yet ·{" "}
                            <a
                              href={ADMIN_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              add note →
                            </a>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className="slotab-btn-row"
            style={{
              justifyContent: "flex-end",
              marginTop: "2rem",
            }}
          >
            <form action="/api/board/logout" method="post">
              <button type="submit" className="slotab-btn outline">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
