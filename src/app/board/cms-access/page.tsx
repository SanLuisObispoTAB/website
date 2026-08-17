import Link from "next/link";
import PageHeader from "../../components/PageHeader";

export const metadata = {
  title: "CMS Access — Board Hub — SLOTAB",
  robots: { index: false, follow: false },
};

const REPO_COLLABORATORS_URL =
  "https://github.com/SanLuisObispoTAB/website/settings/access";
const ORG_PEOPLE_URL = "https://github.com/orgs/SanLuisObispoTAB/people";
const EDITOR_ONBOARDING_RAW_URL =
  "https://github.com/SanLuisObispoTAB/website/blob/main/docs/editor-onboarding.md";

export default function CmsAccessPage() {
  return (
    <>
      <PageHeader
        kicker="Board Only · Operations"
        title="Editor access to the CMS"
      />
      <section className="slotab-section">
        <div className="slotab-container">
          <p style={{ marginBottom: "0.5rem" }}>
            <Link href="/board">← Back to Board Hub</Link>
          </p>

          <div
            style={{
              background: "#fff8d1",
              border: "2px dashed var(--slotab-gold)",
              padding: "1rem 1.25rem",
              marginBottom: "1.75rem",
              fontSize: "0.95rem",
            }}
          >
            <strong>One-line summary.</strong> Editor access ={" "}
            <strong>Write access on the GitHub repo</strong>. The CMS at{" "}
            <code>/admin</code> uses GitHub OAuth to sign people in, so
            adding/removing editors is a GitHub collaborator action — not a
            separate CMS account.
          </div>

          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <h2>For the Chair: inviting a new editor</h2>
          </div>

          <ol style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
            <li>
              Ask the new board member for their <strong>GitHub username</strong>
              {" "}
              (or the email they want the invite sent to). If they don&apos;t
              have a GitHub account yet, that&apos;s fine — see the next
              section.
            </li>
            <li>
              Go to{" "}
              <a
                href={REPO_COLLABORATORS_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Settings → Collaborators
              </a>
              {" "}on the repo. Click <strong>Add people</strong>.
            </li>
            <li>
              Enter the username/email. Pick role <strong>Write</strong>{" "}
              (Read can&apos;t commit; Maintain/Admin is more than they
              need). Send.
            </li>
            <li>
              Email the new editor with: (a) a heads-up that a GitHub
              invitation is coming, (b) a link to{" "}
              <a
                href={EDITOR_ONBOARDING_RAW_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                editor-onboarding.md
              </a>
              {" "}for the non-technical walkthrough, and (c) the Board Hub
              password if they don&apos;t already have it.
            </li>
            <li>
              GitHub invites expire in <strong>7 days</strong>. If the new
              member misses the window, re-invite from the same page.
            </li>
          </ol>

          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <h2>For a new editor who has never used GitHub</h2>
          </div>

          <p>
            The full visual walkthrough lives at{" "}
            <a
              href={EDITOR_ONBOARDING_RAW_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              editor-onboarding.md
            </a>
            {" "}— send them that link. TL;DR of what they&apos;ll do:
          </p>
          <ol style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
            <li>
              Receive an email from <code>notifications@github.com</code> with
              subject{" "}
              <em>
                [GitHub] @eramberg has invited you to
                SanLuisObispoTAB/website
              </em>
              . The invite comes from the person who sent it, not from the
              org — this wording matches <code>editor-onboarding.md</code>,
              which is what the new editor will be reading.
            </li>
            <li>
              Click <strong>Accept invitation</strong>. If they don&apos;t
              have a GitHub account, the link routes through sign-up first —
              they pick a username (visible in commit history; sensible
              choice = name or initials).
            </li>
            <li>
              Go to{" "}
              <a
                href="https://slo-tab-website.vercel.app/admin/"
                target="_blank"
                rel="noopener noreferrer"
              >
                /admin
              </a>
              {" "}→ <strong>Login with GitHub</strong> → authorize the
              SLOTAB Decap CMS app (one-time).
            </li>
            <li>
              They land in the Decap UI. Save creates a draft; Publish now
              triggers a Vercel redeploy (~60s) and the change is live.
            </li>
          </ol>

          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <h2>Two URLs to know</h2>
          </div>

          <ul style={{ marginBottom: "2rem", lineHeight: 1.7 }}>
            <li>
              <a
                href="https://slo-tab-website.vercel.app/admin/"
                target="_blank"
                rel="noopener noreferrer"
              >
                slo-tab-website.vercel.app/admin/
              </a>
              {" "}— the canonical admin URL.
            </li>
            <li>
              <a
                href="https://slotab.ravens-peak-consulting.com/admin/"
                target="_blank"
                rel="noopener noreferrer"
              >
                slotab.ravens-peak-consulting.com/admin/
              </a>
              {" "}— firewall-friendly CNAME alias of the same deployment.
              Use this one when on the SLOHS district network (which blocks{" "}
              <code>*.vercel.app</code>).
            </li>
          </ul>

          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <h2>Removing access (outgoing officers)</h2>
          </div>

          <p style={{ marginBottom: "2rem" }}>
            When an officer rolls off the board, remove them as a
            collaborator on the{" "}
            <a
              href={REPO_COLLABORATORS_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              repo access page
            </a>
            . Their old commits stay attributed (that&apos;s the audit
            trail), but they can no longer sign in to <code>/admin</code>{" "}
            or commit. The Board Hub itself is gated by the{" "}
            <code>BOARD_PASSWORD</code> env var — rotating that at annual
            handover automatically signs everyone out of <code>/board</code>{" "}
            (see decision #64 in <code>docs/project-status.md</code>).
          </p>

          <div className="slotab-section-title" style={{ textAlign: "left" }}>
            <h2>Who owns the OAuth App</h2>
          </div>

          <p style={{ marginBottom: "2rem" }}>
            The <strong>SLOTAB Decap CMS</strong> OAuth App is registered
            under the{" "}
            <a
              href="https://github.com/organizations/SanLuisObispoTAB/settings/applications"
              target="_blank"
              rel="noopener noreferrer"
            >
              SanLuisObispoTAB org
            </a>
            . Its Client ID + Client Secret are stored in Vercel as{" "}
            <code>DECAP_GITHUB_CLIENT_ID</code> /{" "}
            <code>DECAP_GITHUB_CLIENT_SECRET</code>. Setup details for
            successors live in{" "}
            <a
              href="https://github.com/SanLuisObispoTAB/website/blob/main/docs/decap-setup.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              docs/decap-setup.md
            </a>
            .
          </p>

          <div
            style={{
              background: "#fff",
              border: "1px solid #ddd",
              padding: "1rem 1.25rem",
              fontSize: "0.9rem",
              color: "#555",
            }}
          >
            <strong>Org membership note.</strong> Repo collaborators do not
            automatically become members of the SanLuisObispoTAB org —
            they&apos;re collaborators on the <em>repo</em> only. That&apos;s
            fine for editing; org membership only matters if you want them
            to manage the OAuth App or org settings.{" "}
            <a
              href={ORG_PEOPLE_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Org people →
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
