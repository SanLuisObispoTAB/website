import Link from "next/link";
import hofData from "../data/hof.json";
import { hofDonorCount, orderedHofTiers } from "../data/hof-donors";

// The Hall of Fame Fund's thank-you wall, on the Hall of Fame page (#212).
//
// SELF-HIDING, AND THAT IS THE POINT
// It renders nothing until somebody is on it. A "Thank You to Our Donors"
// heading over an empty space on a fundraising page says the campaign has
// raised nothing from anybody, which is both discouraging to read and — with
// $250 in and cheques the website never sees — not even true. So the section
// appears with the first name and not before.
//
// NAMES ONLY, AND ONLY WITH PERMISSION
// Same rule as the membership wall: a name reaches this file only for a donor
// who ticked "Display my name on the SLOTAB Donor Wall" at checkout, and no
// amounts are shown. The rung heading already says roughly what was given,
// which is as specific as a public page should be about somebody's gift.

export default function HofDonorWall() {
  const tiers = orderedHofTiers();
  if (hofDonorCount() === 0) return null;

  const { fund } = hofData as { fund: { ctaLabel: string } };

  return (
    <section className="slotab-section alt" id="fund-donors">
      <div className="slotab-container">
        <div className="slotab-section-title">
          <span className="slotab-kicker">The Hall of Fame Fund</span>
          <h2>Thank You to Our Donors</h2>
          <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
            These Tigers, families and alumni paid for the awards, medallions
            and nameplates that go home with an inductee. The wall grows as
            gifts come in.
          </p>
        </div>

        <div className="slotab-prose slotab-hof-donors">
          {tiers.map((tier) => (
            <div className="slotab-tier" key={tier.tier}>
              <h3>{tier.tier}</h3>
              <ul>
                {tier.donors.map((d, i) => (
                  // Index in the key because two donors can legitimately share
                  // a name on a public wall — the membership wall already
                  // carries the same name twice, and a name-only key silently
                  // drops the second person.
                  <li key={`${d.name}-${i}`}>{d.name}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="slotab-hof-donors-cta">
          <Link href="/hall-of-fame/donate" className="slotab-btn">
            {fund.ctaLabel}
          </Link>
        </p>
      </div>
    </section>
  );
}
