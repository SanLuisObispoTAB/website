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
import {
  sponsorTierById,
  GENERAL_MEMBERSHIPS,
  SPONSOR_TIERS,
} from "../app/data/sponsor-tiers";
import { specialFund, isUnsplitDesignation } from "../app/data/special-funds";

const SQUARE_VERSION = "2025-06-18";
const TEAM_SHARE = 0.75;

export type ReportRow = {
  /** Team slug, "general", a named fund ("hall-of-fame"), or
   *  "sponsorship:<tier>". */
  key: string;
  kind: string;
  count: number;
  grossCents: number;
  toTeamCents: number;
  toGeneralCents: number;
  levels: string[];
  sports: string[];
  /** The Treasurer's QuickBooks class for this row, where one exists — today
   *  only the named funds have one ("Donation: Hall of Fame"). Carried so the
   *  report names the class she posts to instead of a slug she has to
   *  translate. Empty for teams and sponsorships, which have no separate
   *  class. */
  qbClass: string;
};

/** A gift recorded at a general-membership level that nonetheless designated a
 *  team — the combination Erik ruled out on 2026-08-27 ("none of the general
 *  memberships are allowed to designate a sport").
 *
 *  This is a REPORT, not a correction. It changes no allocation and touches
 *  nothing in Square; the money stays exactly where the checkout put it until
 *  the board says otherwise (#203). It exists because the affected gifts could
 *  not be listed from the repo at all — donations live only in Square, and the
 *  credentials are Vercel-only — so the honest answer to "which ones?" had to
 *  be a page that asks Square, not a list written down once and left to rot.
 *
 *  NO DONOR NAMES. The order id is enough to open the gift in Square, where
 *  the name already is, and this page has never held a list of donor names.
 *  Adding one to answer a reporting question is not a trade worth making. */
export type FlaggedGift = {
  /** Square order id — paste into Square to find the gift and its donor. */
  orderId: string;
  /** Team slug the gift was designated to. */
  designation: string;
  /** The general-membership level it was recorded at. */
  level: string;
  grossCents: number;
  toTeamCents: number;
  /** ISO timestamp from Square, when the order carries one. */
  createdAt?: string;
};

/** Level names that may not designate a sport.
 *
 *  Keyed on the ALLOWANCE, not on which half of the sheet a level sits in
 *  (#215). The plan flagged this as a boundary worth confirming: the old set
 *  was the three general memberships, which happened to be the same thing
 *  while Tiger Pride and Varsity carried `sportsCredit: 0`. The board has since
 *  given both of them 1, so the two definitions have come apart — and the one
 *  that means what the report is actually asking is "levels that may not
 *  designate", which is this.
 *
 *  Follows the board without an edit either way: set a sponsorship tier back to
 *  zero and its gifts start being flagged; give a general membership an
 *  allowance and they stop. */
const GENERAL_LEVEL_NAMES = new Set(
  [...SPONSOR_TIERS, ...GENERAL_MEMBERSHIPS]
    .filter((t) => t.sportsCredit === 0)
    .map((t) => t.name),
);

/** Does this gift combine a general-membership level with a team designation —
 *  the combination the board's rule forbids?
 *
 *  Exported and pure so it can be exercised without a Square account. The
 *  alternative was a four-clause condition buried inside a function that only
 *  runs against the live API, which is the same as untested.
 *
 *  `isUnsplitDesignation` rather than a team lookup, deliberately: it is the
 *  identical test `allocateCents` uses to decide whether 75% left the general
 *  pot, so a gift is flagged exactly when money actually reached a team. A
 *  named fund (the Hall of Fame) is NOT a team and must not be flagged — it
 *  keeps 100%, and reporting it as a misdesignation would send the board
 *  chasing a gift that behaved correctly. */
export function isMisdesignatedGift(
  md: { kind?: string; level?: string },
  designationKey: string,
): boolean {
  return (
    md.kind === "donation" &&
    Boolean(md.level) &&
    GENERAL_LEVEL_NAMES.has(md.level as string) &&
    !isUnsplitDesignation(designationKey)
  );
}

export type Report = {
  environment: string;
  since: string;
  until: string;
  rows: ReportRow[];
  totals: { count: number; grossCents: number; toTeamCents: number; toGeneralCents: number };
  skippedTests: number;
  unattributedCents: number;
  /** Gifts at a general-membership level that designated a team — see
   *  `FlaggedGift`. Empty is the healthy state. */
  flagged: FlaggedGift[];
};

export function defaultRange(now = new Date()): { since: string; until: string } {
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return { since: first.toISOString(), until: next.toISOString() };
}

/** One Square order, in the shape both consumers actually read.
 *
 *  Exported because the donor wall needs the same orders the Treasurer's report
 *  reads — see `lib/donor-wall.ts`. */
export type SquareOrder = {
  /** Needed by the donor wall, which joins payments to orders on this. */
  id?: string;
  total_money?: { amount?: number };
  metadata?: Record<string, string>;
  tenders?: unknown[];
  net_amount_due_money?: { amount?: number };
  created_at?: string;
};

/** Every order at this location in a window, following Square's cursor.
 *
 *  Pulled out of `buildSquareReport` when the donor wall became a second
 *  consumer (#197). The filter choices here are load-bearing and were paid for
 *  once already: **not** completed-only, because a paid payment link lands in
 *  state OPEN and filtering on COMPLETED reports zero for every real gift; and
 *  `created_at` rather than `closed_at`, because an OPEN order has no
 *  `closed_at`. Copying this loop instead of sharing it is how the two
 *  surfaces would eventually disagree about which gifts exist. */
