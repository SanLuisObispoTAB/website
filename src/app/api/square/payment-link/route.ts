import { NextResponse } from "next/server";
import teamsData from "../../../data/teams.json";
import { sponsorTierById, levelForGift } from "../../../data/sponsor-tiers";
import {
  createPaymentLink,
  SquareError,
  isSquareConfigured,
  isPreviewUnlock,
  isPublicCheckoutEnabled,
} from "../../../../lib/square";
import { rateLimit, clientKey } from "../../../../lib/rate-limit";

// Mints a Square-hosted checkout link with the amount and the designation
// already set. Replaces the interim storefront handoff from #140, where the
// donor arrived at a generic item and had to re-enter their own amount against
// a set of preset buttons that didn't match ours.
//
// THE RULE THIS FILE EXISTS TO ENFORCE: a price is never accepted from the
// browser unless the browser is *allowed* to choose it.
//   - Sponsorships have a fixed published price, so the client sends a tier id
//     and the server looks up what that tier costs. A posted amount would be a
//     posted price, and #143 is a live example of what a mispriced sponsorship
//     costs the club.
//   - Donations are variable by nature — the donor really does choose. So the
//     amount is accepted, but bounded, and the floor matches the published one.

export const runtime = "nodejs";
// Never prerender or cache: every response is a distinct one-shot checkout URL.
export const dynamic = "force-dynamic";

type Team = { slug: string; name: string; gender?: string };
const TEAMS = teamsData.teams as Team[];

/** The name as the donor saw it in the dropdown — and therefore the name that
 *  must reach Square.
 *
 *  `name` alone is ambiguous for **16 of the teams**: eight sports field a boys'
 *  and a girls' squad under one name (Volleyball, Tennis, Swim & Dive, Water
 *  Polo, Basketball, Soccer, Golf, Wrestling). Billing both as "Volleyball —
 *  SLOTAB donation" would leave the Treasurer unable to tell them apart in
 *  Square's item reporting, which is the precise failure this integration
 *  exists to remove — #140 had to warn donors about exactly this collapse on
 *  the old storefront.
 *
 *  Mirrors the label built in `DonateForm`, so the string on the receipt is the
 *  string the donor chose. Co-ed and gender-less teams (Tiger Cheer, #122) show
 *  the bare name with no empty parenthetical. */
function teamDisplayName(team: Team): string {
  return !team.gender || team.gender === "Co-ed"
    ? team.name
    : `${team.name} (${team.gender})`;
}

// Published floors, from #29/#30. The ceiling is not a policy limit — it is a
// fat-finger and abuse guard. A genuine six-figure gift should reach the
// Treasurer directly, not go through a web form.
const MIN_CENTS = 25_00;
const MAX_CENTS = 50_000_00;

