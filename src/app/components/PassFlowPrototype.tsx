"use client";

import { useMemo, useState } from "react";
import teamsData from "../data/teams.json";
import { levelForGift, passesForLevel } from "../data/sponsor-tiers";
import { pickerFunds, specialFund, isUnsplitDesignation } from "../data/special-funds";
import {
  activePasses,
  includedPasses,
  passLineLabel,
  passTotal,
  passTypeById,
  type PassSelection,
} from "../data/passes";
import PassAddOn from "./PassAddOn";

// A WORKING PROTOTYPE OF THE GIVING FLOW WITH GAME PASSES IN IT — for the
// board to click through, not for donors.
//
// Trina, 2026-08-28: put the option to buy passes into the membership purchase
// flow. Erik saw two shapes for it — an add-on inside the form, or a follow-on
// screen after the level is chosen — and asked for both, so the board can try
// them rather than choose from a description. `variant` is which one this is.
//
// WHY THIS IS A SEPARATE COMPONENT AND NOT A FLAG ON `DonateForm`
// `DonateForm` mints real Square checkouts on the live site. Threading two
// experimental layouts and a "stop before paying" mode through it would put
// prototype branches in the path of every real donation for the length of a
// board discussion, to save duplicating a form's worth of markup. So this is a
// copy of the controls — the same amount ladder, the same designation select,
// the same donor block, reading the same data modules — and `/donate` is not
// touched at all.
//
// The part that is NOT duplicated is the part that matters: `PassAddOn` is the
// real component, shared by both variants, and is what moves into `DonateForm`
// when the board picks one. This file is scaffolding around it and should be
// deleted the same day.
//
// WHERE IT STOPS, AND WHY THERE
// The submit button does not call `/api/square/payment-link`. It renders the
// order that route WOULD be asked to mint — line items, total, metadata — and
// stops. That is the whole of Erik's brief ("function all the way up to the
// Square integration and then stop"), and it is also the honest boundary: a
// pass order needs a second line item, and `lib/square.ts` builds exactly one.
// Pretending otherwise by minting a donation-only checkout would show the board
// a flow that silently dropped the thing they came to look at.

type Team = { slug: string; name: string; gender?: string; season: string };

/** The name as it reaches Square, gender and all.
 *
 *  Copied from `/api/square/payment-link` deliberately: eight sports field a
 *  boys' and a girls' squad under one name, so the friendly label this form
 *  uses in prose ("75% to Volleyball") is ambiguous on a receipt. The review
 *  screen has to show the string the Treasurer would actually see in Square,
 *  or it is previewing a different order from the one that would be minted. */
function teamDisplayName(team: Team): string {
  return !team.gender || team.gender === "Co-ed"
    ? team.name
    : `${team.name} (${team.gender})`;
}

const TEAMS = (teamsData.teams as Team[])
  .slice()
  .sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      (a.gender ?? "").localeCompare(b.gender ?? ""),
  );

const ONE_TIME_TIERS = [25, 50, 100, 200, 500, 1000, 5000];
const ONE_TIME_FLOOR = 25;

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const MONEY_CENTS = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

/** Square's cap on order metadata pairs — the same constant `lib/square.ts`
 *  enforces, restated here because the review screen counts against it. Ten is
 *  not generous: a Hall of Fame gift already lands on exactly ten. */
const METADATA_MAX_KEYS = 10;

type Step = "gift" | "passes" | "details" | "review";

