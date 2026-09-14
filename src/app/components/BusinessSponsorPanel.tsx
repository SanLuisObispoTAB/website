"use client";

import { useState } from "react";
import {
  SPONSOR_TIERS,
  sponsorTierForAmount,
  sportsCreditPerk,
  tierPerks,
} from "../data/sponsor-tiers";
import SportPicker, { SPORT_OPTIONS } from "./SportPicker";
import SponsorEnquiry from "./SponsorEnquiry";
import {
  SPONSOR_FORM_FILENAME,
  SPONSOR_FORM_URL,
  buildSponsorFormPdf,
} from "@/lib/sponsor-form-pdf";

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const SPONSOR_EMAIL = "slotabmembership@gmail.com";

// Card checkout's ceiling, mirroring MAX_CENTS in the payment-link route. Above
// it the invoice and the paper form still work; only the card button stops.
const MAX_ONLINE = 50_000;
const MIN_SPONSORSHIP = Math.min(...SPONSOR_TIERS.map((t) => t.annual));

/** Whole dollars from what was typed ("$3,000" → 3000); NaN if it isn't one. */
function parseDollars(text: string): number {
  const cleaned = text.replace(/[$,\s]/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : NaN;
}

// The business half of the donate box.
//
// Businesses were being funnelled through a form built for parents — a sport
// dropdown, a $50 default and a personal-giving ladder — with no way to name a
// tier at all. `/membership` has the catalogue, but a business that lands on
// `/donate` (or is sent there) needs to be able to act, not just read.
//
// TWO WAYS OUT, DELIBERATELY.
// Paying by card is the fast path, but sponsorship is a relationship the club
// invoices as often as it charges: a business may need a PO, a W-9, or simply
// their own paperwork before money moves. Offering only a card button would
// turn "we'd like to sponsor you" into a dead end for exactly the sponsors
// worth the most. The invoice route reuses the enquiry panel from #146 rather
// than a bare `mailto:`, which fails silently on machines with no mail handler.
//
// AND A THIRD: THE PAPER FORM.
// Many sponsors still expect to fill out a form and mail a check, so the
// Membership team's printable form is offered twice — blank, at the very top,
// for someone who wants nothing to do with a web form; and filled in, at the
// bottom, with whatever was typed here written onto it
// (`lib/sponsor-form-pdf.ts`). The website and mailing-address fields exist
// because the paper form asks for them; they are optional online because
// neither card checkout nor the invoice request needs them.
export default function BusinessSponsorPanel() {
  // The AMOUNT is the state; the tier is derived from it (#221). A business
  // sponsoring from a budget line between tiers gets the highest tier at or
  // below its amount. Clicking a tier card just types that tier's price in.
  const [amountText, setAmountText] = useState<string>(
    String(SPONSOR_TIERS[1]?.annual ?? 5000),
  );
  const [sports, setSports] = useState<string[]>([]);
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [address, setAddress] = useState("");
  const [formBusy, setFormBusy] = useState<"print" | "download" | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount = parseDollars(amountText);
  const amountTier = Number.isNaN(amount) ? undefined : sponsorTierForAmount(amount);
  // Below the cheapest tier there is no tier to show. The panel keeps
  // describing the cheapest one (so the perks box never goes blank) while the
  // warning and the disabled button say why nothing can be bought yet.
  const tier = amountTier ?? SPONSOR_TIERS[SPONSOR_TIERS.length - 1];
  const amountValid = amountTier !== undefined;
  const betweenTiers = amountValid && amount !== tier.annual;

  // Trim the selection when moving down the ladder, so a business that picks
  // four sports at Champion and then drops to Varsity doesn't silently send
  // more than that tier allows — the server would reject it, and being
  // rejected for something you can't see is the worst kind of form error.
  function changeAmount(text: string) {
    setAmountText(text);
    const next = sponsorTierForAmount(parseDollars(text));
    if (next) setSports((prev) => prev.slice(0, next.sportsCredit));
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit =
    business.trim().length > 0 &&
    contact.trim().length > 0 &&
    emailValid &&
    amountValid &&
    amount <= MAX_ONLINE;
  const payAmount = amountValid ? amount : tier.annual;

  const sportLabels = sports
    .map((s) => SPORT_OPTIONS.find((o) => o.slug === s)?.label ?? s)
    .join(", ");

  const enquiryBody = [
    betweenTiers
      ? `We'd like to sponsor SLOHS Tiger Athletics for ${MONEY.format(amount)}/year, at the ${tier.name} level (${MONEY.format(tier.annual)} and up).`
      : `We'd like to sponsor SLOHS Tiger Athletics at the ${tier.name} level (${MONEY.format(tier.annual)}/year).`,
    "",
    `Business name: ${business || "(please fill in)"}`,
    `Contact name: ${contact || "(please fill in)"}`,
    `Email: ${email || "(please fill in)"}`,
    `Phone: ${phone || ""}`,
    `Website: ${website || ""}`,
    `Mailing address: ${address || ""}`,
    "",
    `Sports to credit: ${sportLabels || "(none chosen yet)"}`,
    "",
    "Preferred banner location(s):",
    tier.id === "champion" ? "Featured game — sport of choice:" : null,
    "",
    "Please send an invoice. Our logo is attached (vector or high-resolution PNG preferred).",
  ]
    .filter((l) => l !== null)
    .join("\n");

  // Print opens the filled-in PDF in a new tab, where the browser's own viewer
  // prints it; printing from a hidden iframe is unreliable on Safari and does
  // nothing on phones. The tab is opened *before* the PDF is built because a
  // window opened after an `await` is no longer tied to the click, and popup
  // blockers treat it as unsolicited. If the tab is blocked anyway, the form
  // downloads instead — the sponsor still ends up holding it.
  async function filledForm(action: "print" | "download") {
    setFormError(null);
    setFormBusy(action);
    const tab = action === "print" ? window.open("", "_blank") : null;
    try {
      const bytes = await buildSponsorFormPdf({
        tierId: amountValid ? tier.id : undefined,
        amount: amountValid ? amount : undefined,
        name: business,
        contact,
        email,
        phone,
        website,
        address,
        sports: sports.map((s) => SPORT_OPTIONS.find((o) => o.slug === s)?.label ?? s),
      });
      const url = URL.createObjectURL(
        new Blob([bytes as BlobPart], { type: "application/pdf" }),
      );
      if (tab) {
        tab.location.href = url;
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = SPONSOR_FORM_FILENAME;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      tab?.close();
      setFormError(
        "Couldn't fill in the form — use the blank form at the top of this box instead.",
      );
    } finally {
      setFormBusy(null);
    }
  }

  async function payWithSquare() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/square/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The server re-derives the tier from the amount and refuses a
        // mismatch, and looks up the sports allowance itself.
        body: JSON.stringify({
          kind: "sponsorship",
          tierId: tier.id,
          amountCents: payAmount * 100,
          sports,
          businessName: business,
          name: contact,
          email,
          phone,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        res.status === 503
          ? "Card payment isn't switched on yet — use “Request an invoice” below and we'll bill you directly."
          : (data.error ?? "Could not start checkout — please try again."),
      );
    } catch {
      setError("Could not reach checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="slotab-biz-panel">
      {/* First thing in the box, so a sponsor who only wants paper never has
          to read past a web form to find it. Plain links to the static file:
          no script involved, nothing to fail. */}
      <div className="slotab-biz-paper">
        <p className="slotab-biz-paper-lead">Prefer a paper form?</p>
        <p>
          Print the sponsorship form, fill it in by hand, and mail it with a
          check payable to <strong>SLOTAB</strong> to{" "}
          <strong className="slotab-mail-address">
            PO Box 16025, San&nbsp;Luis&nbsp;Obispo,&nbsp;CA&nbsp;93406
          </strong>
          .
        </p>
        <div className="slotab-biz-paper-actions">
          <a
            className="slotab-btn"
            href={SPONSOR_FORM_URL}
            target="_blank"
            rel="noopener"
          >
            Print blank form
          </a>
          <a
            className="slotab-btn dark"
            href={SPONSOR_FORM_URL}
            download={SPONSOR_FORM_FILENAME}
          >
            Download PDF
          </a>
        </div>
        <p className="slotab-biz-paper-hint">
          Or fill in the details below first — we&apos;ll print your answers on
          the form for you.
        </p>
      </div>

      <fieldset className="slotab-donate-fieldset">
        <legend>Sponsorship level</legend>
        <div className="slotab-biz-tiers">
          {SPONSOR_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`slotab-biz-tier${amountValid && t.id === tier.id ? " on" : ""}`}
              aria-pressed={amountValid && t.id === tier.id}
              onClick={() => changeAmount(String(t.annual))}
            >
              <span className="slotab-biz-tier-name">{t.name}</span>
              <span className="slotab-biz-tier-price">
                {MONEY.format(t.annual)}
              </span>
            </button>
          ))}
        </div>
        <label className="slotab-donate-field slotab-biz-amount">
          <span>Sponsorship amount</span>
          <input
            type="text"
            inputMode="numeric"
            value={amountText}
            onChange={(e) => changeAmount(e.target.value)}
            aria-describedby="biz-amount-help"
          />
        </label>
        <p id="biz-amount-help" className="slotab-biz-amount-help" aria-live="polite">
          {Number.isNaN(amount) ? (
            <span className="slotab-donate-warning">
              Enter a whole-dollar amount, e.g. 3000.
            </span>
          ) : !amountValid ? (
            <span className="slotab-donate-warning">
              Sponsorships start at {MONEY.format(MIN_SPONSORSHIP)}. For a
              smaller gift, use the General membership tab.
            </span>
          ) : betweenTiers ? (
            <>
              <strong>{MONEY.format(amount)}</strong> is the{" "}
              <strong>{tier.name}</strong> level — you receive the{" "}
              {tier.name} benefits below.
            </>
          ) : (
            <>
              Budget doesn&apos;t match a level? Enter your amount — you
              receive the benefits of the highest level at or below it.
            </>
          )}
        </p>
        {/* What the selected tier actually buys. `aria-live` so switching tier
            announces the new package rather than silently swapping it under a
            screen-reader user.

            Monthly prices are deliberately NOT shown here even though the
            sheet carries them for Tiger Pride and Varsity: this box sits
            directly above a card button that can only charge the annual
            amount, and advertising a monthly option beside it would promise
            something checkout cannot do — the same fault that had monthly
            giving pulled from this form in #154. */}
        <div className="slotab-biz-perks" aria-live="polite">
          <div className="slotab-biz-perks-head">
            <h4>{tier.name}</h4>
            {tier.adPerks && (
              <span className="slotab-biz-perks-badge">Includes Ad Perks</span>
            )}
          </div>
          <ul>
            {tierPerks(tier).map((perk) => (
              <li key={perk}>{perk}</li>
            ))}
            {/* Generated from `sportsCredit`, same as the tier cards, so the
                number here can never disagree with the picker below it. */}
            {sportsCreditPerk(tier.sportsCredit) && (
              <li>{sportsCreditPerk(tier.sportsCredit)}</li>
            )}
            {/* Every sponsorship tier credits at least one sport since #215, so
                this branch is unreachable today — kept because the panel must
                not simply fall silent if the board ever zeroes one again. */}
            {!sportsCreditPerk(tier.sportsCredit) && (
              <li>Not credited to a specific sport</li>
            )}
          </ul>
        </div>
      </fieldset>

      {/* Tiger Pride and Varsity credit no sport on the final sheet, so the
          whole fieldset goes rather than showing an empty or capped-at-zero
          picker. */}
      {tier.sportsCredit > 0 && (
        <fieldset className="slotab-donate-fieldset">
          <legend>
            {tier.sportsCredit === 1
              ? "Sport to credit"
              : `Sports to credit — up to ${tier.sportsCredit}`}
          </legend>
          <SportPicker
            limit={tier.sportsCredit}
            picked={sports}
            onChange={setSports}
            idPrefix="biz"
          />
        </fieldset>
      )}

      <fieldset className="slotab-donate-fieldset">
        <legend>Your business</legend>
        <label className="slotab-donate-field">
          <span>Business or individual name</span>
          <input
            type="text"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            autoComplete="organization"
            placeholder="Acme Hardware"
          />
        </label>
        <label className="slotab-donate-field">
          <span>Contact name</span>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            autoComplete="name"
          />
        </label>
        <label className="slotab-donate-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>
        <label className="slotab-donate-field">
          <span>Phone (optional)</span>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="tel"
          />
        </label>
        {/* Asked because the paper form asks. Neither is sent to Square. */}
        <label className="slotab-donate-field">
          <span>Business website (optional)</span>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            autoComplete="url"
            placeholder="acmehardware.com"
          />
        </label>
        <label className="slotab-donate-field">
          <span>Mailing address (optional)</span>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            autoComplete="street-address"
            placeholder="Street, city, state, ZIP"
          />
        </label>
      </fieldset>

      <button
        type="button"
        className="slotab-donate-submit"
        disabled={!canSubmit || busy}
        aria-busy={busy}
        onClick={payWithSquare}
      >
        {busy
          ? "Opening secure checkout…"
          : `Pay ${MONEY.format(payAmount)} with Square`}
      </button>

      {amountValid && amount > MAX_ONLINE ? (
        <p className="slotab-donate-note">
          Sponsorships above {MONEY.format(MAX_ONLINE)} can&apos;t be paid by
          card online — request an invoice or pay by check below.
        </p>
      ) : (
        amountValid &&
        !canSubmit && (
          <p className="slotab-donate-note">
            Add your business name, a contact name and an email to continue.
          </p>
        )
      )}

      {error && (
        <p className="slotab-donate-warning" role="alert">
          {error}
        </p>
      )}

      <div className="slotab-biz-invoice">
        <p className="slotab-biz-invoice-lead">Prefer to be invoiced?</p>
        <p>
          Plenty of businesses need a PO or their own paperwork first. Send us
          the details and we&apos;ll invoice you — no card needed.
        </p>
        <SponsorEnquiry
          email={SPONSOR_EMAIL}
          subject={`Sponsorship invoice request — ${tier.name}`}
          body={enquiryBody}
          buttonLabel="Request a sponsorship invoice"
          buttonClassName="slotab-btn outline"
        />
      </div>

      <div className="slotab-biz-invoice">
        <p className="slotab-biz-invoice-lead">Paying by check?</p>
        <p>
          Get the sponsorship form with everything above already filled in —
          your {amountValid ? `${tier.name} selection` : "sponsorship level"}{" "}
          included. Mail it with a
          check payable to <strong>SLOTAB</strong> to{" "}
          <strong className="slotab-mail-address">
            PO Box 16025, San&nbsp;Luis&nbsp;Obispo,&nbsp;CA&nbsp;93406
          </strong>
          .
        </p>
        <div className="slotab-biz-paper-actions">
          <button
            type="button"
            className="slotab-btn"
            disabled={formBusy !== null}
            aria-busy={formBusy === "print"}
            onClick={() => filledForm("print")}
          >
            {formBusy === "print" ? "Preparing…" : "Print filled-in form"}
          </button>
          <button
            type="button"
            className="slotab-btn dark"
            disabled={formBusy !== null}
            aria-busy={formBusy === "download"}
            onClick={() => filledForm("download")}
          >
            {formBusy === "download" ? "Preparing…" : "Download filled-in form"}
          </button>
        </div>
        {formError && (
          <p className="slotab-donate-warning" role="alert">
            {formError}
          </p>
        )}
      </div>
    </div>
  );
}
