#!/usr/bin/env node
// Per-sport donation report from Square, for the Treasurer.
//
// WHY THIS EXISTS
// Trina reconciles from a QuickBooks connector, not from Square's own
// reporting — and that changes what the site's designation work is worth to
// her. The common Square→QuickBooks connectors post a **daily summary
// invoice** with no line detail, and Intuit's own guidance is that customer
// names and emails are not imported at all. So the sport a donor chose, which
// the site works hard to put into the transaction (#144, #160), very likely
// never reaches the ledger she works in.
//
// That leaves a gap nothing filled: the club promises donors **75% to their
// sport, 25% to shared programs**, and somebody has to turn a month of
// payments into those allocations. This script does it.
//
// It reads `metadata`, not the line item name. Names are for humans and have
// changed twice already (gendered squads in #145, the level suffix in #160);
// `metadata.designation` and `metadata.level` are stable fields we control,
// which is what a report should key on.
//
// Read-only. It creates nothing and changes nothing in Square.
//
// Usage:
//   npm run square-report                      # current month
//   npm run square-report -- --since 2026-07-01 --until 2026-07-31
//   npm run square-report -- --csv report.csv

import fs from "node:fs";
import path from "node:path";

const SQUARE_VERSION = "2025-06-18";
const TEAM_SHARE = 0.75; // the split promised at the point of donation

// Plain `node` doesn't read .env.local the way Next does, and the Treasurer
// shouldn't have to export variables by hand.
function loadEnvLocal() {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    const [, k, raw] = m;
    if (process.env[k]) continue; // a real env var always wins
    process.env[k] = raw.replace(/^["']|["']$/g, "");
  }
}

function arg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

function monthBounds() {
  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return [first.toISOString(), next.toISOString()];
}

const money = (cents) =>
  (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });

async function main() {
  loadEnvLocal();
  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID;
  const environment = process.env.SQUARE_ENVIRONMENT ?? "sandbox";
  if (!token || !locationId) {
    console.error(
      "SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID must be set (in .env.local or the environment).",
    );
    process.exit(1);
  }
  const base =
    environment === "production"
      ? "https://connect.squareup.com"
      : "https://connect.squareupsandbox.com";

  const [defSince, defUntil] = monthBounds();
  const since = new Date(arg("since", defSince)).toISOString();
  const until = new Date(arg("until", defUntil)).toISOString();

  // Which orders count as "a donation actually happened".
  //
  // Not COMPLETED-only, which was the first cut and was wrong: a paid payment
  // link lands in state **OPEN**, not COMPLETED — confirmed by running a
  // sandbox payment through and watching the panel report `Order state OPEN`.
  // Filtering on COMPLETED would have silently reported zero for every real
  // gift, which is the worst kind of wrong for a report a Treasurer trusts.
  //
  // DRAFT is the state a payment link sits in until somebody pays, so those
  // are abandoned checkouts and must stay out. Belt and braces, each order is
  // then checked for an actual tender below — state alone is Square's
  // bookkeeping, a tender is money.
  //
  // Dated on `created_at` rather than `closed_at` for the same reason: an OPEN
  // order has no `closed_at`, so that filter would have excluded them too.
  const orders = [];
  let cursor;
  do {
    const res = await fetch(`${base}/v2/orders/search`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Square-Version": SQUARE_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        location_ids: [locationId],
        limit: 500,
        ...(cursor ? { cursor } : {}),
        query: {
          filter: {
            state_filter: { states: ["OPEN", "COMPLETED"] },
            date_time_filter: { created_at: { start_at: since, end_at: until } },
          },
          sort: { sort_field: "CREATED_AT", sort_order: "ASC" },
        },
      }),
    });
    const json = await res.json();
    if (json.errors) {
      console.error("Square error:", JSON.stringify(json.errors, null, 2));
      process.exit(1);
    }
    orders.push(...(json.orders ?? []));
    cursor = json.cursor;
  } while (cursor);

  const rows = new Map();
  let skippedTests = 0;
  let unattributed = 0;

  for (const o of orders) {
    const md = o.metadata ?? {};
    // Board test gifts tag themselves (#153). They are real charges in a real
    // account and must never reach a Treasurer's allocation.
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

    const key = md.designation ?? (md.kind === "sponsorship" ? `sponsorship:${md.tier ?? "?"}` : null);
    if (!key) {
      // Anything paid outside this site — a Square invoice, a terminal sale.
      unattributed += gross;
      continue;
    }
    const row = rows.get(key) ?? { key, kind: md.kind ?? "?", count: 0, gross: 0, levels: new Set() };
    row.count += 1;
    row.gross += gross;
    if (md.level) row.levels.add(md.level);
    rows.set(key, row);
  }

  const sorted = [...rows.values()].sort((a, b) => b.gross - a.gross);
  const totalGross = sorted.reduce((n, r) => n + r.gross, 0);

  console.log(`\nSLOTAB donations via the website — ${environment}`);
  console.log(`${since.slice(0, 10)} to ${until.slice(0, 10)}\n`);
  if (!sorted.length) {
    console.log("  No completed website transactions in this period.\n");
  } else {
    console.log(
      `  ${"designation".padEnd(24)}${"gifts".padStart(6)}${"gross".padStart(13)}${"to team (75%)".padStart(16)}${"to general (25%)".padStart(18)}`,
    );
    console.log("  " + "-".repeat(75));
    let teamTotal = 0;
    let generalTotal = 0;
    for (const r of sorted) {
      // A general-fund gift and a business sponsorship are not split; both go
      // to the club rather than to one team's allocation.
      const splits = r.kind === "donation" && r.key !== "general";
      const toTeam = splits ? Math.round(r.gross * TEAM_SHARE) : 0;
      const toGeneral = r.gross - toTeam;
      teamTotal += toTeam;
      generalTotal += toGeneral;
      console.log(
        `  ${r.key.padEnd(24)}${String(r.count).padStart(6)}${money(r.gross).padStart(13)}${(toTeam ? money(toTeam) : "—").padStart(16)}${money(toGeneral).padStart(18)}`,
      );
    }
    console.log("  " + "-".repeat(75));
    console.log(
      `  ${"TOTAL".padEnd(24)}${String(sorted.reduce((n, r) => n + r.count, 0)).padStart(6)}${money(totalGross).padStart(13)}${money(teamTotal).padStart(16)}${money(generalTotal).padStart(18)}`,
    );
  }

  console.log("");
  if (skippedTests) console.log(`  Excluded ${skippedTests} board test transaction(s) — see #153.`);
  if (unattributed) {
    console.log(
      `  ${money(unattributed)} taken at this location outside the website (invoices, in-person). Not allocated here.`,
    );
  }
  console.log(
    "  Gross, before Square's processing fees — those land in QuickBooks separately.\n",
  );

  const csvPath = arg("csv");
  if (csvPath) {
    const lines = [
      "designation,kind,gifts,gross_usd,to_team_usd,to_general_usd,levels",
      ...sorted.map((r) => {
        const splits = r.kind === "donation" && r.key !== "general";
        const toTeam = splits ? Math.round(r.gross * TEAM_SHARE) : 0;
        return [
          r.key,
          r.kind,
          r.count,
          (r.gross / 100).toFixed(2),
          (toTeam / 100).toFixed(2),
          ((r.gross - toTeam) / 100).toFixed(2),
          `"${[...r.levels].join("; ")}"`,
        ].join(",");
      }),
    ];
    fs.writeFileSync(csvPath, lines.join("\n") + "\n");
    console.log(`  CSV written to ${csvPath}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
