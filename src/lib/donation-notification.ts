import { designationLabel, allocateCents } from "./square-report";
import { specialFund, isUnsplitDesignation } from "../app/data/special-funds";
import { levelByName } from "../app/data/sponsor-tiers";
import { perkAction } from "./sponsor-fulfilment";
import { liaisonsForTeam } from "./team-liaisons";
import { pacificTimestamp, readablePhone } from "./notification-format";

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
// back on that side; it has to come from us.
//
// IT IS A TO-DO LIST, NOT A RECEIPT
// Erik's steer, once the first cut was working: restore the information *or*
// send "a detailed list of items to do". A receipt tells her a gift arrived and
// leaves her to work out what it obliges. The obligations are knowable — they
// are in `sponsor-tiers.ts` and the team files — so this renders them as
// checkboxes. That is also the shape `sponsor-fulfilment.ts` already uses, so
// the two mails a volunteer gets from this site read the same way.
//
// WHAT IT DELIBERATELY DOES NOT DO
//   · It does not re-derive the 75/25 split. `allocateCents` in
//     `square-report.ts` is the one place that arithmetic lives, so this email
//     and the Treasurer's report cannot come to different answers about how
//     much reached Water Polo — and a named fund keeps 100% for free.
//   · It does not restate perks from memory. Every checklist line is a string
//     out of `sponsor-tiers.ts`, rendered verbatim, with its action note from
//     the same keyword table `sponsor-fulfilment.ts` uses. When the board
//     revises the sheet, this email follows on its own. A hand-kept second copy
//     of "what a Silver gets" is the drift behind #143 and #145.
//   · It does not decide whether a $2,500 *donation* is a Silver *sponsorship*.
//     See `LEVEL` below — it flags the question instead of answering it.

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
   *  consented — and the checklist says "ask" rather than "go ahead". The
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

/** The club's EIN, as published on the home page. It belongs in the
 *  acknowledgement letter and nobody should have to go looking for it. */
const EIN = "45-4897120";

/** Above this, the IRS requires the donor to hold a written acknowledgement
 *  from the charity before they can deduct the gift (Pub. 1771, the
 *  "contemporaneous written acknowledgment" rule). Below it a thank-you is
 *  good practice; at or above it, it is the donor's deduction at stake. */
const IRS_ACK_THRESHOLD_CENTS = 250_00;

export type DonationEmail = {
  subject: string;
  text: string;
  /** How many top-level checkboxes the mail contains. Returned rather than
   *  recounted by the caller, since the subject line quotes it. */
  todoCount: number;
};

/** One checkbox, plus any sub-lines that belong under it. */
type Todo = { title: string; detail?: string[] };

function renderTodos(todos: Todo[]): string[] {
  const out: string[] = [];
  todos.forEach((t, i) => {
    out.push(`  ${i + 1}. [ ] ${t.title}`);
    for (const d of t.detail ?? []) out.push(`         ${d}`);
    out.push("");
  });
  return out;
}

