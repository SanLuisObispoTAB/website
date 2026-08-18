"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import teamsData from "../data/teams.json";
import {
  squareDonateUrl,
  hasOwnSquareItem,
  squareItemLabel,
} from "../data/square-donate";

type Team = {
  slug: string;
  name: string;
  /** Absent for a team with no gender designation — the option shows the
   *  bare name, with no empty parenthetical. */
  gender?: string;
  season: string;
};

const TEAMS = (teamsData.teams as Team[])
  .slice()
  .sort(
    (a, b) =>
      a.name.localeCompare(b.name) ||
      (a.gender ?? "").localeCompare(b.gender ?? ""),
  );

const ONE_TIME_TIERS = [25, 50, 100, 200, 500, 1000, 5000];
const MONTHLY_TIERS = [10, 25, 50, 100, 200, 500];

const ONE_TIME_FLOOR = 25;
const MONTHLY_FLOOR = 10;

// Membership tier qualification thresholds — pulled from the
// 2026-05-06 research draft. Annual one-time OR (monthly × 12) qualifies.
const TIERS = [
  { name: "Supporter", oneTime: 25, monthly: 10 },
  { name: "Fan", oneTime: 250, monthly: 25 },
  { name: "Booster", oneTime: 500, monthly: 50 },
  { name: "Champion", oneTime: 1500, monthly: 125 },
  { name: "Patron", oneTime: 5000, monthly: 420 },
];

