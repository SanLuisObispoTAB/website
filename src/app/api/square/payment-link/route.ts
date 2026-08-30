import { NextResponse } from "next/server";
import teamsData from "../../../data/teams.json";
import { sponsorTierById, levelForGift } from "../../../data/sponsor-tiers";
import { specialFund, fundLevelForAmount } from "../../../data/special-funds";
import {
  PASS_SEASONS,
  passLineLabel,
  passTypeById,
  type PassSeason,
  type PassSelection,
} from "../../../data/passes";
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

/** Game passes bundled onto a gift — the add-on Trina asked for (#208), now
 *  billable on the same order (#214).
 *
 *  THE RULE, SAME AS EVERY OTHER PRICE HERE: the client names a pass and a
 *  quantity, and the server looks up what that pass costs. A posted price would
 *  be a posted price. `maxQty` is enforced here too, not just in the stepper —
 *  a disabled button is a courtesy, not a control.
 *
 *  A season is REQUIRED for a pass that needs one. An order for "a Single
 *  Season Pass, season unspecified" is one the club cannot fulfil: somebody
 *  would have to print a pass and guess which season it was for. Rejected
 *  rather than defaulted, because a wrong guess reaches the gate. */
function parsePasses(
  raw: unknown,
): { ok: true; passes: PassSelection[] } | { ok: false; error: string } {
  if (raw === undefined) return { ok: true, passes: [] };
  if (!Array.isArray(raw)) return { ok: false, error: "Invalid pass selection" };
  const passes: PassSelection[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, error: "Invalid pass selection" };
    }
    const { passId, qty, season } = entry as Record<string, unknown>;
    const type = typeof passId === "string" ? passTypeById(passId) : undefined;
    if (!type) return { ok: false, error: `Unknown pass: ${String(passId)}` };
    if (passes.some((p) => p.passId === type.id)) {
      return { ok: false, error: `Duplicate pass: ${type.name}` };
    }
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1) {
      return { ok: false, error: `Invalid quantity for ${type.name}` };
    }
    if (qty > type.maxQty) {
      return {
        ok: false,
        error: `At most ${type.maxQty} of ${type.name} through this form — email us for a larger block`,
      };
    }
    if (type.needsSeason) {
      if (
        typeof season !== "string" ||
        !(PASS_SEASONS as readonly string[]).includes(season)
      ) {
        return { ok: false, error: `Choose a season for ${type.name}` };
      }
      passes.push({ passId: type.id, qty, season: season as PassSeason });
    } else {
      passes.push({ passId: type.id, qty });
    }
  }
  return { ok: true, passes };
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

  // Whether the donor is willing to be named on the donor wall. Absent means
  // absent: the notification says "not recorded" rather than reading a missing
  // flag as consent, because a name published against someone's wishes is the
  // one outcome in this flow that is awkward to undo.
  const displayOnWall =
    typeof body.displayOnWall === "boolean" ? body.displayOnWall : undefined;

  let lineItemName: string;
  let amountCents: number;
  let note: string;
  const metadata: Record<string, string> = { source: "slotab-website" };
  // Extra lines on the same order. Only donations carry passes today; a
  // sponsorship is a fixed package and adding to it would misprice the tier.
  let additionalItems: {
    name: string;
    quantity: number;
    amountCents: number;
  }[] = [];

  if (kind === "sponsorship") {
    const tier = typeof body.tierId === "string" ? sponsorTierById(body.tierId) : undefined;
    if (!tier) return bad("Unknown sponsorship tier");

    // Sports the sponsorship is credited to. The storefront has always offered
    // this and the integration did not, which would have been a regression the
    // day it replaced the storefront — a Champion sponsor entitled to credit
    // five sports could name none.
    //
    // Both the membership of this list and its length are checked here. The
    // client renders the limit from the same `sportsCredit` field, but a UI
    // that disables a checkbox is a courtesy, not a control: the perk is worth
    // real money, so the server decides how many a tier may claim.
    const rawSports = Array.isArray(body.sports) ? body.sports : [];
    const sports: string[] = [];
    for (const raw of rawSports) {
      if (typeof raw !== "string") return bad("Invalid sport selection");
      const team = TEAMS.find((t) => t.slug === raw);
      if (!team) return bad(`Unknown sport: ${raw}`);
      if (!sports.includes(raw)) sports.push(raw);
    }
    if (sports.length > tier.sportsCredit) {
      return bad(
        tier.sportsCredit === 0
          ? `${tier.name} sponsorships aren't credited to a specific sport`
          : `${tier.name} may be credited to at most ${tier.sportsCredit} sport${tier.sportsCredit === 1 ? "" : "s"}`,
      );
    }

    const sportLabels = sports.map((slug) =>
      teamDisplayName(TEAMS.find((t) => t.slug === slug)!),
    );

    // Square's checkout collects a *buyer* — a person with a card — and has
    // nowhere to record which business that person is paying for. Without this
    // the Treasurer gets a contact's name against a $5,000 sponsorship and has
    // to guess the company, so it goes in the note and the metadata.
    const businessName =
      typeof body.businessName === "string"
        ? body.businessName.trim().slice(0, 120)
        : "";

    // Server-derived. The request said which tier, not what it costs.
    amountCents = tier.annual * 100;
    lineItemName = `${tier.name} — 2026-27 business sponsorship`;
    note =
      `SLOTAB business sponsorship — ${tier.name} ($${tier.annual}/year)` +
      (businessName ? ` — ${businessName}` : "") +
      (sportLabels.length
        ? ` — credited to ${sportLabels.join(", ")}`
        : " — no sport designated");
    metadata.kind = "sponsorship";
    metadata.tier = tier.id;
    if (businessName) metadata.business = businessName;
    // Slugs, not labels: this is the field the Treasurer's report groups on,
    // and labels have already changed once this week.
    if (sports.length) metadata.sports = sports.join(",");
  } else if (kind === "donation") {
    const designation = typeof body.designation === "string" ? body.designation : "";
    const isGeneral = designation === "general";
    // A named fund (the Hall of Fame, #184) is a third kind of designation: it
    // is not a team, so there is no 75/25 split, and it is not the general
    // fund, so it must not be reported as one.
    const fund = specialFund(designation);
    const team = TEAMS.find((t) => t.slug === designation);
    if (!isGeneral && !fund && !team) return bad("Unknown designation");

    // Whose honour the gift is given in. Only accepted for a fund that offers
    // a tribute — otherwise it is free text on someone's receipt for no reason.
    // Trimmed and capped: it lands in a line the Treasurer reads, and Square
    // rejects an over-long note outright, which would kill the whole gift.
    const tribute =
      fund?.tribute && typeof body.tribute === "string"
        ? body.tribute.trim().replace(/\s+/g, " ").slice(0, 80)
        : "";

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

    // WHICH LADDER NAMES THIS GIFT.
    //
    // A named fund is a campaign of its own, so it is named off ITS ladder, not
    // off the membership one. Erik caught this the day the campaign page went
    // up: a $1,000 Hall of Fame gift reached Square reading "SLOHS Athletics
    // Hall of Fame Fund — donation (Tiger Pride)". Tiger Pride is a
    // sponsorship tier. The donor had clicked "Ceremony underwriter", was never
    // shown the word, and it was the first thing on their checkout page.
    //
    // The bug is older than the campaign page — the same suffix rode every Hall
    // of Fame gift made through `/donate?team=hall-of-fame` since #184. Giving
    // the fund its own page is what put it in front of somebody.
    //
    // `metadata.level` follows the same rule, so the Treasurer's report groups a
    // Hall of Fame row by the rungs the committee actually spends against. Safe
    // in both consumers, checked rather than assumed: `isMisdesignatedGift`
    // already excludes an unsplit designation, and the donation checklist
    // already suppresses every sponsorship question when a fund is set — a rung
    // name simply resolves to no membership perks, which is the correct answer
    // for a gift that buys an engraved award.
    const level = fund
      ? fundLevelForAmount(fund, raw / 100)
      : levelForGift(raw / 100);
    const levelSuffix = level ? ` (${level})` : "";

    if (fund) {
      // The rung IS the description here, so it replaces "donation" rather than
      // trailing it in brackets: "…Fund — Ceremony underwriter" reads as the
      // thing bought, which is what the fund's ladder is written to sell.
      lineItemName = `${fund.label} — ${level ?? "donation"}`;
      note =
        `${fund.label} — 100% to the fund, no team split` +
        (level ? ` — ${level}` : "") +
        // Trina's QuickBooks class, verbatim. The note is what shows on the
        // payment in the Square dashboard, which is where the reconciliation
        // actually happens.
        (fund.qbClass ? ` — QuickBooks: ${fund.qbClass}` : "") +
        (tribute ? ` — in honor of ${tribute}` : "");
    } else {
      lineItemName = isGeneral
        ? `SLOTAB General Fund — donation${levelSuffix}`
        : `${label} — SLOTAB donation${levelSuffix}`;
      note = isGeneral
        ? `SLOTAB General Fund donation${level ? ` — ${level} level` : ""}`
        : `SLOTAB donation designated ${label} (75% team / 25% general fund)${level ? ` — ${level} level` : ""}`;
    }
    metadata.kind = "donation";
    metadata.designation = designation;
    if (level) metadata.level = level;
    // The split marker is what the Treasurer's report keys the allocation on,
    // so it must be absent for anything that isn't split — a named fund keeps
    // 100%, same as a general gift.
    if (!isGeneral && !fund) metadata.split = "75-25";
    if (fund?.qbClass) metadata.qbClass = fund.qbClass;
    if (tribute) metadata.tribute = tribute;

    // ------------------------------------------------------- bundled passes
    const parsedPasses = parsePasses(body.passes);
    if (!parsedPasses.ok) return bad(parsedPasses.error);
    if (parsedPasses.passes.length) {
      additionalItems = parsedPasses.passes.map((sel) => {
        const type = passTypeById(sel.passId)!;
        return {
          // The season is in the NAME, not only in metadata, for the same
          // reason the designation is (#181): Square's hosted checkout renders
          // the line item name and nothing else, and "Single Season Pass" alone
          // is three different products to whoever issues it.
          name: passLineLabel(sel),
          quantity: sel.qty,
          // Server-side, per unit. Square multiplies by quantity.
          amountCents: type.price * 100,
        };
      });
      const passTotalCents = additionalItems.reduce(
        (sum, i) => sum + i.amountCents * i.quantity,
        0,
      );
      note +=
        ` — plus ${additionalItems
          .map((i) => `${i.quantity}× ${i.name}`)
          .join(", ")} ($${passTotalCents / 100})`;
      // ONE key, encoded, not one per pass type. Square caps order metadata at
      // ten pairs and a Hall of Fame gift already lands on ten; a key per pass
      // would push `designation` or `test` off the end, and those are what the
      // Treasurer's report is keyed on.
      //
      // Placed BEFORE the donor block below, so if anything is dropped by
      // `sanitizeMetadata` it is a phone number rather than the record of what
      // somebody paid for.
      metadata.passes = parsedPasses.passes
        .map((s) => `${s.passId}:${s.qty}${s.season ? `@${s.season}` : ""}`)
        .join(",");
    }
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

  // THE DONOR BLOCK — the fields Square's own notification stopped carrying.
  //
  // Added for #187. Since #181 a donation raises a Square *payment*
  // notification ("you got paid $75") rather than the storefront's *order*
  // notification, which named the item and the buyer; Square exposes no setting
  // to change either, so the Membership VP's notification has to be ours, built
  // from what the donor typed here. None of this is new exposure — the same
  // name and phone already go to Square as checkout prefill, one field over.
  //
  // Written LAST, and the order matters. Square caps order metadata at TEN
  // pairs, and a Hall of Fame gift carrying a level, a tribute and the test
  // marker lands on exactly ten with this block. `sanitizeMetadata` drops from
  // the end, so going last means an overflow costs a phone number in an email
  // rather than `designation` or `test` — the two keys the Treasurer's report
  // is keyed on. It logs loudly either way.
  if (rawName) metadata.donor = rawName.slice(0, 255);
  if (buyerPhone) metadata.phone = buyerPhone;
  // Only the answer that needs acting on is stored. "yes" is the default the
  // form ships with, and spending a capped metadata key to say "behave
  // normally" is the wrong trade.
  if (displayOnWall === false) metadata.wall = "no";


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
        ...(additionalItems.length ? { additionalItems } : {}),
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