export default function PassFlowPrototype({
  variant,
}: {
  /** "inline" — passes are a fieldset inside the one-page form.
   *  "step"   — passes get their own screen after the level is chosen. */
  variant: "inline" | "step";
}) {
  const [amount, setAmount] = useState<number>(50);
  const [other, setOther] = useState("");
  const [team, setTeam] = useState("");
  const [teamError, setTeamError] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [displayOnWall, setDisplayOnWall] = useState(true);
  const [passes, setPasses] = useState<PassSelection[]>([]);
  // The step variant walks these in order; the inline variant sits on "gift"
  // until it reaches the review screen, which both share.
  const [step, setStep] = useState<Step>("gift");

  const effectiveAmount = useMemo(() => {
    const parsed = other ? Number(other) : amount;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount, other]);

  const level = levelForGift(effectiveAmount);
  const fund = specialFund(team);
  const isGeneral = team === "general";
  const unsplit = isUnsplitDesignation(team);
  const hasDesignation = team !== "";
  const tooLow = effectiveAmount > 0 && effectiveAmount < ONE_TIME_FLOOR;

  const teamEntry = TEAMS.find((t) => t.slug === team);
  const teamLabel = isGeneral
    ? "SLOTAB General Fund"
    : fund
      ? fund.label
      : (teamEntry?.name ?? "your team");
  /** What the line item would say — gendered, unlike `teamLabel`. */
  const receiptLabel = teamEntry ? teamDisplayName(teamEntry) : teamLabel;

  // The gift reached this level by AMOUNT, not by buying a sponsorship — which
  // is the distinction `includedPasses` refuses to paper over, and the one live
  // question on the preview page.
  const included = includedPasses(level, "donation-level", passesForLevel);

  const passesTotal = passTotal(passes);
  const orderTotal = effectiveAmount + passesTotal;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);
  const donorComplete = donorName.trim().length > 0 && emailValid;
  const giftReady = effectiveAmount > 0 && !tooLow && hasDesignation;

  /** What `/api/square/payment-link` would be asked to mint. Built here so the
   *  review screen shows the real shape rather than a description of it —
   *  including the two places it does not fit through the integration as it
   *  stands today. */
  const order = useMemo(() => {
    const lineItems: { name: string; qty: number; amountCents: number }[] = [];
    const levelSuffix = level ? ` (${level})` : "";
    lineItems.push({
      name: fund
        ? `${fund.label} — donation${levelSuffix}`
        : isGeneral
          ? `SLOTAB General Fund — donation${levelSuffix}`
          : `${receiptLabel} — SLOTAB donation${levelSuffix}`,
      qty: 1,
      amountCents: Math.round(effectiveAmount * 100),
    });
    for (const sel of activePasses(passes)) {
      const type = passTypeById(sel.passId);
      if (!type) continue;
      lineItems.push({
        name: `${passLineLabel(sel)} — 2026-27`,
        qty: sel.qty,
        amountCents: type.price * 100,
      });
    }

    // Mirrors the route's metadata block, plus the one new key. Passes are
    // encoded into a SINGLE pair on purpose: Square allows ten, a Hall of Fame
    // gift already uses ten, and a key per pass type would push the keys the
    // Treasurer's report is grouped on off the end of the list.
    const metadata: Record<string, string> = {
      source: "slotab-website",
      kind: "donation",
      designation: team,
    };
    if (level) metadata.level = level;
    if (!isGeneral && !fund) metadata.split = "75-25";
    if (fund?.qbClass) metadata.qbClass = fund.qbClass;
    const passCode = activePasses(passes)
      .map((s) => `${s.passId}:${s.qty}${s.season ? `@${s.season}` : ""}`)
      .join(",");
    if (passCode) metadata.passes = passCode;
    if (donorName.trim()) metadata.donor = donorName.trim().slice(0, 255);
    if (donorPhone.trim()) metadata.phone = donorPhone.trim();
    if (!displayOnWall) metadata.wall = "no";

    return { lineItems, metadata };
  }, [
    displayOnWall,
    donorName,
    donorPhone,
    effectiveAmount,
    fund,
    isGeneral,
    level,
    passes,
    receiptLabel,
    team,
  ]);

  const metadataKeys = Object.keys(order.metadata);

  function goToPasses() {
    if (!giftReady) {
      if (!hasDesignation) setTeamError(true);
      return;
    }
    setStep("passes");
  }

  // ------------------------------------------------------------------ pieces
  // Each block is a function rather than a component so the two variants can
  // arrange them differently without either one re-declaring the state above.

  const giftBlock = (
    <>
      <fieldset className="slotab-donate-fieldset">
        <legend>Amount</legend>
        <div className="slotab-donate-ladder">
          {ONE_TIME_TIERS.map((v) => (
            <button
              key={v}
              type="button"
              className={`slotab-donate-amount ${!other && amount === v ? "on" : ""}`}
              onClick={() => {
                setAmount(v);
                setOther("");
              }}
            >
              ${v}
            </button>
          ))}
        </div>
        <label className="slotab-donate-other">
          <span>Or enter another amount:</span>
          <span className="slotab-donate-other-input">
            <span className="dollar">$</span>
            <input
              type="number"
              inputMode="decimal"
              min={ONE_TIME_FLOOR}
              step={1}
              placeholder={`${ONE_TIME_FLOOR} minimum`}
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
          </span>
        </label>
        {tooLow && (
          <p className="slotab-donate-warning">
            Donations must be at least {MONEY.format(ONE_TIME_FLOOR)}.
          </p>
        )}
      </fieldset>

      <fieldset className="slotab-donate-fieldset slotab-donate-designate">
        <legend>Designate your gift</legend>
        <select
          value={team}
          onChange={(e) => {
            setTeam(e.target.value);
            setTeamError(false);
          }}
          className={`slotab-donate-select ${teamError ? "invalid" : ""}`}
          aria-invalid={teamError}
        >
          <option value="" disabled>
            SELECT A SPORT OR GENERAL DONATION
          </option>
          <option value="general">SLOTAB General Fund (all teams)</option>
          {/* Empty since 2026-08-29 — a named fund is not a designation (see
              `offerInPicker`). No deep-link case to carry here, unlike the real
              form: nothing links into a prototype with a fund preselected. */}
          {pickerFunds().map((f) => (
            <option key={f.slug} value={f.slug}>
              {f.label}
            </option>
          ))}
          {TEAMS.map((t) => (
            <option key={t.slug} value={t.slug}>
              {!t.gender || t.gender === "Co-ed"
                ? t.name
                : `${t.name} (${t.gender})`}
            </option>
          ))}
        </select>
        {teamError && (
          <p className="slotab-donate-warning" role="alert">
            Please choose a sport — or the SLOTAB General Fund — before
            continuing.
          </p>
        )}
      </fieldset>

      {effectiveAmount > 0 && !tooLow && (
        <div className="slotab-donate-preview">
          {!hasDesignation ? (
            <div className="slotab-donate-preview-row muted">
              <span>Choose a designation above to see how your gift splits.</span>
            </div>
          ) : (
            <>
              <div className="slotab-donate-preview-row">
                <span>
                  {isGeneral
                    ? "100% of your gift powers the SLOTAB General Fund"
                    : fund
                      ? `100% of your gift goes to ${fund.label}`
                      : `75% to ${teamLabel}`}
                </span>
                <strong>
                  {MONEY.format(unsplit ? effectiveAmount : effectiveAmount * 0.75)}
                </strong>
              </div>
              {!unsplit && (
                <div className="slotab-donate-preview-row muted">
                  <span>25% to SLOTAB General Fund</span>
                  <strong>{MONEY.format(effectiveAmount * 0.25)}</strong>
                </div>
              )}
            </>
          )}
          {level && (
            <div className="slotab-donate-tier-callout">
              Your gift qualifies you at the <strong>{level}</strong> level.
            </div>
          )}
        </div>
      )}
    </>
  );

  const passBlock = (
    <PassAddOn
      included={included}
      selections={passes}
      onChange={setPasses}
      idPrefix={variant}
    />
  );

  const detailsBlock = (
    <fieldset className="slotab-donate-fieldset">
      <legend>Your information</legend>
      <label className="slotab-donate-field">
        <span>Name</span>
        <input
          type="text"
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
          <strong>Display my name on the SLOTAB Donor Wall.</strong> Uncheck to
          give anonymously.
        </span>
      </label>
      {activePasses(passes).length > 0 && (
        <p className="slotab-donate-hint">
          Passes are issued to this email address.
        </p>
      )}
    </fieldset>
  );

  // Running total, shown whenever passes are in play so the number on the
  // button is never the first time someone sees what they are about to pay.
  const totalsBlock = giftReady && (
    <div className="slotab-pass-summary">
      <div className="slotab-donate-preview-row">
        <span>Donation to {teamLabel}</span>
        <strong>{MONEY.format(effectiveAmount)}</strong>
      </div>
      {activePasses(passes).map((sel) => (
        <div
          className="slotab-donate-preview-row"
          key={`${sel.passId}-${sel.season ?? ""}`}
        >
          <span>
            {passLineLabel(sel)} × {sel.qty}
          </span>
          <strong>
            {MONEY.format((passTypeById(sel.passId)?.price ?? 0) * sel.qty)}
          </strong>
        </div>
      ))}
      <div className="slotab-pass-summary-total">
        <span>Total today</span>
        <strong>{MONEY.format(orderTotal)}</strong>
      </div>
      {included && (
        <p className="slotab-donate-hint">
          Plus the {included.count} pass{included.count === 1 ? "" : "es"} your{" "}
          {included.level} level includes, at no charge.
        </p>
      )}
    </div>
  );

  // ------------------------------------------------------------ review screen
  // Shared by both variants: this is where the prototype stops.
  if (step === "review") {
    return (
      <div className="slotab-donate-form">
        <div className="slotab-proto-stop" role="status">
          <span className="slotab-proto-stop-flag">Prototype stops here</span>
          <p>
            On the real site this button would open Square&apos;s secure
            checkout for <strong>{MONEY.format(orderTotal)}</strong>. Nothing
            was sent and no payment link exists — everything below is what
            Square <em>would</em> be asked for.
          </p>
        </div>

        <h3 className="slotab-proto-head">The order</h3>
        <table className="slotab-proto-table">
          <thead>
            <tr>
              <th>Line item</th>
              <th>Qty</th>
              <th>Line total</th>
            </tr>
          </thead>
          <tbody>
            {order.lineItems.map((li) => (
              <tr key={li.name}>
                <td>{li.name}</td>
                <td>{li.qty}</td>
                <td>{MONEY_CENTS.format((li.amountCents * li.qty) / 100)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td />
              <td>{MONEY_CENTS.format(orderTotal)}</td>
            </tr>
          </tfoot>
        </table>

        <h3 className="slotab-proto-head">
          Order metadata — {metadataKeys.length} of {METADATA_MAX_KEYS} keys
        </h3>
        <ul className="slotab-proto-meta">
          {metadataKeys.map((k) => (
            <li key={k}>
              <code>{k}</code> = <code>{order.metadata[k]}</code>
            </li>
          ))}
        </ul>
        {metadataKeys.length >= METADATA_MAX_KEYS && (
          <p className="slotab-donate-warning">
            At Square&apos;s ten-key cap. A tribute or a test marker on top of
            this order would push a key off the end — which is why the passes
            ride in one encoded key rather than one per pass type.
          </p>
        )}

        <h3 className="slotab-proto-head">What is still to build</h3>
        <ul className="slotab-proto-todo">
          <li>
            <strong>A second line item.</strong> <code>lib/square.ts</code>{" "}
            builds exactly one, quantity 1. Passes need one line per type with a
            real quantity — a small change, but it is the reason this stops here
            rather than opening a checkout that quietly charged for the gift
            alone.
          </li>
          <li>
            <strong>Fulfilment.</strong> A paid pass has to reach a human. The
            sponsorship handoff email already tells the Membership VP to{" "}
            &ldquo;issue via GoFan to the email on this message&rdquo; for
            included passes; a purchased pass needs the same line, and the
            donation checklist does not raise one today.
          </li>
          <li>
            <strong>The receipt has to split.</strong> The gift is
            tax-deductible and the passes are not. The acknowledgement letter
            has to state the pass value as goods received — the club already
            owes this for sponsorship perks, so the rule exists; it just has to
            cover this path too.
          </li>
          <li>
            <strong>The Treasurer&apos;s report.</strong>{" "}
            <code>/board/square-report</code> splits a designated gift 75/25.
            Pass revenue is neither designated nor split, so it must be counted
            apart or every per-sport total is overstated by the passes bought
            alongside it.
          </li>
        </ul>

        <button
          type="button"
          className="slotab-btn outline"
          onClick={() => setStep(variant === "step" ? "details" : "gift")}
        >
          ← Back to the form
        </button>
      </div>
    );
  }

  // ------------------------------------------------------------- the variants
  if (variant === "inline") {
    return (
      <div className="slotab-donate-form">
        {giftBlock}

        {/* The add-on sits between the gift and the donor block: after the
            level is known (so the included count can be stated) and before the
            form asks for a name, which is where a buyer expects the basket to
            be settled. */}
        <fieldset className="slotab-donate-fieldset">
          <legend>Add game passes</legend>
          {giftReady ? (
            passBlock
          ) : (
            <p className="slotab-donate-hint">
              Choose an amount and a designation above and your pass options
              appear here.
            </p>
          )}
        </fieldset>

        {detailsBlock}
        {totalsBlock}

        <button
          type="button"
          className="slotab-btn slotab-donate-submit"
          disabled={!giftReady || !donorComplete}
          onClick={() => setStep("review")}
        >
          {passesTotal > 0
            ? `Continue — ${MONEY.format(orderTotal)}`
            : `Donate ${MONEY.format(effectiveAmount || ONE_TIME_FLOOR)}`}
        </button>
        {!donorComplete && giftReady && (
          <p className="slotab-donate-note">
            Add your name and email to continue.
          </p>
        )}
      </div>
    );
  }

  // variant === "step"
  return (
    <div className="slotab-donate-form">
      <ol className="slotab-proto-steps" aria-label="Progress">
        {(
          [
            ["gift", "Your gift"],
            ["passes", "Passes"],
            ["details", "Your info"],
          ] as const
        ).map(([id, label], i) => (
          <li key={id} className={step === id ? "on" : ""}>
            <span className="slotab-proto-step-n">{i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === "gift" && (
        <>
          {giftBlock}
          <button
            type="button"
            className="slotab-btn slotab-donate-submit"
            onClick={goToPasses}
          >
            Continue →
          </button>
        </>
      )}

      {step === "passes" && (
        <>
          <div className="slotab-proto-recap">
            {MONEY.format(effectiveAmount)} to {teamLabel}
            {level && <> · {level} level</>}{" "}
            <button
              type="button"
              className="slotab-proto-edit"
              onClick={() => setStep("gift")}
            >
              Change
            </button>
          </div>

          <h3 className="slotab-proto-head">
            {included
              ? "You receive passes with this level — want more?"
              : "Add game passes?"}
          </h3>
          {passBlock}

          <button
            type="button"
            className="slotab-btn slotab-donate-submit"
            onClick={() => setStep("details")}
          >
            {passesTotal > 0
              ? `Add ${MONEY.format(passesTotal)} in passes →`
              : "Continue →"}
          </button>
          {/* An explicit decline, not just a Continue. The screen asks a
              question; a button that answers "no" is how someone leaves it
              without wondering whether they missed a step. */}
          {passesTotal === 0 && (
            <button
              type="button"
              className="slotab-btn outline"
              onClick={() => setStep("details")}
            >
              No thanks — continue without passes
            </button>
          )}
        </>
      )}

      {step === "details" && (
        <>
          {detailsBlock}
          {totalsBlock}
          <button
            type="button"
            className="slotab-btn slotab-donate-submit"
            disabled={!donorComplete}
            onClick={() => setStep("review")}
          >
            Continue — {MONEY.format(orderTotal)}
          </button>
          {!donorComplete && (
            <p className="slotab-donate-note">
              Add your name and email to continue.
            </p>
          )}
          <button
            type="button"
            className="slotab-btn outline"
            onClick={() => setStep("passes")}
          >
            ← Back to passes
          </button>
        </>
      )}
    </div>
  );
}
