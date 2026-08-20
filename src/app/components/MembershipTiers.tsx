"use client";

import { useState } from "react";
import Link from "next/link";
import {
  SPONSOR_TIERS,
  GENERAL_MEMBERSHIPS,
  sportsCreditPerk,
  type SponsorTier,
  type MembershipTier,
} from "../data/sponsor-tiers";
import SportPicker from "./SportPicker";

// Tier prices live in `data/sponsor-tiers.ts` because they are charged as well
// as displayed — this component renders them and the payment-link route bills
// them, and the two must not drift.

// The three ad-perk tiers render as a 3-up top row; Tiger Pride and Varsity
// share a centered second row beneath them.
const AD_PERK_TIERS = SPONSOR_TIERS.filter((t) => t.adPerks);
const PAIR_TIERS = SPONSOR_TIERS.filter((t) => !t.adPerks);

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function SponsorCheckoutButton({ tier }: { tier: SponsorTier }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const atLimit = picked.length >= tier.sportsCredit;

  async function checkout() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/square/payment-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Only the tier id and the chosen slugs cross the wire. The price and
        // the limit on how many sports this tier may credit are both looked up
        // server-side — a posted amount would be a posted price, and a posted
        // limit would be a posted perk.
        body: JSON.stringify({
          kind: "sponsorship",
          tierId: tier.id,
          sports: picked,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (res.ok && data.url) {
        window.location.href = data.url;
        return;
      }
      setError(
        res.status === 503
          ? "Online payment isn't available yet — please email us and we'll invoice you."
          : (data.error ?? "Could not start checkout — please try again."),
      );
    } catch {
      setError("Could not reach checkout. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        className="slotab-btn slotab-tier-cta"
        onClick={() => setOpen(true)}
      >
        {`Sponsor at ${MONEY.format(tier.annual)}`}
      </button>
    );
  }

  return (
    <div className="slotab-sport-picker">
      <p className="slotab-sport-picker-lead">
        {tier.sportsCredit === 1
          ? "Which sport should your sponsorship be credited to?"
          : `Which sports should your sponsorship be credited to? Choose up to ${tier.sportsCredit}.`}
      </p>

      <SportPicker
        limit={tier.sportsCredit}
        picked={picked}
        onChange={setPicked}
        idPrefix={`tier-${tier.id}`}
      />

      <div className="slotab-sport-picker-actions">
        <button
          type="button"
          className="slotab-btn"
          disabled={busy}
          aria-busy={busy}
          onClick={checkout}
        >
          {busy ? "Opening checkout…" : `Continue — ${MONEY.format(tier.annual)}`}
        </button>
        <button
          type="button"
          className="slotab-btn outline"
          onClick={() => {
            setOpen(false);
            setPicked([]);
            setError(null);
          }}
        >
          Cancel
        </button>
      </div>

      {error && (
        <p className="slotab-tier-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function TierCard({
  t,
  sponsor,
}: {
  t: SponsorTier | MembershipTier;
  sponsor?: SponsorTier;
}) {
  const anyAmount = "anyAmount" in t ? t.anyAmount : false;
  const adPerks = "adPerks" in t ? t.adPerks : false;
  return (
    <div className="slotab-tier-card">
      {adPerks && <span className="slotab-tier-badge">Includes Ad Perks</span>}
      <h3>{t.name}</h3>
      <div className="slotab-tier-amount">
        {anyAmount ? (
          <span>
            Any amount
            <span className="slotab-tier-per slotab-tier-per-note">
              no minimum
            </span>
          </span>
        ) : (
          <span>
            {MONEY.format(t.annual ?? 0)}
            <span className="slotab-tier-per"> / year</span>
          </span>
        )}
        {t.monthly != null && (
          <span className="slotab-tier-annualized">
            or {MONEY.format(t.monthly)}/mo recurring
          </span>
        )}
      </div>
      <ul>
        {t.perks.map((p) => (
          <li key={p}>{p}</li>
        ))}
        {/* Driven by the tier itself, not by `sponsor` — that prop is gated on
            whether checkout is switched on, and how many sports a sponsorship
            credits is true either way. Reading it from `sponsor` would make the
            perk disappear whenever SQUARE_LIVE_DONATE is off, which is exactly
            the state the live site is in today. */}
        {"sportsCredit" in t && <li>{sportsCreditPerk(t.sportsCredit)}</li>}
      </ul>
      {/* Sponsor tiers are billable here and now. General memberships aren't:
          any donation enrols you at the matching level (#37), so they route
          through /donate rather than carrying a price-specific button. */}
      {sponsor && <SponsorCheckoutButton tier={sponsor} />}
    </div>
  );
}

export default function MembershipTiers({
  checkoutEnabled = false,
}: {
  checkoutEnabled?: boolean;
} = {}) {
  return (
    <div className="slotab-membership-sheet">
      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">
          Sponsorship Tiers
          <span>Available to businesses &amp; individuals</span>
        </h3>
        <div className="slotab-tier-grid slotab-tier-grid-three">
          {AD_PERK_TIERS.map((t) => (
            <TierCard key={t.id} t={t} sponsor={checkoutEnabled ? t : undefined} />
          ))}
        </div>
        <div className="slotab-tier-grid slotab-tier-grid-pair">
          {PAIR_TIERS.map((t) => (
            <TierCard key={t.id} t={t} sponsor={checkoutEnabled ? t : undefined} />
          ))}
        </div>
      </div>

      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">General Memberships</h3>
        <div className="slotab-tier-grid slotab-tier-grid-general">
          {GENERAL_MEMBERSHIPS.map((t) => (
            <TierCard key={t.name} t={t} />
          ))}
        </div>
      </div>

      <div className="slotab-tier-foot">
        <h3 className="slotab-tier-join-head">How to Join</h3>
        <p>
          {checkoutEnabled
            ? "Sponsors can pay online using the button on any tier above. "
            : ""}
          Complete your membership online, or mail a check payable to{" "}
          <strong className="slotab-mail-address">
            SLOTAB, PO Box 16025, San&nbsp;Luis&nbsp;Obispo,&nbsp;CA&nbsp;93406
          </strong>
          .
        </p>
        <p
          style={{
            display: "flex",
            gap: "0.75rem",
            justifyContent: "center",
            flexWrap: "wrap",
            marginTop: "1.25rem",
          }}
        >
          <Link
            href="/donate"
            className="tiger-btn tiger-btn-primary tiger-btn-arrow"
          >
            Join or Donate Online
          </Link>
        </p>
        <p className="slotab-tier-join-cta no-print">
          Questions?{" "}
          <a href="mailto:slotabmembership@gmail.com">
            Email the Membership VP
          </a>{" "}
          or{" "}
          <button
            type="button"
            className="slotab-tier-print"
            onClick={() => window.print()}
          >
            print this sheet
          </button>
          .
        </p>
      </div>
    </div>
  );
}
