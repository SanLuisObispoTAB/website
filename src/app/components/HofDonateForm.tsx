"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import hofData from "../data/hof.json";
import { specialFund } from "../data/special-funds";

// The Hall of Fame Fund's own checkout.
//
// WHY THE FUND HAS ITS OWN FORM AT ALL
// Erik, 2026-08-29: *"The HOF donation was intended to be its own campaign… it
// is a separate campaign with a separate donation page."* It had been running
// through `/donate` as one option in the sport dropdown, which is the membership
// flow: pick your sport, join the club. #209 took it out of that list; this is
// the other half of the same decision, and the reason the removal did not have
// to break anything.
//
// WHAT IS DIFFERENT FROM `DonateForm`, AND WHY
//   · No designation picker. The designation is the page. Nobody arrives here
//     undecided about where the money goes, so the one control that form exists
//     to enforce has nothing to ask.
//   · No 75/25 preview, because there is no split — this is the one SLOTAB gift
//     that keeps 100%, and saying so is the fund's own selling point.
//   · The ladder is the FUND's ladder: six rungs written as objects (nameplate,
//     medallion, award) rather than as amounts, from `hof.json`. That is #184's
//     argument and it is the whole reason the campaign converts — people give to
//     a thing handed to a person, not to a number.
//   · No sponsorship tab, no membership-tier callout. An alum giving $250 for an
//     engraved award is not shopping for a Family membership, and a tier badge
//     on this page would read as an upsell in the middle of a tribute.
//   · The tribute field is not optional scaffolding here; it is the point.
//
// WHAT IS DELIBERATELY IDENTICAL
// The request body. It posts the same `kind: "donation"` payload to the same
// `/api/square/payment-link` with `designation: "hall-of-fame"`, so the Square
// line item, the QuickBooks class, the Treasurer's report, the donation
// notification and the thermometer all keep seeing exactly what they saw
// before. This is a new front door onto a checkout that already worked, not a
// second checkout.

