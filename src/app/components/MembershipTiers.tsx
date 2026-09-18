"use client";

import Link from "next/link";
import {
  SPONSOR_TIERS,
  GENERAL_MEMBERSHIPS,
  sportsCreditPerk,
  tierPerks,
  type SponsorTier,
  type MembershipTier,
} from "../data/sponsor-tiers";
import { SPONSOR_FORM_URL } from "@/lib/sponsor-form-pdf";

// Tier prices live in `data/sponsor-tiers.ts` because they are charged as well
// as displayed — this component renders them and the payment-link route bills
// them, and the two must not drift.

// The top three render as a 3-up row; the remaining two share a centered row
// beneath. Grouped by POSITION, not by `adPerks` — the final sheet took
// scoreboard ads away from Silver, and the page layout should not reflow every
// time the board moves a perk between tiers.
const TOP_TIERS = SPONSOR_TIERS.slice(0, 3);
const PAIR_TIERS = SPONSOR_TIERS.slice(3);

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function TierCard({ t }: { t: SponsorTier | MembershipTier }) {
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
        {/* `tierPerks`, not `t.perks` — the included-passes bullet is generated
            from `passesIncluded` since #208, the same way the sports-credit
            bullet below is generated from `sportsCredit`. */}
        {tierPerks(t).map((p) => (
          <li key={p}>{p}</li>
        ))}
        {/* Driven by the tier itself, not by `sponsor` — that prop is gated on
            whether checkout is switched on, and how many sports a sponsorship
            credits is true either way. Reading it from `sponsor` would make the
            perk disappear whenever SQUARE_LIVE_DONATE is off, which is exactly
            the state the live site is in today. */}
        {/* Every level carries `sportsCredit` since #215, so this renders on
            BOTH halves of the sheet. A general membership shows the zero case
            in words — the sheet has to state the rule, or /donate is the first
            place anyone learns it, which is one screen too late. */}
        {sportsCreditPerk(t.sportsCredit) ? (
          <li>{sportsCreditPerk(t.sportsCredit)}</li>
        ) : (
          <li className="slotab-tier-nosport">
            Supports all teams — no single sport designated
          </li>
        )}
      </ul>
          </div>
  );
}

export default function MembershipTiers() {
  return (
    <div className="slotab-membership-sheet">
      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">
          Sponsorship Tiers
          <span>Available to businesses &amp; individuals</span>
        </h3>
        <div className="slotab-tier-grid slotab-tier-grid-three">
          {TOP_TIERS.map((t) => (
            <TierCard key={t.id} t={t} />
          ))}
        </div>
        <div className="slotab-tier-grid slotab-tier-grid-pair">
          {PAIR_TIERS.map((t) => (
            <TierCard key={t.id} t={t} />
          ))}
        </div>
        {/* This page is the catalogue; /donate is where you act. The tab is
            named in the URL so a sponsor lands on the sponsorship form rather
            than on whichever tab happens to be the default that week. */}
        <p className="slotab-tier-group-cta">
          <Link href="/donate?tab=sponsorship" className="slotab-btn">
            Sponsor the Tigers →
          </Link>
          {/* For sponsors who fill out a form and mail a check. */}
          <a
            href={SPONSOR_FORM_URL}
            target="_blank"
            rel="noopener"
            className="slotab-btn dark"
          >
            Printable form (PDF)
          </a>
        </p>
      </div>

      <div className="slotab-tier-group">
        <h3 className="slotab-tier-group-head">General Memberships</h3>
        <div className="slotab-tier-grid slotab-tier-grid-general">
          {GENERAL_MEMBERSHIPS.map((t) => (
            <TierCard key={t.name} t={t} />
          ))}
        </div>
        <p className="slotab-tier-group-cta">
          <Link href="/donate?tab=general" className="slotab-btn">
            Join or donate →
          </Link>
        </p>
      </div>

      <div className="slotab-tier-foot">
        <h3 className="slotab-tier-join-head">How to Join</h3>
        <p>
          Use a button above to join or sponsor online, or mail a check payable
          to{" "}
          <strong className="slotab-mail-address">
            SLOTAB, PO Box 16025, San&nbsp;Luis&nbsp;Obispo,&nbsp;CA&nbsp;93406
          </strong>
          . Sponsoring an amount between levels? You receive the benefits of
          the highest level at or below it. Sponsors mailing a check, please
          include the{" "}
          <a href={SPONSOR_FORM_URL} target="_blank" rel="noopener">
            printable sponsorship form
          </a>
          .
        </p>
        <p className="slotab-tier-join-cta no-print">
          Questions?{" "}
          <a href="mailto:slotabmembership@gmail.com">
            Email the Membership VP
          </a>{" "}
          or{" "}
          {/* Opens the Membership team's official form (#234). This used to
              call window.print(), which printed the website's own rendering
              of the tiers — a second, older-looking "sheet" competing with
              the one the club actually hands out. */}
          <a
            href={SPONSOR_FORM_URL}
            target="_blank"
            rel="noopener"
            className="slotab-tier-print"
          >
            print the sponsorship form
          </a>
          .
        </p>
      </div>
    </div>
  );
}
