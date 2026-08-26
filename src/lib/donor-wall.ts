import {
  searchOrders,
  searchPayments,
  squareCreds,
  designationLabel,
  type SquarePayment,
} from "./square-report";
import { DONOR_WALL, donorKey, isOnWall, type Donor } from "../app/data/donors";

// Who is waiting to go on the donor wall, and who we are not allowed to add.
//
// THE DESIGN DECISION WORTH KNOWING
// There is **no pending-donors store**. Nothing is written when a gift lands.
// "Pending" is computed, every time, as:
//
//     donors Square says consented  −  donors already in donors.json
//
// That falls out of two facts. The webhook runs on Vercel, whose filesystem is
// read-only, so it could not write a queue even if we wanted one. And Square
// already holds the authoritative record — `metadata.donor` and `metadata.wall`
// are written at checkout (#187) and never change. A separate queue would be a
// second copy of a fact Square already owns, able to drift from it, and able to
// double-count when Square retries a webhook. Deriving instead makes the whole
// pipeline idempotent for free: confirm a donor into `donors.json` and they
// simply stop being pending.
//
// THE CONSENT BOUNDARY, WHICH IS THE POINT OF THIS FILE
// `metadata.wall` only exists on gifts minted since #187 deployed on
// 2026-08-24. Every gift before that carries no preference at all — not a
// "yes", not a "no", nothing. Those donors are separated out here rather than
// swept in, because absence of a recorded objection is not consent, and this
// repo is public: publishing a name is effectively permanent. They belong in
// the "ask first" bucket, which is what `needsAsking` is.

export type DonorCandidate = {
  /** The name to list. See `nameSource` for how much it can be trusted. */
  name: string;
  /** Where the name came from, which is also how much weight it carries.
   *  `typed` is the donor's own entry on our form and is what they meant to be
   *  called. `cardholder` is Square's billing name — often right, sometimes a
   *  spouse, a business, or "MR E A RAMBERG" in block capitals. A cardholder
   *  name should never reach a public page without a human reading it first. */
  nameSource: "typed" | "cardholder";
  /** For contacting them — never published on the wall. */
  email?: string;
  designation: string;
  designationLabel: string;
  amountCents: number;
  /** ISO, from the Square order. */
  when?: string;
};

export type DonorWallQueue = {
  environment: string;
  since: string;
  until: string;
  /** Consent recorded, not yet on the wall. Safe to add. */
  pending: DonorCandidate[];
  /** Gave before the preference was captured, so nobody knows. Must be asked. */
  needsAsking: DonorCandidate[];
  /** Explicitly opted out. Listed only so the board can see they were handled
   *  and never wonder whether they were missed. */
  optedOut: DonorCandidate[];
  /** Consented and already listed — the "nothing to do" pile, counted only. */
  alreadyListed: number;
  /** Gifts with no donor name in metadata at all, so nothing to offer. */
  unnamed: number;
};

/** The date #187 shipped, after which a donation carries a wall preference.
 *  Before it, silence means "never asked" rather than "declined". */
export const CONSENT_CAPTURED_FROM = "2026-08-24T00:00:00.000Z";

/** Build the queue from Square. Read-only: creates and changes nothing.
 *
 *  Joins PAYMENTS to ORDERS on `order_id`, because each holds half of what is
 *  needed and the older half is the one that matters: every gift taken before
 *  #196 has no `metadata.donor` at all, so the payment's billing name is the
 *  only record that a person with a name gave that money. Reading orders alone
 *  would report the entire back catalogue as anonymous, which is not the same
 *  thing as the donors having declined. */
