"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import teamsData from "../data/teams.json";
// Only the fallback URL is still needed. The storefront's item *labels* are no
// longer part of the flow: we mint our own line item now, so a designation is
// carried verbatim instead of collapsing onto a shared storefront tile.
import { squareDonateUrl } from "../data/square-donate";
import BusinessSponsorPanel from "./BusinessSponsorPanel";
// One source of truth with /membership, so the level a donor is promised
// here is the level that page describes.
// One source of truth with /membership, across BOTH halves of the sheet —
// businesses enrol through this same form, so a gift has to be placed
// against the sponsorship tiers as well as the general memberships.
import { levelForGift } from "../data/sponsor-tiers";

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

// Monthly giving is OFF in the UI.
//
// It was never wired to anything that could take a recurring payment — the
// prototype gathered the donor's intent and sent it to the membership address
// by email, which was the honest stopgap while the checkout was the Square
// storefront. It stays off now for a sharper reason: since #145 the button
// really does take money, so leaving a "Monthly recurring" tab on a form whose
// checkout can only charge once would take a monthly pledge and silently bill
// it a single time. Worse than not offering it.
//
// Real recurring needs the Subscriptions API — a Catalog plan with a variation
// per price point, a Customer record, and a card on file via the Web Payments
// SDK (#144). Flip this to `true` when that lands: every monthly branch below
// is intact and gated on it, so nothing has to be rebuilt from memory.
const RECURRING_ENABLED = false;

// How long the handoff panel stays up before the donor is sent to Square.
//
// The panel used to flash and vanish: the redirect fired the instant the link
// came back, so nobody could read it. A pause fixes that, but only for the
// informational case — and the panel is not always informational. When the
// donor has asked for something the checkout cannot carry (anonymity, a
// membership tier), it also carries a pre-written email they need to send, and
// *no* countdown is the right length for that. Five seconds would simply move
// the problem from "couldn't read it" to "was pulled away mid-task".
//
// So: a countdown when there is nothing to do, and an explicit Continue when
// there is. Either way a button is offered, because a donor who has finished
// reading should never be made to wait for a timer.
const HANDOFF_SECONDS = 5;

const ONE_TIME_FLOOR = 25;
const MONTHLY_FLOOR = 10;