// Nuisance-tier throttle; see the honesty note in lib/rate-limit.ts.
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function siteOrigin(req: Request): string {
  // In production the origin is pinned rather than taken from the request:
  // `redirect_url` is where Square sends a paying donor, so a spoofable Host
  // header would be an open redirect with a captive audience.
  if (process.env.NODE_ENV === "production") {
    return process.env.SITE_URL ?? "https://slotab.org";
  }
  try {
    return new URL(req.url).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/** Square requires a country code on `buyer_phone_number` and rejects anything
 *  else outright — tested against the sandbox: `+18055551212` and
 *  `18055551212` are accepted (both normalised to `+1…`), while
 *  `8055551212`, `805-555-1212` and `(805) 555-1212` all fail with
 *  `INVALID_PHONE_NUMBER`. Our field is free text, so the format a parent
 *  actually types is exactly the one Square refuses.
 *
 *  A rejection costs the *whole* prefill — Square fails the request and the
 *  retry drops every prefilled field — so the donor would lose their prefilled
 *  email too, over a phone number. Hence normalising here rather than relying
 *  on that safety net.
 *
 *  Deliberately conservative: US/Canada 10-digit numbers get +1, an explicit
 *  international number is passed through, and anything we cannot confidently
 *  assign a country code to is dropped. A missing prefill is a small loss; a
 *  guessed country code on someone's phone number is a wrong one. */
function normalisePhone(raw: string): string | undefined {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return undefined;

  let e164: string | undefined;
  if (trimmed.startsWith("+")) e164 = `+${digits}`;
  else if (digits.length === 10) e164 = `+1${digits}`;
  else if (digits.length === 11 && digits.startsWith("1")) e164 = `+${digits}`;

  if (!e164) return undefined;
  // Square's cap, and a sanity floor — no real number is under 8 digits.
  return e164.length <= 17 && digits.length >= 8 ? e164 : undefined;
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  // Peeked before the main parse so the configured-check can account for it.
  // A request carrying the correct preview slug may use sandbox credentials on
  // the live site; nothing else may.
  let previewUnlock = false;
  let parsed: Record<string, unknown> | null = null;
  try {
    parsed = (await req.json()) as Record<string, unknown>;
    previewUnlock = isPreviewUnlock(parsed.previewToken);
  } catch {
    parsed = null;
  }

  // A preview request only needs working credentials. A public request also
  // needs the launch flag — see `isPublicCheckoutEnabled`.
  const allowed = previewUnlock
    ? isSquareConfigured(true)
    : isPublicCheckoutEnabled();
  if (!allowed) {
    // Explicit and distinguishable, so the client can fall back to the old
    // storefront rather than showing a donor a dead button. This also fires
    // when the live site is holding *sandbox* credentials, which is the case
    // between shipping this and the production token arriving — see the guard
    // in lib/square.ts for why that must never mint a link.
    return bad("Square is not configured", 503);
  }

  const limited = rateLimit(clientKey(req), RATE_LIMIT, RATE_WINDOW_MS);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfter) } },
    );
  }

  if (!parsed) return bad("Malformed request body");
  const body = parsed;

  const kind = body.kind;

  // Donor details, carried across so nobody retypes on Square what they just
  // typed on our page. Only shape checks here: Square does its own validation
  // and is stricter than we could usefully be, and a rejection there degrades
  // to no prefill rather than failing the gift.
  const rawEmail = typeof body.email === "string" ? body.email.trim() : "";
  const buyerEmail =
    rawEmail.length <= 256 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
      ? rawEmail
      : undefined;

  const buyerPhone = normalisePhone(
    typeof body.phone === "string" ? body.phone : "",
  );

  // Square has no single name field; the name rides in buyer_address. Split on
  // the last space so "Mary Anne Ramberg" keeps "Mary Anne" as the given name,
  // and a mononym still fills something rather than nothing.
  const rawName = typeof body.name === "string" ? body.name.trim() : "";
  const nameParts = rawName.split(/\s+/).filter(Boolean);
  const buyerLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : undefined;
  const buyerFirstName = nameParts.length
    ? nameParts.slice(0, nameParts.length > 1 ? -1 : undefined).join(" ")
    : undefined;

  let lineItemName: string;
  let amountCents: number;
  let note: string;
  const metadata: Record<string, string> = { source: "slotab-website" };

  if (kind === "sponsorship") {
    const tier = typeof body.tierId === "string" ? sponsorTierById(body.tierId) : undefined;
    if (!tier) return bad("Unknown sponsorship tier");

    // Server-derived. The request said which tier, not what it costs.
    amountCents = tier.annual * 100;
    lineItemName = `${tier.name} — 2026-27 business sponsorship`;
    note = `SLOTAB business sponsorship — ${tier.name} ($${tier.annual}/year)`;
    metadata.kind = "sponsorship";
    metadata.tier = tier.id;
  } else if (kind === "donation") {
    const designation = typeof body.designation === "string" ? body.designation : "";
    const isGeneral = designation === "general";
    const team = TEAMS.find((t) => t.slug === designation);
    if (!isGeneral && !team) return bad("Unknown designation");

    const raw = body.amountCents;
    if (typeof raw !== "number" || !Number.isInteger(raw)) {
      return bad("Amount must be a whole number of cents");
    }
    if (raw < MIN_CENTS || raw > MAX_CENTS) {
      return bad(
        `Amount must be between $${MIN_CENTS / 100} and $${(MAX_CENTS / 100).toLocaleString()}`,
      );
    }

    amountCents = raw;
    const label = team ? teamDisplayName(team) : "";

    // The level goes in the NAME because Square's hosted checkout renders
    // nothing else. Tested against the sandbox: `variation_name` and the line
    // item `note` are both accepted by the API and both invisible to the
    // buyer, even with the order summary expanded; and moving the level to a
    // second $0 line item replaces the heading with a generic "Checkout",
    // losing the sport from the top entirely. Name or nothing.
    //
    // The cost is that Square's item-sales report now keys on sport *and*
    // level, so a designation can appear under several names. Mitigated by
    // carrying the level in `metadata` as well — invisible to a donor, but the
    // clean field for the reconciliation sidetool to group on, which is where
    // per-sport totals should come from anyway (see #144).
    const level = levelForGift(raw / 100);
    const levelSuffix = level ? ` (${level})` : "";

    lineItemName = isGeneral
      ? `SLOTAB General Fund — donation${levelSuffix}`
      : `${label} — SLOTAB donation${levelSuffix}`;
    note = isGeneral
      ? `SLOTAB General Fund donation${level ? ` — ${level} level` : ""}`
      : `SLOTAB donation designated ${label} (75% team / 25% general fund)${level ? ` — ${level} level` : ""}`;
    metadata.kind = "donation";
    metadata.designation = designation;
    if (level) metadata.level = level;
    if (!isGeneral) metadata.split = "75-25";
  } else {
    return bad("Unknown request kind");
  }

  // Mark anything minted through the preview route.
  //
  // Board review runs against PRODUCTION credentials, so a reviewer's test gift
  // is a real charge sitting in the real Square account, indistinguishable from
  // a parent's donation — which is how a $25 test ends up booked as revenue and
  // never refunded. The marker goes in the payment note and metadata, NOT in
  // the line item: Erik asked for the review to look exactly like production,
  // and a "[TEST]" prefix on the checkout heading would defeat that. The note
  // is visible on the payment in the Square dashboard, which is where whoever
  // reconciles will be looking.
  if (previewUnlock) {
    note = `*** TEST — board review, refund this *** ${note}`;
    metadata.test = "true";
  }

  const origin = siteOrigin(req);
  const redirectUrl = new URL("/thank-you", origin);
  redirectUrl.searchParams.set("kind", String(metadata.kind));
  if (metadata.tier) redirectUrl.searchParams.set("tier", metadata.tier);
  if (metadata.designation) {
    redirectUrl.searchParams.set("designation", metadata.designation);
  }

  try {
    const link = await createPaymentLink(
      {
        lineItemName,
        amountCents,
        note,
        metadata,
        buyerEmail,
        buyerPhone,
        buyerFirstName,
        buyerLastName,
        redirectUrl: redirectUrl.toString(),
      },
      { previewUnlock },
    );
    return NextResponse.json({ url: link.url }, { status: 200 });
  } catch (err) {
    // Square's message can name the offending field; that is useful in a log
    // and meaningless to a donor, so it is split.
    console.error("[square] payment link failed:", err);
    if (err instanceof SquareError) {
      return bad("Could not start checkout — please try again.", 502);
    }
    return bad("Could not start checkout — please try again.", 500);
  }
}
