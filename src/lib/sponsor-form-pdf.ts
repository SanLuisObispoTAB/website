// The Membership team's paper sponsorship form, filled in with whatever the
// sponsor already typed on /donate.
//
// WHY A PAPER FORM ON A SITE THAT TAKES CARDS
// Plenty of sponsors are used to "fill out the form, mail a check", and a
// business that wants to do it that way should not have to re-type on paper
// what it just typed on the website. So the PDF is the Membership team's own
// file, untouched, served from `public/forms/`, and this module only writes on
// top of it — the blank lines and the selected tier card. Their layout stays
// theirs; if they send a revised form, drop it in and re-check `FIELDS` below.
//
// Runs in the browser. `pdf-lib` is imported dynamically so its ~500 KB only
// loads for someone who actually clicks "download" or "print".

import { SPONSOR_TIERS } from "@/app/data/sponsor-tiers";

export const SPONSOR_FORM_URL = "/forms/slotab-2026-27-sponsorship-form.pdf";
export const SPONSOR_FORM_FILENAME = "SLOTAB-2026-27-Sponsorship-Form.pdf";
export const SPONSOR_MAILING_ADDRESS = "SLOTAB, PO Box 16025, San Luis Obispo, CA 93406";

export type SponsorFormAnswers = {
  tierId?: string;
  /** Whole dollars, when it differs from the tier's price (#221). */
  amount?: number;
  name?: string;
  phone?: string;
  website?: string;
  email?: string;
  contact?: string;
  address?: string;
  /** Display labels, not slugs — this is printed for a human. */
  sports?: string[];
};

// Positions of the blank lines, in PDF points with the origin at the TOP-left
// (the way they read off a render; converted below). Measured from a 144 dpi
// render of the 2026-27 form: `y` is the rule under each label, `x0`–`x1` its
// horizontal extent. A revised form from the Membership team needs these
// re-measured — render the output and look before shipping it.
type Line = { x0: number; x1: number; y: number };
const FIELDS: Record<Exclude<keyof SponsorFormAnswers, "tierId" | "amount">, Line> = {
  name: { x0: 165.5, x1: 293, y: 664.5 },
  phone: { x0: 353, x1: 568.5, y: 664.5 },
  website: { x0: 129, x1: 293, y: 691.5 },
  email: { x0: 349.5, x1: 568.5, y: 691.5 },
  contact: { x0: 112.5, x1: 293, y: 718.5 },
  address: { x0: 362, x1: 568.5, y: 718.5 },
  sports: { x0: 162.5, x1: 568.5, y: 745.5 },
};

// The sponsorship tier cards, same coordinate convention. The paper form has
// no "which level?" line — a mailed check's amount implies it — so a
// pre-filled form marks the chosen card instead of adding a field to the
// Membership team's layout.
// `priceEnd` is where the printed "$5,000 / year" stops, so the tag beside it
// can size itself to the gap rather than overprint the price.
type Box = { x0: number; y0: number; x1: number; y1: number; priceEnd: number };
const TIER_CARDS: Record<string, Box> = {
  champion: { x0: 43.2, y0: 186.3, x1: 213.3, y1: 380.7, priceEnd: 114.5 },
  gold: { x0: 221.4, y0: 186.3, x1: 390.6, y1: 380.7, priceEnd: 285.8 },
  silver: { x0: 398.7, y0: 186.3, x1: 568.8, y1: 380.7, priceEnd: 463.5 },
  "tiger-pride": { x0: 132.3, y0: 388.8, x1: 302.4, y1: 472.5, priceEnd: 196.9 },
  varsity: { x0: 309.6, y0: 388.8, x1: 479.7, y1: 472.5, priceEnd: 365 },
};

/** True when there is anything to write on the form. */
export function hasAnswers(a: SponsorFormAnswers): boolean {
  return Boolean(
    a.tierId ||
      a.sports?.length ||
      [a.name, a.phone, a.website, a.email, a.contact, a.address].some((v) => v?.trim()),
  );
}

