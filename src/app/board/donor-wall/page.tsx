import Link from "next/link";
import {
  buildDonorWallQueue,
  composeConsentRequest,
  SEASON_START,
  type DonorCandidate,
  type DonorWallQueue,
} from "../../../lib/donor-wall";
import {
  CANONICAL_TIERS,
  DONOR_WALL,
  allDonors,
  donorKey,
  legacyTiers,
  type UnverifiedDonor,
} from "../../data/donors";
import { isRepoWriteConfigured } from "../../../lib/github-commit";

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

/** The whole season, from `SEASON_START` (4 June 2026) to tomorrow.
 *
 *  Deliberately wide: this is a catch-up tool, and a default of "this month"
 *  would quietly hide the backlog it exists to surface — which is exactly what
 *  the previous 1 August default was doing to June and July. */
function defaultDonorRange() {
  return {
    since: SEASON_START,
    until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

/** One name carried over from the pre-#201 wall.
 *
 *  Deliberately the SAME two buttons as a live donor, because to the volunteer
 *  it is the same decision. What differs is the evidence: a live donor's row
 *  carries an amount, a designation and a recorded level; this one carries a
 *  heading somebody typed at some point, and that is all anyone knows. The row
 *  says so rather than dressing it up. */
function CarryoverRow({
  d,
  alsoInQueue,
  canWrite,
}: {
  d: UnverifiedDonor;
  alsoInQueue: boolean;
  canWrite: boolean;
}) {
  return (
    <tr>
      <td>
        <strong>{d.name}</strong>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          {d.was ? `was listed under “${d.was}”` : "no previous heading recorded"}
          {alsoInQueue && " · also gave this season — use their row below instead"}
        </div>
      </td>
      <td>
        <form method="post" action="/api/board/donor-wall">
          <input type="hidden" name="name" value={d.name} />
          <input type="hidden" name="action" value="carryover-accept" />
          <select name="tier" defaultValue="" aria-label={`Tier for ${d.name}`}>
            <option value="">Tier to be confirmed</option>
            {(["sponsorship", "membership"] as const).map((kind) => (
              <optgroup
                key={kind}
                label={kind === "sponsorship" ? "Sponsorships" : "Memberships"}
              >
                {CANONICAL_TIERS.filter((t) => t.kind === kind).map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>{" "}
          <button className="slotab-btn" type="submit" disabled={!canWrite}>
            Keep on the wall
          </button>
        </form>
      </td>
      <td>
        <form method="post" action="/api/board/donor-wall">
          <input type="hidden" name="name" value={d.name} />
          <input type="hidden" name="action" value="carryover-dismiss" />
          <button className="slotab-btn outline" type="submit" disabled={!canWrite}>
            Remove
          </button>
        </form>
      </td>
    </tr>
  );
}

/** One pending donor, with the two buttons that are the whole point of this
 *  page: a volunteer should be able to say yes or no without touching a CMS. */
function PendingRow({
  c,
  canWrite,
}: {
  c: DonorCandidate;
  canWrite: boolean;
}) {
  // Pre-selected from the level Square recorded at checkout. An EXACT match:
  // the wall's headings and `metadata.level` are the same eight strings off the
  // same sheet (#200), so there is nothing to pattern-match. The earlier loose
  // "does the heading contain the first word" match existed only because the
  // two vocabularies didn't line up, and it would happily have put a Champion
  // Sponsor into "Champion Membership" — a tenfold difference in what it claims
  // somebody gave.
  const suggested = CANONICAL_TIERS.some((t) => t.name === c.level) ? c.level! : "";
  return (
    <tr>
      <td>
        <strong>{c.name}</strong>
        <div style={{ fontSize: "0.8rem", color: "#666" }}>
          {c.designationLabel} · {money(c.amountCents)} · {day(c.when)}
          {c.level ? ` · ${c.level}` : ""}
        </div>
      </td>
      <td>
        <form method="post" action="/api/board/donor-wall">
          <input type="hidden" name="name" value={c.name} />
          <input type="hidden" name="action" value="accept" />
          <select name="tier" defaultValue={suggested} aria-label={`Tier for ${c.name}`}>
            <option value="">Tier to be confirmed</option>
            {(["sponsorship", "membership"] as const).map((kind) => (
              <optgroup
                key={kind}
                label={kind === "sponsorship" ? "Sponsorships" : "Memberships"}
              >
                {CANONICAL_TIERS.filter((t) => t.kind === kind).map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>{" "}
          <button className="slotab-btn" type="submit" disabled={!canWrite}>
            Add to wall
          </button>
        </form>
      </td>
      <td>
        <form method="post" action="/api/board/donor-wall">
          <input type="hidden" name="name" value={c.name} />
          <input type="hidden" name="action" value="dismiss" />
          <button className="slotab-btn outline" type="submit" disabled={!canWrite}>
            Not on the wall
          </button>
        </form>
      </td>
    </tr>
  );
}

/** Read-only row, for the buckets that are not one-click decisions. */
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
  // Clamped to the season start, and that is a correctness guard rather than a
  // policy: the accept route builds its own queue from `SEASON_START` and
  // refuses any name not in it. A page allowed to look further back would list
  // donors whose buttons could only ever fail — reporting "no longer pending",
  // which describes something else entirely. Page window ⊆ route window, always.
  const floor = toDateInput(SEASON_START);
  const requestedSince = one(params.since) || toDateInput(fallback.since);
  const sinceInput = requestedSince < floor ? floor : requestedSince;
  const untilInput = one(params.until) || toDateInput(fallback.until);
  const done = one(params.done);
  const problem = one(params.problem);
  const canWrite = isRepoWriteConfigured();
  const stale = legacyTiers();
  const carriedOver = DONOR_WALL.unverified ?? [];

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

  // A carried-over name who has ALSO given this season appears in both piles.
  // The row says so and points at the Square row, which is the one to use: it
  // carries an amount and a recorded level, and confirming from there retires
  // the parked copy in the same write.
  const pendingKeys = new Set((queue?.pending ?? []).map((c) => donorKey(c.name)));

  return (
    <section className="slotab-section">
      <div className="slotab-container slotab-prose">
        <h1>Donor wall</h1>
        <p>
          Currently listed on{" "}
          <Link href="/membership#members">the wall at the foot of /membership</Link>:{" "}
          <strong>{allDonors().length}</strong> across{" "}
          <strong>
            {DONOR_WALL.tiers.filter((t) => t.donors.length > 0).length}
          </strong>{" "}
          tiers ({DONOR_WALL.season})
          {carriedOver.length > 0 &&
            `, with ${carriedOver.length} more awaiting review below`}
          . Edit it at{" "}
          <a href="/admin/#/collections/donors" target="_blank" rel="noreferrer">
            /admin → Donor Wall
          </a>
          .
        </p>

        {stale.length > 0 && (
          <div style={{ background: "#fff4e5", padding: "0.75rem 1rem" }}>
            <p style={{ margin: "0 0 0.5rem" }}>
              <strong>
                {stale.reduce((n, t) => n + t.donors.length, 0)} members are still
                under an old tier heading.
              </strong>{" "}
              The wall now uses the club&rsquo;s own eight tiers — the same ones on{" "}
              <Link href="/membership">the Membership page</Link>. These headings
              aren&rsquo;t on that sheet:
            </p>
            <ul style={{ margin: "0 0 0.5rem" }}>
              {stale.map((t) => (
                <li key={t.tier}>
                  {t.tier} — {t.donors.length}{" "}
                  {t.donors.length === 1 ? "name" : "names"}
                </li>
              ))}
            </ul>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>
              They were left exactly as they were rather than moved for you: a
              heading says what somebody gave, and no record here says which tier
              these names belong to. If these are last season&rsquo;s members, the
              answer may be to retire them with the seasonal clear-down rather
              than refile them at all. Whoever knows can do either at{" "}
              <a href="/admin/#/collections/donors" target="_blank" rel="noreferrer">
                /admin → Donor Wall
              </a>
              , then delete the empty heading.
            </p>
          </div>
        )}

        <form method="get" style={{ margin: "1.5rem 0" }}>
          <label>
            From{" "}
            <input
              type="date"
              name="since"
              min={floor}
              defaultValue={sinceInput}
            />
          </label>{" "}
          <label>
            To <input type="date" name="until" defaultValue={untilInput} />
          </label>{" "}
          <button className="slotab-btn outline" type="submit">
            Reload
          </button>
        </form>

        {done && (
          <p style={{ background: "#e8f5e9", padding: "0.75rem 1rem" }}>✅ {done}</p>
        )}
        {problem && (
          <p style={{ background: "#fdecea", padding: "0.75rem 1rem" }}>⚠️ {problem}</p>
        )}
        {!canWrite && (
          <p style={{ background: "#fff4e5", padding: "0.75rem 1rem" }}>
            <strong>The buttons are switched off.</strong> Adding a donor writes
            to the site&apos;s repository, which needs <code>GITHUB_TOKEN</code>{" "}
            set in Vercel — a fine-grained token for this repository with{" "}
            <em>Contents: read and write</em> and nothing else. Until then this
            page still shows you who is waiting.
          </p>
        )}

        {carriedOver.length > 0 && (
          <>
            <h2>Carried over — confirm or remove ({carriedOver.length})</h2>
            <p>
              These names were on the wall before it was tied to the club&rsquo;s
              tiers, and they have been <strong>taken off the public page</strong>{" "}
              until somebody confirms them. Nothing about them is lost — they are
              sitting in the wall&rsquo;s own data file, and they go back up the
              moment you press <em>Keep on the wall</em>.
            </p>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
              Worth knowing what you are confirming. Unlike the queue below,
              these names have <strong>no payment and no consent record behind
              them</strong> — they came off a hand-written list, so the old
              heading is the only context there is, and for two of those headings
              it is context the club no longer uses. Leaving the tier as{" "}
              <em>Tier to be confirmed</em> is a perfectly good answer if you
              know the person belongs on the wall but not where.
            </p>
            <table className="slotab-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Keep, at this tier</th>
                  <th>Or not</th>
                </tr>
              </thead>
              <tbody>
                {carriedOver.map((d) => (
                  <CarryoverRow
                    key={d.name}
                    d={d}
                    alsoInQueue={pendingKeys.has(donorKey(d.name))}
                    canWrite={canWrite}
                  />
                ))}
              </tbody>
            </table>
          </>
        )}

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
              typed the name themselves, so the spelling below is theirs. Pick a
              tier if you want to override the one Square recorded, then press{" "}
              <em>Add to wall</em> — they appear on the public page at the next
              deploy, usually about a minute.
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
                      <th>Donor</th>
                      <th>Add to the wall</th>
                      <th>Or not</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.pending.map((c) => (
                      <PendingRow
                        key={`${c.name}-${c.when}`}
                        c={c}
                        canWrite={canWrite}
                      />
                    ))}
                  </tbody>
                </table>
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