/** Build the notification. Pure — no Square call, no network. */
export function composeDonationEmail(gift: DonationPayment): DonationEmail {
  const label = designationLabel(gift.designation);
  const amount = MONEY.format(gift.amountCents / 100);
  const donor = gift.donorName?.trim();
  const fund = specialFund(gift.designation);
  const { toTeamCents, toGeneralCents } = allocateCents(
    gift.designation,
    "donation",
    gift.amountCents,
  );

  const lines: string[] = [];
  const todos: Todo[] = [];

  // ---------------------------------------------------------------- the facts
  lines.push("WHAT CAME IN");
  lines.push(`  Amount:      ${amount}`);
  lines.push(`  Designated:  ${label}`);
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

  lines.push("WHO GAVE IT");
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

  // ------------------------------------------------------------- the to-do list
  const who = donor || "this donor";

  // Resolved before the first item, because the acknowledgement letter depends
  // on it: a level carrying passes or banners is a quid pro quo, and the letter
  // has to say so.
  const level = gift.level ? levelByName(gift.level) : undefined;
  const actionablePerks = (level?.perks ?? [])
    .map((p) => ({ perk: p, action: perkAction(p) }))
    .filter((x): x is { perk: string; action: string } => Boolean(x.action));
  const passivePerks = (level?.perks ?? []).filter((p) => !perkAction(p));
  // "Tiger news & event updates" is not a benefit with a dollar value; passes,
  // banners and scoreboard ads are. Only the sponsorship half of the ladder
  // carries anything the IRS would call goods or services.
  const carriesBenefits =
    level?.kind === "sponsorship" && actionablePerks.length > 0 && !fund;

  // 1. THE THANK-YOU / TAX LETTER. First because it is the only item with a
  //    deadline attached to somebody else's tax return.
  const needsWrittenAck = gift.amountCents >= IRS_ACK_THRESHOLD_CENTS;
  todos.push({
    title: needsWrittenAck
      ? `Send ${who} the written tax acknowledgement — REQUIRED at this amount`
      : `Send ${who} a thank-you`,
    detail: [
      ...(needsWrittenAck
        ? [
            "→ the IRS needs a written acknowledgement for a gift of $250 or more",
            `  before the donor can deduct it. State the amount: ${amount}.`,
          ]
        : [`→ state the amount: ${amount}.`]),
      // The quid pro quo. Getting this wrong is not a wording nit — a letter
      // saying "no goods or services" when the donor also received six
      // All-Sport passes overstates their deduction, and it is the club's
      // letter that says it.
      ...(carriesBenefits
        ? [
            `→ CAREFUL: the ${level!.name} level provides benefits (see the item`,
            "  below), so this is NOT a \"no goods or services were provided\"",
            "  letter. The letter must describe what they received and give a",
            "  good-faith estimate of its value; only the remainder is",
            "  deductible. Ask Trina for the figures the club uses.",
          ]
        : ["→ no goods or services were provided in return."]),
      `→ SLOTAB is a 501(c)(3), EIN ${EIN}.`,
      `→ Send to: ${gift.donorEmail || "NO EMAIL ON THE PAYMENT — check Square"}`,
    ],
  });

  // 2. THE DONOR WALL. The one field that cannot be recovered from the
  //    transaction, and the one whose wrong answer is awkward to undo.
  if (gift.displayOnWall === false) {
    todos.push({
      title: `Do NOT list ${who} on the donor wall — they asked to stay anonymous`,
      detail: [
        "→ they unchecked \"display my name\" at checkout.",
        "→ the gift still counts toward their level; only the listing is off.",
      ],
    });
  } else if (gift.displayOnWall === true) {
    todos.push({
      title: `Add ${who} to the donor wall`,
      detail: ["→ they left the donor-wall box checked, so this is agreed."],
    });
  } else {
    todos.push({
      title: `Ask ${who} whether they want to be listed on the donor wall`,
      detail: [
        "→ no preference was recorded on this gift. Treat that as unknown",
        "  rather than as consent, and ask before listing them.",
      ],
    });
  }

  // 3. IS IT EVEN A SPONSORSHIP? Asked BEFORE the perks, because the perks
  //    depend on the answer — listing them first invites someone to order
  //    banners for a family that gave generously and wanted nothing back.
  //
  //    The flag is deliberately not an answer. A donation reaching a
  //    sponsorship tier by amount alone is not the same thing as a business
  //    buying that sponsorship, and #158 left the shared ladder as an open
  //    board question. Wrong in either direction costs real money or a real
  //    perk, so it goes to a human.
  //
  //    Suppressed for a NAMED FUND. The Hall of Fame's own copy promises "100%
  //    goes to the induction — awards, medallions, wall nameplates and the
  //    ceremony program", so asking whether to spend it on banners and passes
  //    contradicts what the donor was told on the page they gave from. The
  //    general fund is different and the question stands there: a $2,500
  //    unrestricted gift really might be a business enrolling.
  if (level?.kind === "sponsorship" && !fund) {
    todos.push({
      title: `FIRST: confirm whether this gift is meant as a ${level.name} SPONSORSHIP`,
      detail: [
        `→ ${amount} reaches the ${level.name} tier on the combined ladder,`,
        "  but it came through the DONATION form, not the sponsorship one —",
        "  so no business name was collected and no sports were chosen.",
        ...(level.sportsCredit
          ? [
              `→ a ${level.name} sponsorship credits up to ${level.sportsCredit} sports;`,
              `  this gift names only ${label}.`,
            ]
          : []),
        "→ if it IS a sponsorship: the next item applies, and we need a logo",
        "  and a website URL from them.",
        "→ if it is a personal gift: skip the next item entirely.",
      ],
    });
  }

  // 4. WHAT THE LEVEL OWES. Rendered verbatim from the board's own arrays —
  //    see the header note. A gift of $500 or more lands on a sponsorship tier
  //    by `levelForGift`, so this is where the real work usually is.
  if (level && actionablePerks.length && !(level.kind === "sponsorship" && fund)) {
    const detail: string[] = [];
    for (const { perk, action } of actionablePerks) {
      detail.push(`[ ] ${perk}`);
      detail.push(`      → ${action}`);
    }
    if (passivePerks.length) {
      detail.push(`Also included, nothing to do: ${passivePerks.join("; ")}`);
    }
    todos.push({
      title:
        level.kind === "sponsorship"
          ? `IF SO: fulfil what the ${level.name} level owes them`
          : `Fulfil what the ${level.name} level owes them`,
      detail,
    });
  }

  // 4. TELL THE TEAM. Only for a gift that actually splits to one — the general
  //    fund and the named funds have no team on the other end.
  if (!isUnsplitDesignation(gift.designation)) {
    const liaisons = liaisonsForTeam(gift.designation);
    todos.push({
      title: `Let ${label} know ${MONEY.format(toTeamCents / 100)} is designated to them`,
      detail: liaisons.length
        ? liaisons.map((l) => `→ ${l.name} <${l.email}>`)
        : [
            "→ NO LIAISON ON FILE for this team. Worth chasing separately —",
            "  a team with money coming in and nobody to receive the news is a",
            "  gap in the team page, not just in this email.",
          ],
    });
  }

  // 5. THE TRIBUTE. A memorial gift's whole point, and the committee spending
  //    the fund is not the person reading this mail.
  if (gift.tribute) {
    todos.push({
      title: `Pass the tribute to ${fund?.shortLabel ?? "the fund"} committee`,
      detail: [
        `→ given in honor of ${gift.tribute}.`,
        "→ nothing else in the checkout captures this, so it stops here",
        "  unless it is forwarded.",
      ],
    });
  }

  // ------------------------------------------------------------------ assembly
  //
  // A board test charge gets the full body — the point of a test is to see what
  // the real thing looks like — but the checklist is explicitly disowned first,
  // so nobody works it.
  const testPrefix = gift.isTest ? "[TEST — board review] " : "";
  const header: string[] = [];
  if (gift.isTest) {
    header.push(
      "*** THIS IS A BOARD TEST CHARGE, NOT A REAL DONATION. ***",
      "It was minted through the preview checkout and should be refunded.",
      "It is excluded from the Treasurer's report.",
      "DO NOT WORK THE LIST BELOW — it is shown so the format can be reviewed.",
      "",
    );
  }

  const todoCount = todos.length;
  const subject =
    `${testPrefix}New donation: ${amount} — ${label}` +
    `${donor ? ` from ${donor}` : ""} — ${todoCount} to do`;

  lines.push(
    `TO DO (${todoCount})`,
    "",
    ...renderTodos(todos),
    "---",
    "Sent automatically by slotab.org when Square confirms a donation. Square's",
    "own payment notification cannot carry any of the above, which is why this",
    "exists — see decision #187.",
    "",
    "The checklist is generated, not written: the level's items come straight",
    "from the board's membership and sponsorship sheet as transcribed in",
    "src/app/data/sponsor-tiers.ts, and the team contacts from the team's own",
    "page data. If a perk or a liaison is wrong, fix it there and every surface",
    "follows, this email included.",
    "",
    "Per-sport totals and a CSV for the Treasurer: slotab.org/board/square-report",
  );

  return { subject, text: [...header, ...lines].join("\n"), todoCount };
}