function tierForGift(amount: number, mode: "one-time" | "monthly") {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    const t = TIERS[i];
    const threshold = mode === "monthly" ? t.monthly : t.oneTime;
    if (amount >= threshold) return t.name;
  }
  return null;
}

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DonateForm() {
  const params = useSearchParams();
  // Empty means "not chosen yet", which is the point: donors were skimming
  // past this control and letting it sit on its old General Fund default,
  // so gifts meant for a sport were landing undesignated. A `?team=` link
  // from a team page still arrives pre-chosen — those donors have already
  // told us where the gift goes.
  const initialTeam = params.get("team") ?? "";

  const [mode, setMode] = useState<"one-time" | "monthly">("one-time");
  const [amount, setAmount] = useState<number>(50);
  const [other, setOther] = useState<string>("");
  const [team, setTeam] = useState<string>(initialTeam);
  // Raised only when someone tries to submit without designating. Deliberately
  // not a disabled button: a dead control gives no reason, and the reason is
  // the whole problem here.
  const [teamError, setTeamError] = useState(false);
  const teamSelectRef = useRef<HTMLSelectElement>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  // Donor identity — any donation also enrolls the donor as a SLOTAB
  // member (board decision 2026-05-06 #37). Captured here so the same
  // submission creates both the donation record and the contact in
  // Springly when wiring lands.
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [displayOnWall, setDisplayOnWall] = useState(true);
  // Set once the donor has been handed off to Square, so the follow-up
  // panel appears instead of pre-cluttering the form with caveats.
  const [handedOff, setHandedOff] = useState(false);

  const tiers = mode === "monthly" ? MONTHLY_TIERS : ONE_TIME_TIERS;
  const floor = mode === "monthly" ? MONTHLY_FLOOR : ONE_TIME_FLOOR;

  const effectiveAmount = useMemo(() => {
    const parsed = other ? Number(other) : amount;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount, other]);

  const tier = tierForGift(effectiveAmount, mode);
  const teamShare = effectiveAmount * 0.75;
  const generalShare = effectiveAmount * 0.25;
  const isGeneral = team === "general";
  const hasDesignation = team !== "";
  const tooLow = effectiveAmount > 0 && effectiveAmount < floor;

  const teamLabel =
    isGeneral
      ? "SLOTAB General Fund"
      : TEAMS.find((t) => t.slug === team)?.name ?? "your team";

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail);
  const donorComplete = donorName.trim().length > 0 && emailValid;
  const submitDisabled =
    tooLow || effectiveAmount <= 0 || !donorComplete;

  // Square's hosted items are one-time purchases that collect a name, an
  // email and an amount. Everything else the form asks for has nowhere to go
  // in that checkout, so it is gathered into a pre-written email the donor
  // sends to the membership address. Not elegant, but it is durable — an
  // email in an inbox — and needs no backend, which is the constraint until
  // Q1 is decided.
  const unrecordedIntent: string[] = [];
  if (mode === "monthly") {
    unrecordedIntent.push(
      `Wants to give ${MONEY.format(effectiveAmount)}/month, not a one-time gift` +
        (autoRenew ? ", with the 4-year lock-in" : ""),
    );
  }
  if (!displayOnWall) {
    unrecordedIntent.push("Asked to stay anonymous — do not list on the donor wall");
  }
  if (tier) {
    unrecordedIntent.push(`Qualifies for the ${tier} membership tier`);
  }
  if (!isGeneral) {
    unrecordedIntent.push(
      `Designated ${teamLabel} — recorded on Square as "${squareItemLabel(team)}"`,
    );
  }

  const intentMailto = (() => {
    const body = [
      "I've just donated through the SLOTAB Square store. Here are the details the checkout couldn't capture:",
      "",
      `Name: ${donorName}`,
      `Email: ${donorEmail}`,
      donorPhone ? `Phone: ${donorPhone}` : null,
      `Amount: ${MONEY.format(effectiveAmount)}${mode === "monthly" ? " per month" : " one-time"}`,
      `Designation: ${teamLabel}`,
      "",
      ...unrecordedIntent.map((l) => `- ${l}`),
    ]
      .filter((l) => l !== null)
      .join("\n");
    return (
      "mailto:slotabmembership@gmail.com" +
      `?subject=${encodeURIComponent("Donation details — " + (donorName || "SLOTAB donor"))}` +
      `&body=${encodeURIComponent(body)}`
    );
  })();

  return (
    <div className="slotab-donate-form">
      {/* Mode toggle */}
      <div
        className="slotab-donate-mode"
        role="tablist"
        aria-label="Donation type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "one-time"}
          className={`slotab-donate-mode-btn ${mode === "one-time" ? "on" : ""}`}
          onClick={() => {
            setMode("one-time");
            setOther("");
            setAmount(50);
            setAutoRenew(false);
          }}
        >
          One-time
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "monthly"}
          className={`slotab-donate-mode-btn ${mode === "monthly" ? "on" : ""}`}
          onClick={() => {
            setMode("monthly");
            setOther("");
            setAmount(25);
          }}
        >
          Monthly recurring
        </button>
      </div>

      {/* Tier ladder */}
      <fieldset className="slotab-donate-fieldset">
        <legend>
          {mode === "monthly" ? "Monthly amount" : "One-time amount"}
        </legend>
        <div className="slotab-donate-ladder">
          {tiers.map((v) => (
            <button
              key={v}
              type="button"
              className={`slotab-donate-amount ${
                !other && amount === v ? "on" : ""
              }`}
              onClick={() => {
                setAmount(v);
                setOther("");
              }}
            >
              ${v}
              {mode === "monthly" && (
                <span className="slotab-donate-mo">/mo</span>
              )}
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
              min={floor}
              step={1}
              placeholder={`${floor} minimum`}
              value={other}
              onChange={(e) => setOther(e.target.value)}
            />
            {mode === "monthly" && <span className="suffix">/mo</span>}
          </span>
        </label>
        {tooLow && (
          <p className="slotab-donate-warning">
            {mode === "monthly"
              ? `Monthly recurring donations must be at least ${MONEY.format(floor)}/mo.`
              : `One-time donations must be at least ${MONEY.format(floor)}.`}
          </p>
        )}
      </fieldset>

      {/* Team designation — boxed in gold because this is the one control
          donors were missing, and an unchosen designation is the difference
          between a gift reaching a sport and landing in the general pot. */}
      <fieldset className="slotab-donate-fieldset slotab-donate-designate">
        <legend>Designate your gift</legend>
        <select
          id="donate-designation"
          ref={teamSelectRef}
          value={team}
          onChange={(e) => {
            setTeam(e.target.value);
            setTeamError(false);
          }}
          className={`slotab-donate-select ${teamError ? "invalid" : ""}`}
          aria-invalid={teamError}
          aria-describedby={
            teamError ? "donate-designation-error" : "donate-designation-hint"
          }
        >
          {/* Disabled so it can't be chosen back once they've moved off it,
              but still shown while `team` is "". */}
          <option value="" disabled>
            SELECT A SPORT OR GENERAL DONATION
          </option>
          <option value="general">SLOTAB General Fund (all teams)</option>
          {TEAMS.map((t) => (
            <option key={t.slug} value={t.slug}>
              {!t.gender || t.gender === "Co-ed"
                ? t.name
                : `${t.name} (${t.gender})`}
            </option>
          ))}
        </select>
        {teamError ? (
          <p
            className="slotab-donate-warning"
            id="donate-designation-error"
            role="alert"
          >
            Please choose a sport — or the SLOTAB General Fund — before
            donating.
          </p>
        ) : (
          <p className="slotab-donate-hint" id="donate-designation-hint">
            {hasDesignation
              ? "You can change this any time before checkout."
              : "Pick the team you want to support, or give to the General Fund."}
          </p>
        )}
      </fieldset>

      {/* 4-year auto-renew (recurring only) */}
      {mode === "monthly" && (
        <fieldset className="slotab-donate-fieldset">
          <legend>Commitment</legend>
          <label className="slotab-donate-checkbox">
            <input
              type="checkbox"
              checked={autoRenew}
              onChange={(e) => setAutoRenew(e.target.checked)}
            />
            <span>
              <strong>Lock in 4 years at this rate.</strong> Your tier and
              monthly amount stay the same even if thresholds rise. Includes
              a &quot;Founding 4&quot; recognition pin. Cancel any time.
            </span>
          </label>
        </fieldset>
      )}

      {/* Allocation preview */}
      {effectiveAmount > 0 && !tooLow && (
        <div className="slotab-donate-preview">
          {!hasDesignation ? (
            /* Without a designation there is no split to show, and the old
               copy fell through to "75% to your team" — which read as though
               a team had already been chosen. */
            <div className="slotab-donate-preview-row muted">
              <span>
                Choose a designation above to see how your gift splits.
              </span>
            </div>
          ) : (
            <>
              <div className="slotab-donate-preview-row">
                <span>
                  {isGeneral
                    ? "100% of your gift powers the SLOTAB General Fund"
                    : `75% to ${teamLabel}`}
                </span>
                <strong>
                  {isGeneral
                    ? MONEY.format(effectiveAmount)
                    : MONEY.format(teamShare)}
                  {mode === "monthly" && "/mo"}
                </strong>
              </div>
              {!isGeneral && (
                <div className="slotab-donate-preview-row muted">
                  <span>
                    25% to SLOTAB General Fund (Hudl, senior banners,
                    T-shirts &mdash; benefits every Tigers team)
                  </span>
                  <strong>
                    {MONEY.format(generalShare)}
                    {mode === "monthly" && "/mo"}
                  </strong>
                </div>
              )}
            </>
          )}
          {tier && (
            <div className="slotab-donate-tier-callout">
              Your gift makes you a <strong>{tier}-level</strong> SLOTAB
              member.
              {mode === "monthly" && (
                <span className="slotab-donate-sustainer">
                  {" "}
                  · Monthly Tiger
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Donor info — any donation also creates the SLOTAB membership
          per board decision #37 (every donor = a member). */}
      <fieldset className="slotab-donate-fieldset">
        <legend>Your information</legend>
        <p
          style={{
            margin: 0,
            fontSize: "0.85rem",
            color: "var(--slotab-muted)",
          }}
        >
          Every donation enrolls you as a SLOTAB member. We&apos;ll use
          this to add you to the donor wall and the membership roster.
        </p>
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
            <strong>Display my name on the SLOTAB Donor Wall.</strong>{" "}
            Uncheck to give anonymously — your gift still counts toward
            the team and your member tier.
          </span>
        </label>
      </fieldset>

      {/* Submit (stubbed pending Square architecture decision) */}
      <button
        type="button"
        className="slotab-btn slotab-donate-submit"
        disabled={submitDisabled}
        onClick={() => {
          // Stop here rather than handing off: an undesignated gift is
          // exactly the outcome this change exists to prevent, and Square
          // has no way to ask the question once the donor has left us.
          if (!hasDesignation) {
            setTeamError(true);
            teamSelectRef.current?.focus();
            teamSelectRef.current?.scrollIntoView({
              block: "center",
              behavior: "smooth",
            });
            return;
          }
          setHandedOff(true);
          window.open(squareDonateUrl(team), "_blank", "noopener,noreferrer");
        }}
      >
        {mode === "monthly"
          ? `Start ${MONEY.format(effectiveAmount || floor)}/mo recurring`
          : `Donate ${MONEY.format(effectiveAmount || floor)}`}
      </button>
      {handedOff && (
        <div className="slotab-donate-handoff" role="status">
          <p className="slotab-donate-handoff-lead">
            Checkout opened in a new tab
            {hasOwnSquareItem(team)
              ? ` — your gift will be recorded as “${squareItemLabel(team)}”.`
              : " under “GENERAL ATHLETICS”."}
          </p>
          <p>
            Enter your amount there — pick <strong>$0.00</strong> if you want a
            figure the buttons don&apos;t offer. Nothing has been charged yet.
          </p>
          {unrecordedIntent.length > 0 && (
            <>
              <p>
                A few of your choices can&apos;t travel through that checkout:
              </p>
              <ul className="slotab-donate-handoff-list">
                {unrecordedIntent.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <p>
                <a className="slotab-btn outline" href={intentMailto}>
                  Send us these details →
                </a>
              </p>
              <p className="slotab-donate-note">
                Opens a pre-written email to our membership team so your gift
                gets credited the way you asked. Takes a few seconds and saves
                us chasing you later.
              </p>
            </>
          )}
        </div>
      )}
      <p className="slotab-donate-note">
        SLOTAB is a 501(c)(3) charitable organization. Gifts are tax-
        deductible to the extent allowed by law.
      </p>
    </div>
  );
}
