"use client";

import {
  PASS_SEASONS,
  PASS_TYPES,
  activePasses,
  passTotal,
  passTypeById,
  type IncludedPasses,
  type PassSeason,
  type PassSelection,
} from "../data/passes";

// The gate-pass picker: "you receive N — want more?", and a quantity stepper
// per pass type.
//
// THIS IS THE PRODUCTION-SHAPED PIECE OF THE PROTOTYPE.
// The two preview pages under /preview/passes differ only in WHERE this panel
// appears — inline in the giving form, or on a screen of its own after the
// level is chosen. The panel itself is the same component in both, so whichever
// layout the board picks, this is the file that moves into `DonateForm` and the
// other one is deleted. Nothing here talks to Square or to a route; it is a
// controlled input over `PassSelection[]` and nothing else.
//
// WHY THE INCLUDED COUNT LEADS
// Trina's ask was specific: a level that already includes passes must say so
// before offering more. A Gold sponsor who is sold an eighth pass they were
// about to be given for free is the failure this panel exists to prevent, and
// the club would only find out when the Membership VP issued both.

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function PassAddOn({
  included,
  selections,
  onChange,
  idPrefix = "pass",
}: {
  /** Passes the buyer's level already carries, or null when it carries none. */
  included: IncludedPasses | null;
  selections: PassSelection[];
  onChange: (next: PassSelection[]) => void;
  idPrefix?: string;
}) {
  const total = passTotal(selections);
  const chosen = activePasses(selections);

  function qtyOf(passId: string): number {
    return selections.find((s) => s.passId === passId)?.qty ?? 0;
  }

  function seasonOf(passId: string): PassSeason | undefined {
    return selections.find((s) => s.passId === passId)?.season;
  }

  function setQty(passId: string, qty: number) {
    const type = passTypeById(passId);
    if (!type) return;
    const clamped = Math.max(0, Math.min(type.maxQty, Math.floor(qty)));
    const rest = selections.filter((s) => s.passId !== passId);
    if (clamped === 0) {
      onChange(rest);
      return;
    }
    // A season-bearing pass defaults to the first season rather than to
    // undefined: an order for "a Single Season Pass, season unspecified" is
    // one the club cannot fulfil, and a required control that starts empty is
    // a validation error waiting to happen at the end of a long form.
    const existing = selections.find((s) => s.passId === passId);
    onChange([
      ...rest,
      {
        passId,
        qty: clamped,
        ...(type.needsSeason
          ? { season: existing?.season ?? PASS_SEASONS[0] }
          : {}),
      },
    ]);
  }

  function setSeason(passId: string, season: PassSeason) {
    onChange(
      selections.map((s) => (s.passId === passId ? { ...s, season } : s)),
    );
  }

  return (
    <div className="slotab-pass-addon">
      {included && (
        <p className="slotab-pass-included" role="note">
          <strong>
            Your {included.level} level already includes {included.count}{" "}
            All-Sport Annual Pass{included.count === 1 ? "" : "es"}.
          </strong>{" "}
          We&apos;ll issue {included.count === 1 ? "it" : "them"} to the email
          you give us — nothing to buy here for {included.count === 1 ? "that one" : "those"}. Want
          to add more?
        </p>
      )}

      <div className="slotab-pass-options">
        {PASS_TYPES.map((type) => {
          const qty = qtyOf(type.id);
          const inputId = `${idPrefix}-${type.id}-qty`;
          return (
            <div
              key={type.id}
              className={`slotab-pass-option${qty > 0 ? " on" : ""}`}
            >
              <div className="slotab-pass-option-head">
                <h4>{type.name}</h4>
                <span className="slotab-pass-price">
                  {MONEY.format(type.price)}
                </span>
              </div>
              <p className="slotab-pass-blurb">{type.blurb}</p>

              <div className="slotab-pass-controls">
                {/* A stepper rather than a bare number input: on a phone this
                    is the difference between two taps and summoning a keypad,
                    and most orders are one or two passes. The number input
                    stays for the family buying five. */}
                <div className="slotab-pass-stepper">
                  <button
                    type="button"
                    aria-label={`Remove one ${type.name}`}
                    disabled={qty === 0}
                    onClick={() => setQty(type.id, qty - 1)}
                  >
                    −
                  </button>
                  <input
                    id={inputId}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={type.maxQty}
                    step={1}
                    value={qty}
                    aria-label={`Quantity — ${type.name}`}
                    onChange={(e) => setQty(type.id, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    aria-label={`Add one ${type.name}`}
                    disabled={qty >= type.maxQty}
                    onClick={() => setQty(type.id, qty + 1)}
                  >
                    +
                  </button>
                </div>

                {/* Only once one is in the basket. A season dropdown sitting
                    beside a zero quantity is a question about a thing nobody
                    is buying. */}
                {type.needsSeason && qty > 0 && (
                  <label className="slotab-pass-season">
                    <span>Season</span>
                    <select
                      className="slotab-donate-select"
                      value={seasonOf(type.id) ?? PASS_SEASONS[0]}
                      onChange={(e) =>
                        setSeason(type.id, e.target.value as PassSeason)
                      }
                    >
                      {PASS_SEASONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {qty > 0 && (
                  <span className="slotab-pass-line-total">
                    {qty} × {MONEY.format(type.price)} ={" "}
                    <strong>{MONEY.format(qty * type.price)}</strong>
                  </span>
                )}
              </div>

              {qty >= type.maxQty && (
                <p className="slotab-donate-hint">
                  {type.maxQty} is the most this form takes — for a bigger
                  block, email the membership team and we&apos;ll sort it out
                  directly.
                </p>
              )}
            </div>
          );
        })}
      </div>

      {chosen.length > 0 && (
        <div className="slotab-pass-total" aria-live="polite">
          <span>Passes added</span>
          <strong>{MONEY.format(total)}</strong>
        </div>
      )}

      {/* Said here rather than in a receipt nobody has received yet. A pass is
          goods received in exchange for money, so unlike the gift above it the
          purchase is NOT deductible — and the club has to keep the two apart
          on the acknowledgement letter anyway (the IRS quid-pro-quo rule the
          donation checklist already handles for sponsorship perks). Better the
          buyer reads it before paying than discovers it at tax time. */}
      {total > 0 && (
        <p className="slotab-donate-note">
          Passes are a purchase, not a donation — the{" "}
          {MONEY.format(total)} for passes is <strong>not</strong>{" "}
          tax-deductible. Your gift above still is.
        </p>
      )}
    </div>
  );
}
