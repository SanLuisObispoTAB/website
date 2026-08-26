import {
  buildSquareReport,
  designationLabel,
  type Report,
} from "../../../../lib/square-report";
import { sendEmail } from "../../../../lib/email";

// The Treasurer's weekly donation summary, emailed every Monday.
//
// Requested by Trina on 2026-08-21: trailing seven days, to her alone. The
// wider board can pull the same figures on demand at /board/square-report, so
// this is a nudge for the one person who reconciles rather than a broadcast.
//
// WHY A VERCEL CRON RATHER THAN A GITHUB ACTION
// The repo already runs scheduled work in GitHub Actions, so an Action was the
// obvious home — but it would mean copying the **production Square access
// token** into GitHub secrets. That token is a *personal* access token, which
// Square documents as unrestricted: refunds and payouts included. It already
// lives in Vercel because the site needs it; giving it a second home doubles
// the number of places the club's most dangerous credential can leak from, for
// no gain. Running here keeps it where it already is.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Square search plus an email round trip; the default 10s is tight.
export const maxDuration = 60;

const MONEY = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const money = (cents: number) => MONEY.format(cents / 100);

const TREASURER_EMAIL = "slotabtreas@gmail.com";

function pad(s: string, n: number) {
  return s.length >= n ? s.slice(0, n) : s + " ".repeat(n - s.length);
}
function padLeft(s: string, n: number) {
  return s.length >= n ? s : " ".repeat(n - s.length) + s;
}

/** Plain text, not HTML, on purpose: this has to be readable in whatever
 *  Gmail does to it on a phone, and a monospaced column layout survives that
 *  better than a table nobody will style-test. */
function compose(report: Report, siteUrl: string): string {
  const lines: string[] = [];
  const day = (iso: string) => iso.slice(0, 10);

  lines.push(`SLOTAB website donations — ${day(report.since)} to ${day(report.until)}`);
  lines.push("");

  if (report.rows.length === 0) {
    lines.push("No donations came through the website this week.");
  } else {
    lines.push(
      pad("Designation", 30) + padLeft("Gifts", 6) + padLeft("Gross", 12) +
      padLeft("To team", 12) + padLeft("To general", 13),
    );
    lines.push("-".repeat(73));
    for (const r of report.rows) {
      lines.push(
        pad(designationLabel(r.key), 30) +
        padLeft(String(r.count), 6) +
        padLeft(money(r.grossCents), 12) +
        padLeft(r.toTeamCents ? money(r.toTeamCents) : "—", 12) +
        padLeft(money(r.toGeneralCents), 13),
      );
    }
    lines.push("-".repeat(73));
    lines.push(
      pad("TOTAL", 30) +
      padLeft(String(report.totals.count), 6) +
      padLeft(money(report.totals.grossCents), 12) +
      padLeft(money(report.totals.toTeamCents), 12) +
      padLeft(money(report.totals.toGeneralCents), 13),
    );
  }

  lines.push("");
  lines.push("Gross, before Square's processing fees — those reach QuickBooks separately.");
  lines.push("Abandoned checkouts are not counted.");
  if (report.skippedTests > 0) {
    lines.push(
      `${report.skippedTests} board test transaction(s) excluded — those are real charges and still need refunding in Square.`,
    );
  }
  if (report.unattributedCents > 0) {
    lines.push(
      `${money(report.unattributedCents)} was taken at this location outside the website (invoices, in person) and is not allocated above.`,
    );
  }
  if (report.environment !== "production") {
    lines.push("");
    lines.push("*** SANDBOX DATA — these are test transactions, not real money. ***");
  }
  lines.push("");
  lines.push(`Full report, any date range, with CSV export: ${siteUrl}/board/square-report`);

  return lines.join("\n");
}

export async function GET(req: Request) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Fail closed when
  // the secret is unset — an unconfigured gate is a closed gate.
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const until = new Date();
  const since = new Date(until.getTime() - 7 * 24 * 60 * 60 * 1000);
  const siteUrl = process.env.SITE_URL ?? "https://slotab.org";

  let report: Report;
  try {
    report = await buildSquareReport(since.toISOString(), until.toISOString());
  } catch (err) {
    // Loud. A weekly report that quietly stops arriving is worse than one that
    // never existed, because Trina will assume a silent week means no gifts.
    console.error("[cron] weekly report could not be built:", err);
    return Response.json({ ok: false, stage: "report" }, { status: 502 });
  }

  // Deliberately NOT short-circuiting on `isEmailConfigured()`. `sendEmail`
  // already handles an unconfigured mailer loudly, and in development it logs
  // the full message so the content is recoverable — returning early here
  // would throw that away and report "not configured" with nothing to read.
  const weekEnding = until.toISOString().slice(0, 10);
  const result = await sendEmail({
    to: TREASURER_EMAIL,
    subject: `SLOTAB donations — week ending ${weekEnding}`,
    text: compose(report, siteUrl),
  });

  console.log(
    `[cron] weekly report ${result.status}: ${report.totals.count} gift(s), ${money(report.totals.grossCents)}` +
      (result.status === "sent" && result.id ? ` resend_id=${result.id}` : ""),
  );
  return Response.json({
    ok: result.status === "sent",
    email: result.status,
    ...(result.status === "sent" && result.id ? { resendId: result.id } : {}),
    ...(result.status !== "sent" ? { reason: result.reason } : {}),
    gifts: report.totals.count,
    grossCents: report.totals.grossCents,
  });
}
