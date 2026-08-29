import hofData from "../data/hof.json";

// The Hall of Fame Fund progress bar.
//
// WHY IT IS ITS OWN FILE
// Extracted from `HofFund` when the fund got its own donation page (#210).
// Two surfaces now show this figure — the band on `/hall-of-fame` and the
// campaign's donate page — and a hand-copied second bar is how one of them ends
// up publishing a number the other has already withdrawn.
//
// That is not hypothetical here: the whole point of the freshness gate below is
// that a raised total is a **dated claim**, not a fact (#188/#189). A figure
// older than `raisedStaleAfterDays` stops publishing and the bar falls back to
// the goal alone. If the donate page carried its own copy of that arithmetic
// and drifted by a line, the club could be asking for money under a frozen
// number on one page while the other had honestly stopped asserting it.
//
// Behaviour is unchanged from the version that lived in `HofFund` — same
// markup, same class names, same rounding.

type Fund = {
  goalDollars: number;
  raisedDollars: number;
  raisedAsOf: string;
  raisedStaleAfterDays?: number;
  goalLabel: string;
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** When this build was made, used to age the raised figure.
 *
 *  Module scope, not the component body, for two reasons that happen to agree:
 *  the React compiler rejects `Date.now()` during render as impure (correctly —
 *  a value that changes between renders is exactly what it guards against), and
 *  build time is the semantics actually wanted here. Evaluated once per build,
 *  so the staleness flip lands on the next rebuild after the boundary — the
 *  same trade-off `isDonateDriveActive` documents in campaign.ts, and the same
 *  reason it is safe: deploys and the events cron rebuild this site regularly. */
const BUILT_AT_MS = Date.now();

export default function HofThermometer() {
  const fund = hofData.fund as Fund;
  const hasGoal = fund.goalDollars > 0;
  // Only once there is a real target to measure against. See the note in
  // hof.json: an invented goal on a 501(c)(3) donation page is worse than none.
  if (!hasGoal) return null;

  const asOf = fund.raisedAsOf.trim();
  const asOfMs = asOf ? Date.parse(`${asOf}T12:00:00Z`) : NaN;
  const staleAfterDays = fund.raisedStaleAfterDays ?? 14;
  const ageDays = Number.isNaN(asOfMs)
    ? Infinity
    : (BUILT_AT_MS - asOfMs) / 86_400_000;
  // A figure is publishable only while it is both present and fresh.
  const hasRaisedFigure = !Number.isNaN(asOfMs) && ageDays <= staleAfterDays;
  const asOfLabel = Number.isNaN(asOfMs)
    ? ""
    : new Intl.DateTimeFormat("en-US", {
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      }).format(asOfMs);
  const pct = hasRaisedFigure
    ? Math.min(100, Math.round((fund.raisedDollars / fund.goalDollars) * 100))
    : 0;

  return (
    <div className="slotab-hof-goal">
      <div className="slotab-hof-goal-figures">
        {hasRaisedFigure ? (
          <>
            <strong>{MONEY.format(fund.raisedDollars)}</strong>
            <span>
              raised of {MONEY.format(fund.goalDollars)} {fund.goalLabel}
            </span>
          </>
        ) : (
          <>
            <strong>{MONEY.format(fund.goalDollars)}</strong>
            <span>the goal {fund.goalLabel}</span>
          </>
        )}
      </div>
      <div
        className="slotab-hof-goal-track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={
          hasRaisedFigure
            ? `Hall of Fame fund progress: ${pct}% of goal`
            : "Hall of Fame fund progress: not yet published"
        }
      >
        <div className="slotab-hof-goal-fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="slotab-hof-goal-asof">
        {hasRaisedFigure
          ? `As of ${asOfLabel}. Updated weekly.`
          : "The bar fills as gifts come in, updated weekly."}
      </p>
    </div>
  );
}
