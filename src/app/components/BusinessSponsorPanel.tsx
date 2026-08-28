"use client";

import { useState } from "react";
import { SPONSOR_TIERS, sportsCreditPerk, tierPerks } from "../data/sponsor-tiers";
import SportPicker, { SPORT_OPTIONS } from "./SportPicker";
import SponsorEnquiry from "./SponsorEnquiry";

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const SPONSOR_EMAIL = "slotabmembership@gmail.com";

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
export default function BusinessSponsorPanel() {
  const [tierId, setTierId] = useState<string>(SPONSOR_TIERS[1]?.id ?? "gold");
  const [sports, setSports] = useState<string[]>([]);
  const [business, setBusiness] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tier = SPONSOR_TIERS.find((t) => t.id === tierId) ?? SPONSOR_TIERS[1];

  // Trim the selection when moving down the ladder, so a business that picks
  // five sports at Champion and then switches to Varsity doesn't silently send
  // more than that tier allows — the server would reject it, and being
  // rejected for something you can't see is the worst kind of form error.
  function chooseTier(id: string) {
    const next = SPONSOR_TIERS.find((t) => t.id === id);
    setTierId(id);
    if (next) setSports((prev) => prev.slice(0, next.sportsCredit));
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSubmit = business.trim().length > 0 && contact.trim().length > 0 && emailValid;

  const sportLabels = sports
    .map((s) => SPORT_OPTIONS.find((o) => o.slug === s)?.label ?? s)
    .join(", ");

  const enquiryBody = [
    `We'd like to sponsor SLOHS Tiger Athletics at the ${tier.name} level (${MONEY.format(tier.annual)}/year).`,
    "",
    `Business name: ${business || "(please fill in)"}`,
    `Contact name: ${contact || "(please fill in)"}`,
    `Email: ${email || "(please fill in)"}`,
    `Phone: ${phone || ""}`,
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

  async function payWithSquare() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/square/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Tier id and slugs only — the price and the sports allowance are both
        // looked up server-side.
        body: JSON.stringify({
          kind: "sponsorship",
          tierId: tier.id,
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
      <fieldset className="slotab-donate-fieldset">
        <legend>Sponsorship level</legend>
        <div className="slotab-biz-tiers">
          {SPONSOR_TIERS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`slotab-biz-tier${t.id === tier.id ? " on" : ""}`}
              aria-pressed={t.id === tier.id}
              onClick={() => chooseTier(t.id)}
            >
              <span className="slotab-biz-tier-name">{t.name}</span>
              <span className="slotab-biz-tier-price">
                {MONEY.format(t.annual)}
              </span>
            </button>
          ))}
        </div>
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
          <span>Business name</span>
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
          : `Pay ${MONEY.format(tier.annual)} with Square`}
      </button>

      {!canSubmit && (
        <p className="slotab-donate-note">
          Add your business name, a contact name and an email to continue.
        </p>
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
    </div>
  );
}
