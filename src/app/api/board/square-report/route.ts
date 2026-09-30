import { NextResponse } from "next/server";
import { requestHasBoardSession } from "../../../../lib/board-auth";
import { buildSquareReport, reportToCsv, defaultRange } from "../../../../lib/square-report";

// CSV download for the Board Hub's donation report.
//
// This checks the board session ITSELF rather than relying on the proxy. The
// proxy gates on `pathname.startsWith("/board")`, and this path starts with
// `/api` — so without the check below, the club's donation figures would be
// downloadable by anyone who guessed the URL.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** `YYYY-MM-DD` and nothing else. Both values end up inside a response
 *  header (the CSV filename) and inside a Square query, so the shape is pinned
 *  here rather than trusted to survive `new Date()` (#240). */
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(req: Request) {
  if (!(await requestHasBoardSession(req))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const url = new URL(req.url);
  const fallback = defaultRange();
  const since = url.searchParams.get("since") ?? fallback.since.slice(0, 10);
  const until = url.searchParams.get("until") ?? fallback.until.slice(0, 10);
  if (!ISO_DAY.test(since) || !ISO_DAY.test(until)) {
    return NextResponse.json(
      { error: "Dates must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  try {
    const report = await buildSquareReport(
      new Date(`${since}T00:00:00Z`).toISOString(),
      new Date(`${until}T00:00:00Z`).toISOString(),
    );
    return new NextResponse(reportToCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="slotab-donations-${since}-to-${until}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[board] square report failed:", err);
    return NextResponse.json(
      { error: "Could not build the report" },
      { status: 502 },
    );
  }
}
