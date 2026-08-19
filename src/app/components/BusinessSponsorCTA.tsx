import Link from "next/link";
import SponsorEnquiry from "./SponsorEnquiry";

// The Sponsorship lead sends businesses to the website to enrol, and until now
// they landed on a page that opens with parent-facing membership copy, shows a
// wall thanking *other* businesses, and offers one button — "Donate & Become a
// Member" — into a donation form with a sport picker and a $50 default. There
// was no business path at all, so this panel is the first thing they meet.
//
// WHY IT DOESN'T TOUCH THE OLD STOREFRONT
// The Square storefront carries a Business Sponsorships category, but it is
// still selling the pre-#88 ladder: "Platinum" at $5,000 with the perk list
// this site sells as Champion at $10,000, and "Gold" at $2,500 with four
// passes and a one-year banner where this site's Gold promises eight passes
// and two years. Linking there would sell a package at half price. Since #144
// we mint our own checkout instead, pricing each tier from the same array the
// page renders — so the stale storefront items are simply out of the path, and
// re-tiering them is no longer a blocker on taking sponsor money correctly.
const SPONSOR_EMAIL = "slotabmembership@gmail.com";

const ENQUIRY_BODY = [
  "We'd like to sponsor SLOHS Tiger Athletics. Our details:",
  "",
  "Business name:",
  "Contact name:",
  "Phone:",
  "Email:",
  "Sponsorship tier (Champion / Gold / Silver / Tiger Pride / Varsity):",
  "",
  "For tiers that include a banner — preferred sporting location(s):",
  "For Champion — the sport you'd like to be featured game sponsor for:",
  "",
  "We can supply a logo file (vector or high-resolution PNG preferred):  yes / no",
  "",
  "Anything else we should know:",
].join("\n");

const ENQUIRY_SUBJECT = "Business sponsorship enquiry";

export default function BusinessSponsorCTA({
  checkoutEnabled = false,
}: {
  /** False until Square is live, so step three doesn't promise a
   *  pay-online button that isn't rendered. */
  checkoutEnabled?: boolean;
} = {}) {
  return (
    <section className="slotab-biz-sponsor" aria-labelledby="biz-sponsor-head">
      <div className="slotab-container slotab-biz-sponsor-inner">
        <span className="slotab-kicker">For Businesses</span>
        <h2 id="biz-sponsor-head">Sponsor the Tigers</h2>
        <p className="slotab-biz-sponsor-lead">
          Put your business in front of every Tiger family this season —
          scoreboard ads, banners at the venues you choose, game-day
          recognition and All-Sport passes for your team. Five tiers, from{" "}
          <strong>$500</strong> to <strong>$10,000</strong> a year.
        </p>

        <ol className="slotab-biz-steps">
          <li>
            <span className="slotab-biz-step-n">1</span>
            <span>
              <strong>Pick your tier.</strong> The full sheet — price, perks
              and pass counts — is{" "}
              <Link href="#sponsorship-tiers">just below</Link>.
            </span>
          </li>
          <li>
            <span className="slotab-biz-step-n">2</span>
            <span>
              <strong>Send us your business details.</strong> A checkout
              can take payment but it can&apos;t take a logo file — so we ask
              for that, and your banner location, by email.
            </span>
          </li>
          <li>
            <span className="slotab-biz-step-n">3</span>
            <span>
              {checkoutEnabled ? (
                <>
                  <strong>Pay online, or by check.</strong> Every tier has a
                  secure-checkout button — the price is set for you, nothing
                  to enter. Prefer a check? The address is on the sheet below.
                </>
              ) : (
                <>
                  <strong>We confirm and invoice you.</strong> A board member
                  confirms your package and arranges payment — by invoice, or
                  by check to the address on the sheet below.
                </>
              )}
            </span>
          </li>
        </ol>

        <div className="slotab-biz-actions">
          <SponsorEnquiry
            email={SPONSOR_EMAIL}
            subject={ENQUIRY_SUBJECT}
            body={ENQUIRY_BODY}
          />
          <Link href="#sponsorship-tiers" className="slotab-btn outline">
            {checkoutEnabled ? "See the tiers & pay online" : "See the tiers & perks"}
          </Link>
        </div>

        <p className="slotab-biz-note">
          Prefer to talk it through first? Email{" "}
          <a href={`mailto:${SPONSOR_EMAIL}`}>{SPONSOR_EMAIL}</a> and the
          Business Sponsorships lead will get back to you. Renewing from last
          season? Say so and we&apos;ll carry your details across.
        </p>
      </div>
    </section>
  );
}
