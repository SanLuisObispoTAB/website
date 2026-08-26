import Link from "next/link";
import {
  buildDonorWallQueue,
  composeConsentRequest,
  proposedDonorsJson,
  type DonorCandidate,
  type DonorWallQueue,
} from "../../../lib/donor-wall";
import { DONOR_WALL, allDonors } from "../../data/donors";

// Staging for the donor wall: who may be added, who must be asked first.
//
// WHY A PAGE AND NOT AN AUTOMATIC APPEND
// Erik asked for the wall entry to happen automatically when the notification
// email is generated. Two things stop that being the right shape, and one stops
// it being possible at all. Vercel's filesystem is read-only, so the webhook
// cannot write `donors.json` — an automatic append would mean a repo-write
// token living in the payment path. And this repo is PUBLIC: a name committed
// here is in git history permanently, so "please take me off" stops being a
// deletion and becomes a history rewrite. A person confirming a name before it
// is published is cheap; un-publishing is not. So the webhook proposes and a
// board member disposes — #197.
//
// NOTHING IS STORED. The queue is computed live from Square every time this
// page loads: consented donors, minus the ones already in donors.json. That
// makes it idempotent for free — confirm someone and they stop appearing.

export const metadata = {
  title: "Donor wall — SLOTAB Board",
  robots: { index: false, follow: false },
};

// Live Square data; a cached answer here would hide a donor who just gave.
export const dynamic = "force-dynamic";

const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (c: number) => MONEY.format(c / 100);
const day = (iso?: string) => (iso ? iso.slice(0, 10) : "—");

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

/** Everything since the club started taking donations through the site. The
 *  default is deliberately wide: this is a catch-up tool, and a default of "this
 *  month" would quietly hide the whole backlog it exists to surface. */
