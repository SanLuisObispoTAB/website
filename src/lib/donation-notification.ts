import { designationLabel, allocateCents } from "./square-report";
import { specialFund, isUnsplitDesignation } from "../app/data/special-funds";

// Composes the notification the Membership VP gets the moment a donation is
// paid for. Sibling of `sponsor-fulfilment.ts`, which does the same job for a
// business sponsorship.
//
// WHY THIS EXISTS
// Dannene wrote on 2026-08-23 that Square's notifications carry far less than
// they used to: "I am not getting enough information now when someone donates."
// She is right, and the cause is ours rather than Square's. Until #181 every
// donation went through the Square Online storefront, and a storefront sale
// raises an ONLINE ORDER notification — item, quantity, buyer name, buyer
// email. Since the cutover the site mints a payment link, and a payment link
// raises a PAYMENT notification, which says an amount and a card. Square offers
// no setting to change what either one contains, so the detail cannot be put
// back on that side; it has to come from us, out of the data the donor gave us
// in the first place.
//
// WHAT IT DELIBERATELY DOES NOT DO
// It does not re-derive the 75/25 split. `allocateCents` in `square-report.ts`
// is the one place that arithmetic lives, so this email and the Treasurer's
// report cannot come to different answers about how much reached Water Polo —
// and a named fund keeps 100% here for free, rather than by remembering to.

/** What the webhook digs out of Square for a completed donation. Flat, and
 *  every field optional except the two that always exist, so this stays pure
 *  and testable without a Square account. */