export async function buildSponsorFormPdf(answers: SponsorFormAnswers): Promise<Uint8Array> {
  const [{ PDFDocument, StandardFonts, rgb }, res] = await Promise.all([
    import("pdf-lib"),
    fetch(SPONSOR_FORM_URL),
  ]);
  if (!res.ok) throw new Error(`Could not load the sponsorship form (${res.status})`);

  const doc = await PDFDocument.load(await res.arrayBuffer());
  const page = doc.getPages()[0];
  const pageHeight = page.getHeight();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const ink = rgb(0.05, 0.1, 0.35); // dark blue: reads as "filled in", not printed
  const orange = rgb(0.84, 0.47, 0.12); // the form's own tier-card accent

  // Standard fonts are WinAnsi-only, and `drawText` throws on anything else —
  // an emoji in a business name must not turn "download" into a dead button.
  const safe = (text: string) =>
    Array.from(text.replace(/\s+/g, " ").trim())
      .map((ch) => {
        try {
          font.encodeText(ch);
          return ch;
        } catch {
          return "";
        }
      })
      .join("")
      .replace(/ {2,}/g, " ")
      .trim();

  for (const [key, line] of Object.entries(FIELDS) as [keyof typeof FIELDS, Line][]) {
    const raw = key === "sports" ? (answers.sports ?? []).join(", ") : (answers[key] ?? "");
    const text = safe(raw);
    if (!text) continue;
    const width = line.x1 - line.x0 - 4;
    // Shrink to fit rather than overrun the next column: a full street address
    // on a 200 pt rule is the normal case, not the edge case.
    let size = 10;
    while (size > 6 && font.widthOfTextAtSize(text, size) > width) size -= 0.5;
    let out = text;
    while (out.length > 1 && font.widthOfTextAtSize(out, size) > width) out = out.slice(0, -2) + "…";
    page.drawText(safe(out), {
      x: line.x0 + 2,
      y: pageHeight - line.y + 2.5,
      size,
      font,
      color: ink,
    });
  }

  const card = answers.tierId ? TIER_CARDS[answers.tierId] : undefined;
  const tier = SPONSOR_TIERS.find((t) => t.id === answers.tierId);
  if (card && tier) {
    // Inset so the border sits inside the card and clears the "Includes Ad
    // Perks" badge that straddles the top edge of Champion and Gold.
    const inset = 5;
    page.drawRectangle({
      x: card.x0 + inset,
      y: pageHeight - card.y1 + inset,
      width: card.x1 - card.x0 - inset * 2,
      height: card.y1 - card.y0 - inset * 2,
      borderColor: orange,
      borderWidth: 2,
    });
    // Tag on the price row, right-aligned: every card's price line is short,
    // so this is the one spot that is empty on all five — the foot of the
    // small Tiger Pride and Varsity cards is taken by their last perk.
    //
    // When the sponsor is paying an amount between tiers, the tag carries the
    // amount: the card's printed price is the tier's floor, not their check.
    const label =
      answers.amount && answers.amount !== tier.annual
        ? `OUR AMOUNT: $${answers.amount.toLocaleString("en-US")}`
        : "OUR SELECTION";
    const room = card.x1 - inset - 6 - (card.priceEnd + 8);
    let size = 7.5;
    while (size > 5 && bold.widthOfTextAtSize(label, size) + 10 > room) size -= 0.25;
    const tagW = bold.widthOfTextAtSize(label, size) + 10;
    const tagH = 13;
    const tagX = card.x1 - inset - tagW - 6;
    const tagY = pageHeight - (card.y0 + 36);
    page.drawRectangle({ x: tagX, y: tagY, width: tagW, height: tagH, color: orange });
    page.drawText(label, {
      x: tagX + 5,
      y: tagY + (tagH - size * 0.72) / 2,
      size,
      font: bold,
      color: rgb(1, 1, 1),
    });
  }

  return doc.save();
}
