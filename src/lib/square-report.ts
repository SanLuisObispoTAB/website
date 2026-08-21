// The Treasurer's per-sport allocation, derived from Square.
//
// WHY THIS EXISTS
// Trina reconciles from a QuickBooks connector, and those post a daily summary
// with no line detail — so the sport a donor chose never reaches the ledger she
// works in, however carefully the site puts it into the transaction. The club
// promises donors 75% to their sport and 25% to shared programs, and until this
// existed somebody had to derive those numbers by hand.
//
// Reads `metadata`, never the line item name. Names are for humans and have
// changed twice in a week (gendered squads, then the level suffix);
// `metadata.designation` / `.level` / `.sports` are stable fields we control.
//
// Read-only: it creates and changes nothing in Square.

import teamsData from "../app/data/teams.json";
import { sponsorTierById } from "../app/data/sponsor-tiers";

const SQUARE_VERSION = "2025-06-18";
const TEAM_SHARE = 0.75;

export type ReportRow = {
  /** Team slug, "general", or "sponsorship:<tier>". */
  key: string;
  kind: string;
  count: number;
  grossCents: number;
  toTeamCents: number;
  toGeneralCents: number;
  levels: string[];
  sports: string[];
};

export type Report = {
  environment: string;
  since: string;
  until: string;
  rows: ReportRow[];
  totals: { count: number; grossCents: number; toTeamCents: number; toGeneralCents: number };
  skippedTests: number;
  unattributedCents: number;
};

export function defaultRange(now = new Date()): { since: string; until: string } {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { since: first.toISOString(), until: next.toISOString() };
}

export async function buildSquareReport(
  sinceISO: string,
  untilISO: string,
): Promise<Report> {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!token || !locationId) {
    throw new Error("Square is not configured");
  }
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  type SquareOrder = {
    total_money?: { amount?: number };
    metadata?: Record<string, string>;
    tenders?: unknown[];
    net_amount_due_money?: { amount?: number };
  };

  const orders: SquareOrder[] = [];
  let cursor: string | undefined;
  do {
    const res = await fetch(`${base}/v2/orders/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": SQUARE_VERSION,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        location_ids: [locationId],
        limit: 500,
        ...(cursor ? { cursor } : {}),
        query: {
          filter: {
            // NOT completed-only. A paid payment link lands in state OPEN, and
            // filtering on COMPLETED reports zero for every real gift — the
            // worst possible failure for a report a Treasurer trusts. DRAFT is
            // an abandoned checkout and stays out.
            state_filter: { states: ["OPEN", "COMPLETED"] },
            // created_at, because an OPEN order has no closed_at.
            date_time_filter: { created_at: { start_at: sinceISO, end_at: untilISO } },
          },
          sort: { sort_field: "CREATED_AT", sort_order: "ASC" },
        },
      }),
    });
    const json = (await res.json()) as {
      orders?: SquareOrder[];
      cursor?: string;
      errors?: Array<{ code?: string; detail?: string }>;
    };
    if (json.errors?.length) {
      throw new Error(
        json.errors.map((e) => `${e.code}: ${e.detail ?? ""}`).join("; "),
      );
    }
    orders.push(...(json.orders ?? []));
    cursor = json.cursor;
  } while (cursor);

  const rows = new Map<string, ReportRow>();
  let skippedTests = 0;
  let unattributedCents = 0;

  for (const o of orders) {
    const md = o.metadata ?? {};
    // Board test gifts tag themselves. They are real charges in a real
    // account and must never reach an allocation.
    if (md.test === "true") {
      skippedTests += 1;
      continue;
    }
    const gross = o.total_money?.amount ?? 0;
    if (!gross) continue;
    // Money actually taken, not merely an order in a hopeful state.
    const paid =
      (o.tenders?.length ?? 0) > 0 || (o.net_amount_due_money?.amount ?? 1) === 0;
    if (!paid) continue;

    const key =
      md.designation ??
      (md.kind === "sponsorship" ? `sponsorship:${md.tier ?? "?"}` : null);
    if (!key) {
      // Taken at this location outside the website — an invoice, a card reader.
      unattributedCents += gross;
      continue;
    }

    const row =
      rows.get(key) ??
      ({
        key,
        kind: md.kind ?? "?",
        count: 0,
        grossCents: 0,
        toTeamCents: 0,
        toGeneralCents: 0,
        levels: [],
        sports: [],
      } satisfies ReportRow);

    row.count += 1;
    row.grossCents += gross;
    if (md.level && !row.levels.includes(md.level)) row.levels.push(md.level);
    for (const s of (md.sports ?? "").split(",").filter(Boolean)) {
      if (!row.sports.includes(s)) row.sports.push(s);
    }
    rows.set(key, row);
  }

  // A general-fund gift and a business sponsorship are not split — both go to
  // the club rather than to one team's allocation.
  for (const row of rows.values()) {
    const splits = row.kind === "donation" && row.key !== "general";
    row.toTeamCents = splits ? Math.round(row.grossCents * TEAM_SHARE) : 0;
    row.toGeneralCents = row.grossCents - row.toTeamCents;
  }

  const sorted = [...rows.values()].sort((a, b) => b.grossCents - a.grossCents);
  return {
    environment,
    since: sinceISO,
    until: untilISO,
    rows: sorted,
    totals: {
      count: sorted.reduce((n, r) => n + r.count, 0),
      grossCents: sorted.reduce((n, r) => n + r.grossCents, 0),
      toTeamCents: sorted.reduce((n, r) => n + r.toTeamCents, 0),
      toGeneralCents: sorted.reduce((n, r) => n + r.toGeneralCents, 0),
    },
    skippedTests,
    unattributedCents,
  };
}

export function reportToCsv(report: Report): string {
  const money = (c: number) => (c / 100).toFixed(2);
  return [
    "designation,kind,gifts,gross_usd,to_team_usd,to_general_usd,levels,sports",
    ...report.rows.map((r) =>
      [
        r.key,
        r.kind,
        r.count,
        money(r.grossCents),
        money(r.toTeamCents),
        money(r.toGeneralCents),
        `"${r.levels.join("; ")}"`,
        `"${r.sports.join("; ")}"`,
      ].join(","),
    ),
  ].join("\n") + "\n";
}


type Team = { slug: string; name: string; gender?: string };

/** Turns a metadata key back into something a Treasurer recognises.
 *
 *  Lives here rather than in the page because the weekly email needs the same
 *  labels — a report that says "Volleyball (Girls)" on screen and
 *  "girls-volleyball" in the inbox is two reports to trust instead of one. */
export function designationLabel(key: string): string {
  if (key === "general") return "SLOTAB General Fund";
  if (key.startsWith("sponsorship:")) {
    const tier = sponsorTierById(key.slice("sponsorship:".length));
    return tier ? `${tier.name} (sponsorship)` : "Business sponsorship";
  }
  const team = (teamsData.teams as Team[]).find((t) => t.slug === key);
  if (!team) return key;
  return !team.gender || team.gender === "Co-ed"
    ? team.name
    : `${team.name} (${team.gender})`;
}