export async function searchOrders(
  base: string,
  token: string,
  locationId: string,
  sinceISO: string,
  untilISO: string,
): Promise<SquareOrder[]> {
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
            state_filter: { states: ["OPEN", "COMPLETED"] },
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
  return orders;
}

/** One Square payment, in the shape the donor wall reads.
 *
 *  Payments and orders carry different halves of what a donor wall needs, and
 *  neither alone is enough: the ORDER has our metadata (designation, and since
 *  #196 the typed name and wall preference), while the PAYMENT has the
 *  cardholder name and email address. For every gift taken before #196 the
 *  payment is the *only* place a name exists at all. */
export type SquarePayment = {
  id?: string;
  status?: string;
  created_at?: string;
  order_id?: string;
  amount_money?: { amount?: number };
  buyer_email_address?: string;
  billing_address?: { first_name?: string; last_name?: string };
  shipping_address?: { first_name?: string; last_name?: string };
};

/** Every payment at this location in a window, following Square's cursor.
 *
 *  Separate call from `searchOrders` because Square models them separately and
 *  `orders/search` returns no buyer identity whatsoever. The donor wall joins
 *  the two on `order_id` — see `lib/donor-wall.ts`. */
export async function searchPayments(
  base: string,
  token: string,
  locationId: string,
  sinceISO: string,
  untilISO: string,
): Promise<SquarePayment[]> {
  const payments: SquarePayment[] = [];
  let cursor: string | undefined;
  do {
    const url = new URL(`${base}/v2/payments`);
    url.searchParams.set("location_id", locationId);
    url.searchParams.set("begin_time", sinceISO);
    url.searchParams.set("end_time", untilISO);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": SQUARE_VERSION,
      },
      cache: "no-store",
    });
    const json = (await res.json()) as {
      payments?: SquarePayment[];
      cursor?: string;
      errors?: Array<{ code?: string; detail?: string }>;
    };
    if (json.errors?.length) {
      throw new Error(
        json.errors.map((e) => `${e.code}: ${e.detail ?? ""}`).join("; "),
      );
    }
    payments.push(...(json.payments ?? []));
    cursor = json.cursor;
  } while (cursor);
  return payments;
}

/** Square's API host for the configured environment, plus the credentials.
 *  Shared so both consumers fail the same way when Square isn't configured. */
export function squareCreds(): { token: string; locationId: string; base: string; environment: string } {
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!token || !locationId) throw new Error("Square is not configured");
  return {
    token,
    locationId,
    environment,
    base:
      environment === "production"
        ? "https://connect.squareup.com"
        : "https://connect.squareupsandbox.com",
  };
}

export async function buildSquareReport(
  sinceISO: string,
  untilISO: string,
): Promise<Report> {
  const { token, locationId, base, environment } = squareCreds();

  const orders = await searchOrders(base, token, locationId, sinceISO, untilISO);

  const rows = new Map<string, ReportRow>();
  const flagged: FlaggedGift[] = [];
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
        // Read off our own fund table rather than the order metadata: a gift
        // taken before the class existed still belongs to it, and the class is
        // a property of the fund, not of the transaction.
        qbClass: specialFund(key)?.qbClass ?? "",
      } satisfies ReportRow);

    // Flagged in the same pass as the allocation, over the same filters, so
    // the list and the totals can never describe different sets of gifts —
    // a gift excluded as a test or an unpaid order is excluded from both.
    if (isMisdesignatedGift(md, key)) {
      flagged.push({
        orderId: o.id ?? "",
        designation: key,
        level: md.level,
        grossCents: gross,
        toTeamCents: allocateCents(key, md.kind, gross).toTeamCents,
        createdAt: o.created_at,
      });
    }

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
    const split = allocateCents(row.key, row.kind, row.grossCents);
    row.toTeamCents = split.toTeamCents;
    row.toGeneralCents = split.toGeneralCents;
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
    // Newest first: the board is working through recent gifts, and the one
    // that surfaced this is today's.
    flagged: flagged.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? "")),
  };
}

/** How one gift divides between its designation and the shared pot.
 *
 *  Exported because two surfaces now state the split to a human — the
 *  Treasurer's report and the donation notification the Membership VP gets the
 *  moment a gift lands (#187) — and a second copy of this arithmetic is a
 *  second answer to "how much went to Water Polo".
 *
 *  A named fund keeps 100% too, which is why the test is `isUnsplitDesignation`
 *  and not `key === "general"`. Testing only for the general fund is what would
 *  quietly book three quarters of a Hall of Fame gift against a team.
 */
export function allocateCents(
  designationKey: string,
  kind: string,
  grossCents: number,
): { toTeamCents: number; toGeneralCents: number } {
  const splits = kind === "donation" && !isUnsplitDesignation(designationKey);
  const toTeamCents = splits ? Math.round(grossCents * TEAM_SHARE) : 0;
  return { toTeamCents, toGeneralCents: grossCents - toTeamCents };
}

export function reportToCsv(report: Report): string {
  const money = (c: number) => (c / 100).toFixed(2);
  return [
    "designation,kind,gifts,gross_usd,to_team_usd,to_general_usd,levels,sports,quickbooks_class",
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
        `"${r.qbClass}"`,
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
  const fund = specialFund(key);
  if (fund) return fund.label;
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
