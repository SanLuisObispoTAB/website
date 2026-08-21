import Link from "next/link";
import {
  buildSquareReport,
  defaultRange,
  designationLabel as label,
  type Report,
} from "../../../lib/square-report";

export const metadata = {
  title: "Donation report — SLOTAB Board",
  robots: { index: false, follow: false },
};

// Always fresh: this reads live Square data and a cached figure on a financial
// report is worse than a slow one.
export const dynamic = "force-dynamic";

// Gated by `src/proxy.ts`, which password-protects every /board/* path except
// the login page. The CSV download lives under /api and therefore checks the
// session itself — see lib/board-auth.ts for why that is not automatic.

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});
const money = (cents: number) => MONEY.format(cents / 100);

function toDateInput(iso: string) {
  return iso.slice(0, 10);
}

export default async function SquareReportPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const fallback = defaultRange();
  const sinceInput = one(params.since) || toDateInput(fallback.since);
  const untilInput = one(params.until) || toDateInput(fallback.until);

  let report: Report | null = null;
  let error: string | null = null;
  try {
    report = await buildSquareReport(
      new Date(`${sinceInput}T00:00:00Z`).toISOString(),
      new Date(`${untilInput}T00:00:00Z`).toISOString(),
    );
  } catch (err) {
    error = err instanceof Error ? err.message : "Could not reach Square";
  }

  const csvHref = `/api/board/square-report?since=${sinceInput}&until=${untilInput}`;

  return (
    <section className="slotab-section">
      <div className="slotab-container slotab-prose">
        <p className="slotab-board-back">
          <Link href="/board">← Board Hub</Link>
        </p>
        <h1>Donation report</h1>
        <p>
          Gross, the 75% team share and the 25% general share for every
          designation, taken straight from Square. This is the per-sport
          breakdown the QuickBooks connector cannot produce — it posts a daily
          summary with no line detail.
        </p>

        <form method="get" className="slotab-report-range">
          <label>
            <span>From</span>
            <input type="date" name="since" defaultValue={sinceInput} />
          </label>
          <label>
            <span>To</span>
            <input type="date" name="until" defaultValue={untilInput} />
          </label>
          <button type="submit" className="slotab-btn">
            Show
          </button>
        </form>

        {error && (
          <p className="slotab-report-error" role="alert">
            <strong>Couldn&apos;t load the report.</strong> {error}
          </p>
        )}

        {report && (
          <>
            {report.environment !== "production" && (
              <p className="slotab-report-sandbox" role="alert">
                <strong>Sandbox data.</strong> These are test transactions, not
                real money.
              </p>
            )}

            {report.rows.length === 0 ? (
              <p>No completed website transactions in this period.</p>
            ) : (
              <div className="slotab-report-scroll">
                <table className="slotab-report-table">
                  <thead>
                    <tr>
                      <th>Designation</th>
                      <th className="num">Gifts</th>
                      <th className="num">Gross</th>
                      <th className="num">To team (75%)</th>
                      <th className="num">To general</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.rows.map((r) => (
                      <tr key={r.key}>
                        <td>
                          {label(r.key)}
                          {/* The QuickBooks class Trina posts this row to,
                              shown verbatim so the report and her ledger use
                              the same words. Only the named funds have one. */}
                          {r.qbClass && (
                            <span className="slotab-report-sub">
                              QuickBooks: {r.qbClass}
                            </span>
                          )}
                          {r.sports.length > 0 && (
                            <span className="slotab-report-sub">
                              credited to{" "}
                              {r.sports.map((s) => label(s)).join(", ")}
                            </span>
                          )}
                        </td>
                        <td className="num">{r.count}</td>
                        <td className="num">{money(r.grossCents)}</td>
                        <td className="num">
                          {r.toTeamCents ? money(r.toTeamCents) : "—"}
                        </td>
                        <td className="num">{money(r.toGeneralCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th>Total</th>
                      <th className="num">{report.totals.count}</th>
                      <th className="num">{money(report.totals.grossCents)}</th>
                      <th className="num">{money(report.totals.toTeamCents)}</th>
                      <th className="num">
                        {money(report.totals.toGeneralCents)}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <p className="slotab-btn-row" style={{ justifyContent: "flex-start" }}>
              <a href={csvHref} className="slotab-btn outline">
                Download CSV
              </a>
            </p>

            <ul className="slotab-report-notes">
              <li>
                Gross, before Square&apos;s processing fees — those reach
                QuickBooks separately.
              </li>
              <li>
                Abandoned checkouts are excluded; only orders where money was
                actually taken are counted.
              </li>
              {report.skippedTests > 0 && (
                <li>
                  <strong>
                    {report.skippedTests} board test transaction
                    {report.skippedTests === 1 ? "" : "s"} excluded.
                  </strong>{" "}
                  Those are real charges and still need refunding in Square.
                </li>
              )}
              {report.unattributedCents > 0 && (
                <li>
                  {money(report.unattributedCents)} was taken at this location
                  outside the website — invoices or in-person sales. Not
                  allocated here.
                </li>
              )}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