const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function DonateForm({
  previewToken,
}: {
  /** Set only by the secret preview page. Proves to the API that this request
   *  may use sandbox credentials on the live site. Absent everywhere else, so
   *  the public /donate keeps falling back to the storefront until the
   *  production token lands. */
  previewToken?: string;
} = {}) {
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
  // Checkout is now minted server-side, so the click is asynchronous and can
  // fail. Both states are surfaced rather than swallowed — a donor staring at
  // a dead button is a lost gift.
  const [starting, setStarting] = useState(false);
  // Which route the donor actually took. The two need different instructions:
  // a minted link has the amount already set, the storefront fallback does not
  // and the donor must key it in. Telling a storefront donor "the amount is
  // already set" would send them through a checkout they'd underpay.
  const [handoffMode, setHandoffMode] = useState<"link" | "storefront">("link");
  // Which half of the box is showing.
  //
  // Sponsorship is the default at Trina's request (2026-08-21), because
  // business sponsorship is the board's current fundraising push and she wants
  // it in front of anyone who lands here. Noting the trade-off rather than
  // burying it: parent gifts are the overwhelming majority of traffic, so this
  // costs the many a click to save the few one. Flip the initial value back to
  // "general" if the click-through data says it is not paying for itself.
  // `?tab=general` / `?tab=sponsorship` deep-links a specific half, which is
  // how /membership sends a reader straight to the form matching the tiers
  // they were just reading. Anything else falls through to the default.
  const tabParam = params.get("tab");
  const [audience, setAudience] = useState<"general" | "business">(
    tabParam === "general"
      ? "general"
      : tabParam === "sponsorship" || tabParam === "business"
        ? "business"
        : "business",
  );
  // Held rather than followed immediately, so the panel above can be read.
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const tiers = mode === "monthly" ? MONTHLY_TIERS : ONE_TIME_TIERS;
  const floor = mode === "monthly" ? MONTHLY_FLOOR : ONE_TIME_FLOOR;

  const effectiveAmount = useMemo(() => {
    const parsed = other ? Number(other) : amount;
    return Number.isFinite(parsed) ? parsed : 0;
  }, [amount, other]);

  const tier = levelForGift(effectiveAmount, mode);
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

  // Whether the donor must actually *do* something before leaving, as opposed
  // to there merely being text on screen. Only this blocks the auto-advance.
  //
  // The distinction matters because the tier line above matches nearly every
  // gift, so treating "the panel has content" as "the donor has a task" would
  // make every single donation a two-click flow. But a tier is **derivable
  // from the amount** — the club can work it out from the transaction and
  // nobody needs to be told. Anonymity cannot be derived from anything: if the
  // donor doesn't tell us, the default is that their name goes on the donor
  // wall, which is the one outcome here that is awkward to undo.
  const needsDonorAction = !displayOnWall;
  // The designation deliberately isn't listed here any more. It used to be —
  // #140 had to warn the donor that all three cheer programmes landed on one
  // "CHEER" storefront item and both wrestling teams on "WRESTLING", so the
  // split had to be applied by hand. The server now names the line item, so the
  // designation reaches Square exactly as chosen and is no longer intent that
  // needs carrying by email.

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

  return (
    <div className="slotab-donate-form">
      {/* Audience tabs. Reuses the mode-toggle styling left behind when
          monthly giving was pulled (#154) — same shape, same position, and one
          set of rules for the control at the top of this box. */}
      <div
        className="slotab-donate-mode"
        role="tablist"
        aria-label="Who is giving"
      >
        <button
          type="button"
          role="tab"
          aria-selected={audience === "general"}
          className={`slotab-donate-mode-btn ${audience === "general" ? "on" : ""}`}
          onClick={() => setAudience("general")}
        >
          General membership
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={audience === "business"}
          className={`slotab-donate-mode-btn ${audience === "business" ? "on" : ""}`}
          onClick={() => setAudience("business")}
        >
          Sponsorship
        </button>
      </div>

      {audience === "business" ? (
        <BusinessSponsorPanel />
      ) : (
        <>
      {/* Mode toggle — hidden until recurring is real; see RECURRING_ENABLED */}
      {RECURRING_ENABLED && (
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
      )}

      {/* Tier ladder */}
      <fieldset className="slotab-donate-fieldset">
        <legend>
          {/* "One-time amount" only earns its qualifier when there is
              something to contrast it with. */}
          {!RECURRING_ENABLED
            ? "Amount"
            : mode === "monthly"
              ? "Monthly amount"
              : "One-time amount"}
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
              : `Donations must be at least ${MONEY.format(floor)}.`}
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
              Your gift qualifies you at the <strong>{tier}</strong> level.{" "}
              <a href="/membership#sponsorship-tiers">See what that includes</a>
              .
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
        disabled={submitDisabled || starting || checkoutUrl !== null}
        aria-busy={starting}
        onClick={async () => {
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
          setCheckoutError(null);
          setStarting(true);
          try {
            const res = await fetch("/api/square/payment-link", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                kind: "donation",
                ...(previewToken ? { previewToken } : {}),
                designation: team,
                // Cents, rounded rather than truncated so 49.995 doesn't
                // quietly become $49.99. The server re-checks the bounds.
                amountCents: Math.round(effectiveAmount * 100),
                email: donorEmail,
                // Carried so Square's form arrives filled in, not blank.
                name: donorName,
                phone: donorPhone,
              }),
            });
            const data = (await res.json()) as { url?: string; error?: string };
            if (res.ok && data.url) {
              setHandoffMode("link");
              setCheckoutUrl(data.url);
              setHandedOff(true);
              // Auto-advance unless the donor has something to send us
              // first — see `needsDonorAction`.
              if (!needsDonorAction) {
                setSecondsLeft(HANDOFF_SECONDS);
              }
              return;
            }
            if (res.status === 503) {
              // Square not configured for this environment — fall back to the
              // #140 storefront handoff rather than blocking the donation.
              // This is the live site's normal path until the production token
              // lands, so it must stay correct, not just present.
              setHandoffMode("storefront");
              setHandedOff(true);
              window.open(
                squareDonateUrl(team),
                "_blank",
                "noopener,noreferrer",
              );
              return;
            }
            setCheckoutError(
              data.error ?? "Could not start checkout — please try again.",
            );
          } catch {
            setCheckoutError(
              "Could not reach checkout. Check your connection and try again.",
            );
          } finally {
            setStarting(false);
          }
        }}
      >
        {starting
          ? "Opening secure checkout…"
          : mode === "monthly"
            ? `Start ${MONEY.format(effectiveAmount || floor)}/mo recurring`
            : `Donate ${MONEY.format(effectiveAmount || floor)}`}
      </button>
      {checkoutError && (
        <p className="slotab-donate-warning" role="alert">
          {checkoutError}
        </p>
      )}
      {handedOff && (
        <div className="slotab-donate-handoff" role="status">
          {handoffMode === "link" ? (
            <>
              <p className="slotab-donate-handoff-lead">
                Taking you to secure checkout for{" "}
                <strong>{MONEY.format(effectiveAmount)}</strong> to {teamLabel}.
              </p>
              <p>
                The amount and designation are already set — you only need your
                card details. Nothing has been charged yet.
              </p>
              {checkoutUrl && (
                <p className="slotab-donate-continue">
                  <a href={checkoutUrl} className="slotab-btn">
                    Continue to secure checkout →
                  </a>
                  {secondsLeft !== null && (
                    <span
                      className="slotab-donate-countdown"
                      aria-live="polite"
                    >
                      Taking you there in {secondsLeft}
                      {secondsLeft === 1 ? " second" : " seconds"}…
                    </span>
                  )}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="slotab-donate-handoff-lead">
                Checkout opened in a new tab for {teamLabel}.
              </p>
              <p>
                <strong>
                  Please enter {MONEY.format(effectiveAmount)} yourself
                </strong>{" "}
                — pick <strong>$0.00</strong> if the buttons don&apos;t offer
                your figure. Nothing has been charged yet.
              </p>
            </>
          )}
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
                {checkoutUrl && secondsLeft === null && (
                  <>
                    {" "}
                    <strong>
                      We&apos;ll wait — use the button above when you&apos;re
                      ready to pay.
                    </strong>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      )}
        </>
      )}
      <p className="slotab-donate-note">
        SLOTAB is a 501(c)(3) charitable organization. Gifts are tax-
        deductible to the extent allowed by law.
      </p>
    </div>
  );
}
