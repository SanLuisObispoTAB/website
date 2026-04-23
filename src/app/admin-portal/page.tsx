import Link from "next/link";
import PageHeader from "../components/PageHeader";
import directory from "../data/springly-directory.json";

type Member = {
  id: string;
  name: string;
  tier: string;
  email: string;
  joined: string;
  status: string;
};
type Sponsor = {
  id: string;
  name: string;
  tier: string;
  contact: string;
  renewsOn: string;
  status: string;
};

export const metadata = {
  title: "Member & Sponsor Portal — SLOTAB",
  robots: { index: false, follow: false },
};

const MEMBERS = directory.members as Member[];
const SPONSORS = directory.sponsors as Sponsor[];

export default function AdminPortalPage() {
  return (
    <>
      <PageHeader kicker="Board Admin" title="Member & Sponsor Portal" />

      <section className="slotab-section">
        <div className="slotab-container">
          {/* Stub banner */}
          <div
            style={{
              background: "#fff8d1",
              border: "2px dashed var(--slotab-gold)",
              padding: "1rem 1.25rem",
              marginBottom: "2rem",
              fontSize: "0.95rem",
            }}
          >
            <strong>Stub mode — Springly not connected yet.</strong>
            <br />
            This page shows placeholder data so the board can review the
            layout. Once <code>SPRINGLY_API_BASE</code> and{" "}
            <code>SPRINGLY_API_KEY</code> environment variables are
            configured on Vercel, the tables below populate from live
            Springly contact records and the "Add new" buttons create real
            entries via the two-way API. In production this page will also
            be protected behind a board-member login.
          </div>

          {/* Members table */}
          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <span className="slotab-kicker">{MEMBERS.length} members</span>
            <h2>General Memberships</h2>
          </div>
          <div
            className="slotab-btn-row"
            style={{ justifyContent: "flex-end", marginBottom: "0.75rem" }}
          >
            <Link
              href="/membership#join"
              className="slotab-btn"
            >
              + Add New Member
            </Link>
          </div>
          <div className="slotab-portal-table-wrap">
            <table className="slotab-portal-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Tier</th>
                  <th>Email</th>
                  <th>Joined</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {MEMBERS.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>
                      <span className="slotab-portal-chip">{m.tier}</span>
                    </td>
                    <td>
                      <a href={`mailto:${m.email}`}>{m.email}</a>
                    </td>
                    <td>{m.joined}</td>
                    <td>
                      <span
                        className={`slotab-portal-status ${m.status}`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sponsors table */}
          <div
            className="slotab-section-title"
            style={{ textAlign: "left", marginTop: "3rem" }}
          >
            <span className="slotab-kicker">
              {SPONSORS.length} business sponsors
            </span>
            <h2>Sponsors</h2>
          </div>
          <div
            className="slotab-btn-row"
            style={{ justifyContent: "flex-end", marginBottom: "0.75rem" }}
          >
            <Link
              href="/membership#sponsor"
              className="slotab-btn"
            >
              + Add New Sponsor
            </Link>
          </div>
          <div className="slotab-portal-table-wrap">
            <table className="slotab-portal-table">
              <thead>
                <tr>
                  <th>Business</th>
                  <th>Tier</th>
                  <th>Primary Contact</th>
                  <th>Renews</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {SPONSORS.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>
                      <span
                        className={`slotab-portal-chip tier-${s.tier.toLowerCase()}`}
                      >
                        {s.tier}
                      </span>
                    </td>
                    <td>
                      <a href={`mailto:${s.contact}`}>{s.contact}</a>
                    </td>
                    <td>{s.renewsOn}</td>
                    <td>
                      <span
                        className={`slotab-portal-status ${s.status}`}
                      >
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
