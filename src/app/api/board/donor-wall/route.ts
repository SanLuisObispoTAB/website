import { NextResponse } from "next/server";
import { requestHasBoardSession } from "../../../../lib/board-auth";
import { buildDonorWallQueue, HOLDING_TIER } from "../../../../lib/donor-wall";
import { readJsonFile, writeJsonFile } from "../../../../lib/github-commit";
import { donorKey, type DonorWall } from "../../../data/donors";

// Accept / decline a pending donor, from the buttons on /board/donor-wall.
//
// Checks the board session ITSELF rather than relying on the proxy: the proxy
// gates on `pathname.startsWith("/board")` and this path starts with `/api`,
// the same trap the CSV route documents.
//
// THE SAFETY ARGUMENT, since this route holds a repo-write token
// Being past the board password is not enough to write whatever you like. The
// route re-derives the pending list FROM SQUARE on every request and refuses
// any name that is not genuinely waiting there. So the only reachable effects
// are: list a donor who really did consent, or dismiss one from the queue. The
// name is never taken from the form — only the *match* is. What gets written is
// the string Square holds, so a doctored form field cannot put arbitrary text
// on a public page.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATA_PATH = "src/app/data/donors.json";

/** Wide enough to cover the whole of this season's giving; the queue page uses
 *  the same window. A donor accepted here must be findable here. */
function lookbackWindow() {
  return {
    since: "2026-08-01T00:00:00.000Z",
    until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

function back(note: string, ok: boolean) {
  const url = new URL(
    `/board/donor-wall?${ok ? "done" : "problem"}=${encodeURIComponent(note)}`,
    process.env.SITE_URL ?? "https://slotab.org",
  );
  // 303 so the browser follows with GET and a refresh doesn't re-post.
  return NextResponse.redirect(url, 303);
}

export async function POST(req: Request) {
  if (!(await requestHasBoardSession(req))) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const form = await req.formData();
  const action = String(form.get("action") ?? "");
  const claimedName = String(form.get("name") ?? "").trim();
  const tier = String(form.get("tier") ?? "").trim();
  if (!claimedName || (action !== "accept" && action !== "dismiss")) {
    return back("Malformed request — nothing changed.", false);
  }

  // Prove the person is actually waiting, and take the name from SQUARE rather
  // than from the form. This is the check that keeps the token boring.
  let candidateName: string;
  try {
    const w = lookbackWindow();
    const queue = await buildDonorWallQueue(w.since, w.until);
    const key = donorKey(claimedName);
    const match = queue.pending.find((c) => donorKey(c.name) === key);
    if (!match) {
      return back(
        "That donor is no longer pending — someone may have just handled them. Reloaded.",
        false,
      );
    }
    candidateName = match.name;
  } catch (err) {
    return back(
      `Could not check Square: ${err instanceof Error ? err.message : "unknown error"}`,
      false,
    );
  }

  const read = await readJsonFile(DATA_PATH);
  if (!read.ok) return back(`Could not read the wall: ${read.reason}`, false);
  const wall = read.json as DonorWall;

  let message: string;
  if (action === "accept") {
    const target = wall.tiers.find((t) => t.tier === tier);
    if (target) {
      target.donors.push({ name: candidateName });
    } else {
      // No tier chosen, or a tier that has since been renamed. Land them in the
      // holding tier rather than guessing — being unfiled is recoverable, being
      // filed under the wrong heading is somebody's recognition made wrong.
      const holding =
        wall.tiers.find((t) => t.tier === HOLDING_TIER) ??
        (wall.tiers[wall.tiers.push({ tier: HOLDING_TIER, donors: [] }) - 1]);
      holding.donors.push({ name: candidateName });
    }
    message = `Add ${candidateName} to the donor wall${target ? ` (${tier})` : ""}`;
  } else {
    wall.dismissed = wall.dismissed ?? [];
    if (!wall.dismissed.some((d) => d.key === donorKey(candidateName))) {
      wall.dismissed.push({ key: donorKey(candidateName) });
    }
    message = "Dismiss a donor from the wall queue";
  }

  const written = await writeJsonFile(
    DATA_PATH,
    wall,
    read.sha,
    `${message}\n\nFrom the Board Hub donor wall queue. The donor consented at\ncheckout; a board member confirmed. See decision #199.`,
  );
  if (!written.ok) return back(`Could not save: ${written.reason}`, false);

  return back(
    action === "accept"
      ? `${candidateName} added. The page updates when the site redeploys, usually a minute.`
      : "Dismissed — they won't appear in the queue again.",
    true,
  );
}