export type DonationPayment = {
  /** `metadata.designation` — a team slug, "general", or a named fund. */
  designation: string;
  amountCents: number;
  /** `metadata.level` — the membership level the amount qualifies for. */
  level?: string;
  /** `metadata.tribute` — "in honor of", only ever set for a fund offering one. */
  tribute?: string;
  /** `metadata.donor` — the name typed on our form, which is the one the donor
   *  meant. Square's billing name is the cardholder and can differ. */
  donorName?: string;
  donorEmail?: string;
  donorPhone?: string;
  /** The cardholder name off the Square payment, when it differs from
   *  `donorName` — a grandparent's card on a parent's gift is worth seeing. */
  cardholderName?: string;
  /** False when the donor unchecked "display my name on the donor wall".
   *
   *  Three states, not two. Undefined means we do not know — NOT that they
   *  consented — and the copy below says "ask" rather than "go ahead". The
   *  webhook never passes undefined today (see the note there), but a caller
   *  reconstructing an older gift from Square would have nothing to pass, and
   *  the wrong default here publishes someone's name against their wishes. */
  displayOnWall?: boolean;
  paymentId?: string;
  orderId?: string;
  /** ISO timestamp from Square. */
  paidAt?: string;
  /** `metadata.test` — a board review charge, not a real gift. */
  isTest?: boolean;
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

/** Square's `created_at` is ISO/UTC, and a volunteer in San Luis Obispo reading
 *  "2026-08-23T03:40:00Z" has to do timezone arithmetic to answer "was this the
 *  gift from this evening?". Rendered in Pacific, labelled as Pacific, with the
 *  raw value dropped rather than converted if it will not parse. */
function pacificTimestamp(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return (
    d.toLocaleString("en-US", {
      timeZone: "America/Los_Angeles",
      dateStyle: "medium",
      timeStyle: "short",
    }) + " PT"
  );
}

/** `+18055551212` back into `(805) 555-1212`.
 *
 *  The number is stored E.164 because that is the only format Square accepts
 *  (see `normalisePhone` in the payment-link route), but the reader of this
 *  email is a volunteer about to dial it. Anything that isn't a US/Canada
 *  number is passed through untouched rather than guessed at. */
function readablePhone(e164?: string): string | undefined {
  if (!e164) return undefined;
  const m = /^\+1(\d{3})(\d{3})(\d{4})$/.exec(e164);
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : e164;
}

export type DonationEmail = {
  subject: string;
  text: string;
};

/** Build the notification. Pure — no Square call, no network. */
export function composeDonationEmail(gift: DonationPayment): DonationEmail {
  const label = designationLabel(gift.designation);
  const amount = MONEY.format(gift.amountCents / 100);
  const testPrefix = gift.isTest ? "[TEST — board review] " : "";
  const donor = gift.donorName?.trim();

  // Amount and designation in the subject on purpose: this is the line that has
  // to answer "what just happened" from a phone's lock screen, which is exactly
  // the surface Square's own notification stopped answering.
  const subject = `${testPrefix}New donation: ${amount} — ${label}${donor ? ` from ${donor}` : ""}`;

  const lines: string[] = [];

  if (gift.isTest) {
    lines.push(
      "*** THIS IS A BOARD TEST CHARGE, NOT A REAL DONATION. ***",
      "It was minted through the preview checkout and should be refunded.",
      "It is excluded from the Treasurer's report. Nothing below needs action.",
      "",
    );
  }

  lines.push("THE GIFT");
  lines.push(`  Amount:      ${amount}`);
  lines.push(`  Designated:  ${label}`);

  // The split, spelled out in dollars rather than as a percentage the reader
  // has to apply. This is the number a coach or a team parent will ask her for.
  const { toTeamCents, toGeneralCents } = allocateCents(
    gift.designation,
    "donation",
    gift.amountCents,
  );
  const fund = specialFund(gift.designation);
  if (isUnsplitDesignation(gift.designation)) {
    lines.push(
      gift.designation === "general"
        ? "  Split:       none — 100% to the general fund"
        : `  Split:       none — 100% to ${fund?.shortLabel ?? label}`,
    );
  } else {
    lines.push(
      `  Split:       ${MONEY.format(toTeamCents / 100)} to the team (75%) · ` +
        `${MONEY.format(toGeneralCents / 100)} to the general fund (25%)`,
    );
  }

  if (fund?.qbClass) {
    // Trina's own class string, so the two people who touch this gift are
    // reading the same words for it.
    lines.push(`  QuickBooks:  ${fund.qbClass}`);
  }
  if (gift.level) lines.push(`  Level:       ${gift.level}`);
  if (gift.tribute) lines.push(`  In honor of: ${gift.tribute}`);

  const when = pacificTimestamp(gift.paidAt);
  if (when) lines.push(`  When:        ${when}`);
  if (gift.paymentId) lines.push(`  Square ID:   ${gift.paymentId}`);
  lines.push("");

  lines.push("THE DONOR");
  lines.push(`  Name:   ${donor || "not provided"}`);
  lines.push(`  Email:  ${gift.donorEmail || "not provided"}`);
  lines.push(`  Phone:  ${readablePhone(gift.donorPhone) || "not provided"}`);
  // Only when it actually differs — printing "Card: same person" on every gift
  // trains the reader to skip the block.
  const cardholder = gift.cardholderName?.trim();
  if (cardholder && (!donor || cardholder.toLowerCase() !== donor.toLowerCase())) {
    lines.push(`  Card:   ${cardholder} — the card is in a different name`);
  }
  lines.push("");

  // The one field here that cannot be recovered from the transaction, and the
  // one where the wrong default is awkward to undo — a name published on the
  // donor wall against the donor's wishes.
  lines.push("DONOR WALL");
  if (gift.displayOnWall === false) {
    lines.push(
      "  ANONYMOUS — the donor unchecked \"display my name\".",
      "  Do NOT list them on the donor wall. The gift still counts toward",
      "  their membership level.",
    );
  } else if (gift.displayOnWall === true) {
    lines.push("  OK to list — the donor left the donor-wall box checked.");
  } else {
    lines.push(
      "  Not recorded for this gift. Treat as unknown rather than as consent,",
      "  and ask before listing them.",
    );
  }
  lines.push("");

  lines.push(
    "---",
    "Sent automatically by slotab.org when Square confirms a donation. Square's",
    "own payment notification cannot carry these fields, so this restores what",
    "the storefront's order notifications used to show — see decision #186.",
    "Per-sport totals and a CSV for the Treasurer: slotab.org/board/square-report",
  );

  return { subject, text: lines.join("\n") };
}
