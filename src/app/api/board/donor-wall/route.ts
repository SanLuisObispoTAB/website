import { NextResponse } from "next/server";
import { requestHasBoardSession } from "../../../../lib/board-auth";
import {
  buildDonorWallQueue,
  SEASON_START,
  UNFILED_TIER,
} from "../../../../lib/donor-wall";
import { readJsonFile, writeJsonFile } from "../../../../lib/github-commit";
import {
  donorKey,
  isCanonicalTier,
  type DonorTier,
  type DonorWall,
} from "../../../data/donors";
import {
  HOF_FALLBACK_TIER,
  fundWallPath,
  isHofTier,
  type HofDonorTier,
  type HofDonorWall,
} from "../../../data/hof-donors";
import { specialFund } from "../../../data/special-funds";

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
    since: SEASON_START,
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
  const ACTIONS = ["accept", "dismiss", "carryover-accept", "carryover-dismiss"];
  if (!claimedName || !ACTIONS.includes(action)) {
    return back("Malformed request — nothing changed.", false);
  }
  // The two carried-over actions work the pile #201 parked in `unverified`, not
  // Square's live queue. Different source of truth, same rule: the name written
  // comes from a store the form cannot reach.
  const carryover = action.startsWith("carryover-");
  const accepting = action.endsWith("accept");

  // Prove the person is actually waiting, and take the name from SQUARE rather
  // than from the form. This is the check that keeps the token boring.
  //
  // Skipped for a carried-over name, necessarily — Square has never heard of
  // them, which is the entire reason they needed parking. Their equivalent
  // check is below, against `wall.unverified` as read back from GitHub: still a
  // trusted store, still not the form.
  let candidateName = "";
  let candidateLevel: string | undefined;
  // Which wall this gift belongs on. A carried-over name has no designation —
  // Square has never heard of them — so it stays empty there and the membership
  // wall is the only destination, which is where those names came off.
  let candidateDesignation = "";
  if (!carryover) {
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
      candidateLevel = match.level;
      candidateDesignation = match.designation;
    } catch (err) {
      return back(
        `Could not check Square: ${err instanceof Error ? err.message : "unknown error"}`,
        false,
      );
    }
  }

  // ---------------------------------------------------------------- FUND WALLS
  //
  // A gift to a named fund is recognised on THAT FUND'S wall, not on the
  // membership one. Erik, 2026-08-29: *"the wall on the HOF page … is the
  // proper place for a HOF donation to go."*
  //
  // Before this, every Hall of Fame donor was proposed onto `/membership` under
  // one of the club's eight tiers — publicly crediting them with a membership
  // or a sponsorship they had not bought, on a page about a different thing.
  //
  // The headings here are the FUND's rungs, so the same filing-from-Square
  // trick still works: since #211 a fund gift's `metadata.level` is one of
  // those rung names exactly.
  //
  // Accepts only. A dismissal is a statement about the QUEUE, not about a wall,
  // and the queue is shared across designations — so it stays on `donors.json`
  // with every other dismissal, below.
  if (accepting && !carryover && specialFund(candidateDesignation)) {
    const path = fundWallPath(candidateDesignation);
    if (!path) {
      // A fund exists in SPECIAL_FUNDS but has no wall file. Refused loudly
      // rather than falling through to the membership wall, because falling
      // through silently is the exact bug this branch was written to end.
      return back(
        `No donor wall is configured for ${candidateDesignation} — nothing was written. Add one to FUND_WALL_PATHS.`,
        false,
      );
    }
    const readFund = await readJsonFile(path);
    if (!readFund.ok) {
      return back(`Could not read the fund wall: ${readFund.reason}`, false);
    }
    const fundWall = readFund.json as HofDonorWall;
    fundWall.tiers = fundWall.tiers ?? [];

    // Same rule as the membership wall: the form may choose a heading, never
    // invent one, because this string becomes a public claim about what
    // somebody gave.
    const chosenRung = isHofTier(tier) ? tier : "";
    const rungFromSquare =
      candidateLevel && isHofTier(candidateLevel) ? candidateLevel : "";
    const rung = chosenRung || rungFromSquare || HOF_FALLBACK_TIER;

    let bucket = fundWall.tiers.find((t) => t.tier === rung);
    if (!bucket) {
      const created: HofDonorTier = { tier: rung, donors: [] };
      fundWall.tiers.push(created);
      bucket = created;
    }
    bucket.donors.push({ name: candidateName });

    const wroteFund = await writeJsonFile(
      path,
      fundWall,
      readFund.sha,
      `Add ${candidateName} to the ${candidateDesignation} donor wall (${rung})` +
        (chosenRung
          ? ""
          : rungFromSquare
            ? " — filed from the rung Square recorded"
            : "") +
        "\n\nFrom the Board Hub donor wall queue. The donor consented at\ncheckout; a board member confirmed. This fund keeps its own wall —\nsee decision #212.",
    );
    if (!wroteFund.ok) return back(`Could not save: ${wroteFund.reason}`, false);

    return back(
      `${candidateName} added to the Hall of Fame wall (${rung}). The page updates when the site redeploys, usually a minute.`,
      true,
    );
  }

  const read = await readJsonFile(DATA_PATH);
  if (!read.ok) return back(`Could not read the wall: ${read.reason}`, false);
  const wall = read.json as DonorWall;

  if (carryover) {
    const key = donorKey(claimedName);
    const entry = (wall.unverified ?? []).find((d) => donorKey(d.name) === key);
    if (!entry) {
      return back(
        "That name is no longer awaiting review — someone may have just handled them. Reloaded.",
        false,
      );
    }
    // The file's spelling, not the form's — the same rule the Square path
    // follows, for the same reason: this string becomes a public page.
    candidateName = entry.name;
  }

  let message: string;
  if (accepting) {
    // WHICH TIER, AND WHY THE FORM IS NOT TRUSTED TO SAY
    // The dropdown offers only the club's eight tiers, but a posted field can
    // say anything, and this one ends up as a public heading over somebody's
    // name. So the same rule as the name itself: the form may *choose*, it may
    // not *invent*. A non-canonical value is discarded rather than honoured.
    //
    // When nothing usable was chosen, Square's own `metadata.level` decides.
    // That is not a guess: it is the level the checkout recorded for this gift,
    // named from the same array these headings come from (#200), so it agrees
    // with the tier by construction. Filing from it is how the volunteer stops
    // having to know the ladder.
    //
    // A carried-over name has no recorded level to fall back on — that is
    // precisely what makes it unverified — so an unchosen tier lands in
    // UNFILED_TIER rather than inheriting the heading it used to sit under.
    // Two of those headings name nothing the club offers; carrying one forward
    // silently would re-publish the claim this whole change exists to retire.
    const chosen = isCanonicalTier(tier) ? tier : "";
    const fromSquare =
      candidateLevel && isCanonicalTier(candidateLevel) ? candidateLevel : "";
    const heading = chosen || fromSquare || UNFILED_TIER;

    // A tier with nobody in it isn't stored, so the first donor at a level
    // creates it. `orderedTiers()` puts it in its place on the ladder at render
    // time, which is why nothing here has to care where it is pushed.
    let target = wall.tiers.find((t) => t.tier === heading && t.group !== "legacy");
    if (!target) {
      const created: DonorTier = { tier: heading, donors: [] };
      wall.tiers.push(created);
      target = created;
    }
    target.donors.push({ name: candidateName });
    message =
      `Add ${candidateName} to the donor wall (${heading})` +
      (chosen ? "" : fromSquare ? " — filed from the level Square recorded" : "");
  } else {
    wall.dismissed = wall.dismissed ?? [];
    if (!wall.dismissed.some((d) => d.key === donorKey(candidateName))) {
      wall.dismissed.push({ key: donorKey(candidateName) });
    }
    message = carryover
      ? "Remove a carried-over name from the donor wall"
      : "Dismiss a donor from the wall queue";
  }

  // Whichever branch ran, the name has now been decided, so it leaves the
  // carried-over pile. Done unconditionally rather than only on the carryover
  // path: someone listed last season may well have given again this season, and
  // confirming them from Square's queue must retire the parked copy too — or
  // the board is asked about the same person twice.
  if (wall.unverified) {
    wall.unverified = wall.unverified.filter(
      (d) => donorKey(d.name) !== donorKey(candidateName),
    );
  }

  const written = await writeJsonFile(
    DATA_PATH,
    wall,
    read.sha,
    // The provenance line is not decoration — it is the record of WHY a name is
    // on a public page, and the two paths do not have the same answer. Saying
    // "consented at checkout" over a carried-over name would put a consent
    // claim into git history that nothing supports; those 38 predate the
    // checkbox entirely (#201). Each path states only what is true of it.
    `${message}\n\n${
      carryover
        ? "From the Board Hub donor wall queue: a name carried over from the\npre-2026-27 wall, confirmed by a board member. No checkout consent\nexists for these — see decision #201."
        : "From the Board Hub donor wall queue. The donor consented at\ncheckout; a board member confirmed. See decision #199."
    }`,
  );
  if (!written.ok) return back(`Could not save: ${written.reason}`, false);

  return back(
    accepting
      ? `${candidateName} added. The page updates when the site redeploys, usually a minute.`
      : carryover
        ? `${candidateName} removed from the wall.`
        : "Dismissed — they won't appear in the queue again.",
    true,
  );
}