function defaultDonorRange() {
  return {
    since: "2026-08-01T00:00:00.000Z",
    until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function CandidateRow({ c }: { c: DonorCandidate }) {
  return (
    <tr>
      <td>
        <strong>{c.name}</strong>
        {c.nameSource === "cardholder" && (
          <>
            {" "}
            <span
              title="From the card, not typed by the donor — read it before publishing"
              style={{ color: "#a15c00", fontSize: "0.8rem" }}
            >
              (card name)
            </span>
          </>
        )}
      </td>
      <td>{c.designationLabel}</td>
      <td>{c.level ?? "—"}</td>
      <td style={{ textAlign: "right" }}>{money(c.amountCents)}</td>
      <td>{day(c.when)}</td>
      <td style={{ fontSize: "0.85rem" }}>{c.email ?? "—"}</td>
    </tr>
  );
}

export default async function DonorWallBoardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const fallback = defaultDonorRange();
  const sinceInput = one(params.since) || toDateInput(fallback.since);
  const untilInput = one(params.until) || toDateInput(fallback.until);

  let queue: DonorWallQueue | null = null;
  let error: string | null = null;
  try {
    queue = await buildDonorWallQueue(
      new Date(`${sinceInput}T00:00:00Z`).toISOString(),
      new Date(`${untilInput}T00:00:00Z`).toISOString(),
    );
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not reach Square";
  }

  return (
    <section className="slotab-section">
      <div className="slotab-container slotab-prose">
        <h1>Donor wall</h1>
        <p>
          Currently listed on{" "}
          <Link href="/membership#members">the wall at the foot of /membership</Link>:{" "}
          <strong>{allDonors().length}</strong> across{" "}
          <strong>{DONOR_WALL.tiers.length}</strong> tiers ({DONOR_WALL.season}).
          Edit it at{" "}
          <a href="/admin/#/collections/donors" target="_blank" rel="noreferrer">
            /admin → Donor Wall
          </a>
          .
        </p>

        <form method="get" style={{ margin: "1.5rem 0" }}>
          <label>
            From <input type="date" name="since" defaultValue={sinceInput} />
          </label>{" "}
          <label>
            To <input type="date" name="until" defaultValue={untilInput} />
          </label>{" "}
          <button className="slotab-btn outline" type="submit">
            Reload
          </button>
        </form>

        {error && (
          <p style={{ color: "#b00020" }}>
            <strong>Could not read Square:</strong> {error}
          </p>
        )}

        {queue && (
          <>
            {queue.environment !== "production" && (
              <p style={{ color: "#b00020" }}>
                <strong>SANDBOX DATA</strong> — these are test transactions, not
                real donors.
              </p>
            )}

            <h2>Ready to add ({queue.pending.length})</h2>
            <p>
              These donors ticked <em>&ldquo;Display my name&rdquo;</em> and
              typed the name themselves. Paste the block below into{" "}
              <a href="/admin/#/collections/donors" target="_blank" rel="noreferrer">
                /admin → Donor Wall
              </a>{" "}
              and they appear on the public page.
            </p>
            {queue.pending.length === 0 ? (
              <p>
                <em>Nobody waiting — everyone who consented is already listed.</em>
              </p>
            ) : (
              <>
                <table className="slotab-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Designated</th>
                      <th>Level</th>
                      <th style={{ textAlign: "right" }}>Gift</th>
                      <th>When</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.pending.map((c) => (
                      <CandidateRow key={`${c.name}-${c.when}`} c={c} />
                    ))}
                  </tbody>
                </table>
                <p>
                  <strong>Copy this into the Donor Wall collection:</strong>
                </p>
                <pre
                  style={{
                    overflowX: "auto",
                    padding: "1rem",
                    background: "#f6f6f6",
                    fontSize: "0.8rem",
                  }}
                >
                  {proposedDonorsJson(queue.pending)}
                </pre>
              </>
            )}

            <h2>Must be asked first ({queue.needsAsking.length})</h2>
            <p>
              These gifts came in <strong>before</strong> the site started
              recording a donor-wall preference, or the only name we have is off
              the card rather than typed by the donor. Nobody here has said no —
              nobody was ever asked. <strong>Do not publish these names.</strong>{" "}
              Send the request below and add anyone who says yes.
            </p>
            {queue.needsAsking.length === 0 ? (
              <p>
                <em>Nobody in this bucket.</em>
              </p>
            ) : (
              <>
                <table className="slotab-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Designated</th>
                      <th>Level</th>
                      <th style={{ textAlign: "right" }}>Gift</th>
                      <th>When</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.needsAsking.map((c) => (
                      <CandidateRow key={`${c.name}-${c.when}`} c={c} />
                    ))}
                  </tbody>
                </table>
                <p>
                  <strong>Ready-to-send request</strong> (one example; the same
                  wording works for everyone on the list):
                </p>
                <pre
                  style={{
                    overflowX: "auto",
                    padding: "1rem",
                    background: "#f6f6f6",
                    fontSize: "0.8rem",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {`Subject: ${composeConsentRequest(queue.needsAsking[0]).subject}\n\n${composeConsentRequest(queue.needsAsking[0]).text}`}
                </pre>
              </>
            )}

            <h2>Asked to stay anonymous ({queue.optedOut.length})</h2>
            <p>
              Listed only so nobody wonders whether they were missed.{" "}
              <strong>These names must never go on the wall.</strong>
            </p>
            {queue.optedOut.length === 0 ? (
              <p>
                <em>Nobody has opted out.</em>
              </p>
            ) : (
              <ul>
                {queue.optedOut.map((c) => (
                  <li key={`${c.name}-${c.when}`}>
                    {c.name} — {money(c.amountCents)}, {day(c.when)}
                  </li>
                ))}
              </ul>
            )}

            <hr />
            <p className="slotab-donate-note">
              Already listed and needing nothing: <strong>{queue.alreadyListed}</strong>.
              Gifts with no name recorded anywhere: <strong>{queue.unnamed}</strong>.
              Nothing on this page is stored — it is recomputed from Square each
              time it loads, so confirming someone simply removes them from it.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