export async function buildDonorWallQueue(
  sinceISO: string,
  untilISO: string,
): Promise<DonorWallQueue> {
  const { token, locationId, base, environment } = squareCreds();
  const [orders, payments] = await Promise.all([
    searchOrders(base, token, locationId, sinceISO, untilISO),
    searchPayments(base, token, locationId, sinceISO, untilISO),
  ]);

  // Index the orders' metadata by order id; payments carry the join key.
  const metaByOrder = new Map<string, Record<string, string>>();
  for (const o of orders) {
    if (o.id && o.metadata) metaByOrder.set(o.id, o.metadata);
  }

  const pending: DonorCandidate[] = [];
  const needsAsking: DonorCandidate[] = [];
  const optedOut: DonorCandidate[] = [];
  let alreadyListed = 0;
  let unnamed = 0;

  // A donor who gave twice is offered once. Keyed exactly as the wall compares
  // names, so "offered" and "already there" can never disagree.
  const seen = new Set<string>();

  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    const md = (p.order_id && metaByOrder.get(p.order_id)) || {};

    // Not a website donation: a card reader at a game, an invoice, or a
    // business sponsorship (which belongs on the sponsor wall, not this one).
    if (md.kind !== "donation") continue;
    // Board test charges are real money but not real donors.
    if (md.test === "true") continue;

    const gross = p.amount_money?.amount ?? 0;
    if (!gross) continue;

    const typed = (md.donor ?? "").trim();
    const cardholder = billingName(p);
    const name = typed || cardholder;
    if (!name) {
      // No name anywhere — nothing a wall could show.
      unnamed += 1;
      continue;
    }

    const candidate: DonorCandidate = {
      name,
      nameSource: typed ? "typed" : "cardholder",
      email: p.buyer_email_address,
      designation: md.designation ?? "general",
      designationLabel: designationLabel(md.designation ?? "general"),
      amountCents: gross,
      when: p.created_at,
    };

    if (md.wall === "no") {
      optedOut.push(candidate);
      continue;
    }

    if (isOnWall(name)) {
      alreadyListed += 1;
      continue;
    }

    const key = donorKey(name);
    if (seen.has(key)) continue;
    seen.add(key);

    // THE BOUNDARY. A gift from before the checkbox reached order metadata has
    // no preference to read, and reading "no key" as "yes" is the exact mistake
    // this design exists to refuse. `md.wall !== undefined` cannot appear here
    // (the key is only ever written on opt-out, handled above) but is kept as a
    // belt-and-braces check in case that ever changes.
    const consentRecorded =
      md.wall !== undefined || (p.created_at ?? "") >= CONSENT_CAPTURED_FROM;
    // A cardholder name is never auto-offered even inside the consent window:
    // the donor consented to *their* name being shown, not to whatever the card
    // says. Those go to the ask pile so a human reads them.
    (consentRecorded && candidate.nameSource === "typed" ? pending : needsAsking).push(
      candidate,
    );
  }

  const bySize = (a: DonorCandidate, b: DonorCandidate) => b.amountCents - a.amountCents;
  return {
    environment,
    since: sinceISO,
    until: untilISO,
    pending: pending.sort(bySize),
    needsAsking: needsAsking.sort(bySize),
    optedOut: optedOut.sort(bySize),
    alreadyListed,
    unnamed,
  };
}

/** The cardholder's name off a Square payment, when there is one. */
function billingName(p: SquarePayment): string {
  const addr = p.billing_address ?? p.shipping_address;
  return [addr?.first_name, addr?.last_name].filter(Boolean).join(" ").trim();
}

/** The `donors` array as it would read with every pending name added.
 *
 *  Rendered for the board to copy into Decap. A generated block beats hand
 *  typing names: this is the one place a typo becomes a person's name spelled
 *  wrong on a public page. */
export function proposedDonorsJson(pending: DonorCandidate[]): string {
  const merged: Donor[] = [
    ...DONOR_WALL.donors,
    ...pending.map((c) => ({ name: c.name })),
  ];
  const sortKey = (n: string) => {
    const parts = n.trim().split(/\s+/);
    return (parts[parts.length - 1] ?? n).toLowerCase();
  };
  merged.sort((a, b) => sortKey(a.name).localeCompare(sortKey(b.name)));
  return JSON.stringify({ season: DONOR_WALL.season, donors: merged }, null, 2);
}

/** A ready-to-send request for permission, for the donors who were never
 *  asked. Plain text, because it is going to be pasted into Gmail by a
 *  volunteer, and because it has to be readable on a phone. */
export function composeConsentRequest(c: DonorCandidate): {
  subject: string;
  text: string;
} {
  return {
    subject: "May we list your name on the SLOTAB Donor Wall?",
    text: [
      `Hi ${c.name.split(/\s+/)[0] || "there"},`,
      "",
      `Thank you for your gift to ${c.designationLabel} — it makes a real`,
      "difference to our student-athletes.",
      "",
      "We're putting together the SLOTAB Donor Wall on slotab.org, where we",
      "recognise the people who support the club. We'd love to include you.",
      "",
      "Your gift came in before we started asking this question, so we don't",
      "want to assume. Just reply with a yes and we'll add your name — or",
      "ignore this and we won't. Either is completely fine, and it makes no",
      "difference to your gift or your membership.",
      "",
      "We'd list your name only. No amounts, no contact details.",
      "",
      "Thank you again,",
      "SLO Tiger Athletic Booster Club",
    ].join("\n"),
  };
}