type Level = { amount: number; item: string; blurb: string; featured?: boolean };
type Fund = {
  enabled: boolean;
  designation: string;
  levels: Level[];
  tributeHint: string;
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const FLOOR = 25;
/** Matches `/donate`'s handoff pause — long enough to read the panel, short
 *  enough that nobody thinks the button failed. */
const HANDOFF_SECONDS = 5;

const MEMBERSHIP_EMAIL = "slotabmembership@gmail.com";

export default function HofDonateForm() {
  const fund = hofData.fund as Fund;
  const params = useSearchParams();

  // `?amount=` carries a rung from the ladder on /hall-of-fame straight into
  // the form. Bounded and integer-checked because it arrives from a URL; the
  // server re-checks it either way. An out-of-range value falls back to the
  // default rather than being clamped — silently changing the figure somebody
  // clicked is worse than ignoring it.
  const amountParam = Number(params.get("amount"));
  const initialAmount =
    Number.isFinite(amountParam) &&
    Number.isInteger(amountParam) &&
    amountParam >= FLOOR &&
    amountParam <= 50_000
      ? amountParam
      : null;

  const ladder = fund.levels.map((l) => l.amount);
  const defaultAmount =
    fund.levels.find((l) => l.featured)?.amount ?? ladder[0] ?? 100;

  const [amount, setAmount] = useState<number>(initialAmount ?? defaultAmount);
  const [other, setOther] = useState<string>(
    initialAmount !== null && !ladder.includes(initialAmount)
      ? String(initialAmount)
      : "",
  );
  const [tribute, setTribute] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [displayOnWall, setDisplayOnWall] = useState(true);

  const [starting, setStarting] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Square not configured for this environment. Kept apart from a general
  // error because the remedy is different — and because the usual fallback is
  // wrong here: the old storefront has no tile for this fund, so a donor sent
  // there would land on GENERAL ATHLETICS and their gift would leave no trace
  // of the Hall of Fame at all. Better to hand them an email than to take
  // their money under the wrong designation.
  const [unavailable, setUnavailable] = useState(false);

  const effectiveAmount = useMemo(() => {
    const parsed = other ? Number(other) : amount;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount, other]);

  const tooLow = effectiveAmount > 0 && effectiveAmount < FLOOR;
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);
  const donorComplete = donorName.trim().length > 0 && emailValid;
  const canSubmit = !tooLow && effectiveAmount > 0 && donorComplete;

  // The label for the rung the donor is on, if they are on one. Shown back to
  // them at the button, because "Give $250" and "Give $250 — commemorative
  // award" are different sentences and only one of them is why they came.
  const chosenLevel = fund.levels.find((l) => l.amount === effectiveAmount);

  const fundMeta = specialFund(fund.designation);

  useEffect(() => {
    if (secondsLeft === null || !checkoutUrl) return;
    if (secondsLeft <= 0) {
      window.location.href = checkoutUrl;
      return;
    }
    const t = window.setTimeout(
      () => setSecondsLeft((n) => (n === null ? null : n - 1)),
      1000,
    );
    return () => window.clearTimeout(t);
  }, [secondsLeft, checkoutUrl]);

  const rescueMailto = (() => {
    const body = [
      "I'd like to give to the SLOHS Athletics Hall of Fame Fund, but the card checkout on the website wasn't available.",
      "",
      `Name: ${donorName}`,
      `Email: ${donorEmail}`,
      donorPhone ? `Phone: ${donorPhone}` : null,
      `Amount: ${MONEY.format(effectiveAmount)}`,
      tribute.trim() ? `In honor of: ${tribute.trim()}` : null,
      displayOnWall ? null : "Please keep my name off the donor wall.",
    ]
      .filter((l) => l !== null)
      .join("\n");
    return (
      `mailto:${MEMBERSHIP_EMAIL}` +
      `?subject=${encodeURIComponent("Hall of Fame Fund gift — " + (donorName || "SLOTAB donor"))}` +
      `&body=${encodeURIComponent(body)}`
    );
  })();

  async function startCheckout() {
    setError(null);
    setUnavailable(false);
    setStarting(true);
    try {
      const res = await fetch("/api/square/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "donation",
          designation: fund.designation,
          ...(tribute.trim() ? { tribute: tribute.trim() } : {}),
          amountCents: Math.round(effectiveAmount * 100),
          email: donorEmail,
          name: donorName,
          phone: donorPhone,
          displayOnWall,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        setCheckoutUrl(data.url);
        setSecondsLeft(HANDOFF_SECONDS);
        return;
      }
      if (res.status === 503) {
        setUnavailable(true);
        return;
      }
      setError(data.error ?? "Could not start checkout — please try again.");
    } catch {
      setError(
        "Could not reach checkout. Check your connection and try again.",
      );
    } finally {
      setStarting(false);
    }
  }

  return (
    <div className="slotab-donate-form">
      <fieldset className="slotab-donate-fieldset">
        <legend>Choose what your gift covers</legend>
        {/* The ladder is the fund's own, rendered as objects rather than a row
            of figures — the same argument the band on /hall-of-fame makes. */}
        <div className="slotab-hof-give-ladder">
          {fund.levels.map((level) => {
            const on = !other && amount === level.amount;
            return (
              <button
                key={level.amount}
                type="button"
                className={`slotab-hof-give-option${on ? " on" : ""}`}
                aria-pressed={on}
                onClick={() => {
                  setAmount(level.amount);
                  setOther("");
                }}
              >
                <span className="slotab-hof-give-amount">
                  {MONEY.format(level.amount)}
                </span>
                <span className="slotab-hof-give-item">{level.item}</span>
              </button>
            );
          })}
        </div>
        <label className="slotab-donate-other">
          <span>Or enter another amount:</span>
          <span className="slotab-donate-other-input">
            <span className="dollar">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={FLOOR}
              step={1}
              placeholder={`${FLOOR} minimum`}
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </span>
        </label>
        {tooLow && (
          <p className="slotab-donate-warning">
            Gifts must be at least {MONEY.format(FLOOR)}.
          </p>
        )}
        {chosenLevel && (
          <p className="slotab-donate-hint">{chosenLevel.blurb}</p>
        )}
      </fieldset>

      {/* 100% of it, and said plainly. This is the fund's distinguishing fact
          and the reason it is not a team designation. */}
      <div className="slotab-donate-preview">
        <div className="slotab-donate-preview-row">
          <span>100% goes to the Hall of Fame — no 75/25 team split</span>
          <strong>{MONEY.format(effectiveAmount > 0 ? effectiveAmount : 0)}</strong>
        </div>
        <div className="slotab-donate-preview-row muted">
          <span>
            Awards, medallions, wall nameplates and the ceremony program.
          </span>
        </div>
      </div>

      <fieldset className="slotab-donate-fieldset">
        <legend>{fundMeta?.tribute?.label ?? "In honor of (optional)"}</legend>
        <label className="slotab-donate-field">
          <input
            type="text"
            maxLength={80}
            aria-label={fundMeta?.tribute?.label ?? "In honor of (optional)"}
            placeholder={
              fundMeta?.tribute?.placeholder ??
              "Coach, teammate, or inductee's name"
            }
            value={tribute}
            onChange={(e) => setTribute(e.target.value)}
          />
        </label>
        <p className="slotab-donate-hint">{fund.tributeHint}</p>
      </fieldset>

      <fieldset className="slotab-donate-fieldset">
        <legend>Your information</legend>
        <label className="slotab-donate-field">
          <span>Name</span>
          <input
            type="text"
            required
            autoComplete="name"
            placeholder="First Last"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
          />
        </label>
        <label className="slotab-donate-field">
          <span>Email</span>
          <input
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            value={donorEmail}
            onChange={(e) => setDonorEmail(e.target.value)}
          />
        </label>
        <label className="slotab-donate-field">
          <span>Phone (optional)</span>
          <input
            type="tel"
            autoComplete="tel"
            placeholder="(805) 555-1212"
            value={donorPhone}
            onChange={(e) => setDonorPhone(e.target.value)}
          />
        </label>
        <label className="slotab-donate-checkbox">
          <input
            type="checkbox"
            checked={displayOnWall}
            onChange={(e) => setDisplayOnWall(e.target.checked)}
          />
          <span>
            <strong>Display my name on the SLOTAB Donor Wall.</strong> Uncheck
            to give anonymously — your gift still counts toward the fund.
          </span>
        </label>
      </fieldset>

      <button
        type="button"
        className="slotab-btn slotab-donate-submit"
        disabled={!canSubmit || starting || checkoutUrl !== null}
        aria-busy={starting}
        onClick={startCheckout}
      >
        {starting
          ? "Opening secure checkout…"
          : `Give ${MONEY.format(effectiveAmount || FLOOR)}${
              chosenLevel ? ` — ${chosenLevel.item.toLowerCase()}` : ""
            }`}
      </button>

      {!donorComplete && !checkoutUrl && (
        <p className="slotab-donate-note">
          Add your name and email so we can thank you and send your receipt.
        </p>
      )}

      {checkoutUrl && (
        <div className="slotab-donate-handoff" role="status">
          <p className="slotab-donate-handoff-lead">
            Taking you to secure checkout for{" "}
            <strong>{MONEY.format(effectiveAmount)}</strong> to the Hall of Fame
            Fund.
          </p>
          <p>
            The amount is already set — you only need your card details. Nothing
            has been charged yet.
          </p>
          <p className="slotab-donate-continue">
            <a href={checkoutUrl} className="slotab-btn">
              Continue to secure checkout →
            </a>
            {secondsLeft !== null && (
              <span className="slotab-donate-countdown" aria-live="polite">
                Taking you there in {secondsLeft}
                {secondsLeft === 1 ? " second" : " seconds"}…
              </span>
            )}
          </p>
        </div>
      )}

      {unavailable && (
        <div className="slotab-donate-handoff" role="alert">
          <p className="slotab-donate-handoff-lead">
            Card checkout isn&apos;t available right now.
          </p>
          <p>
            Rather than send you to our general store — which has no Hall of
            Fame item, so your gift would be recorded against the wrong fund —
            send us the details and we&apos;ll take it directly. Nothing has
            been charged.
          </p>
          <p>
            <a className="slotab-btn outline" href={rescueMailto}>
              Send us your gift details →
            </a>
          </p>
        </div>
      )}

      {error && (
        <p className="slotab-donate-warning" role="alert">
          {error}
        </p>
      )}

      <p className="slotab-donate-note">
        SLOTAB is a 501(c)(3) charitable organization. Gifts are tax-deductible
        to the extent allowed by law.
      </p>
    </div>
  );
}
