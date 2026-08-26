import Link from "next/link";
import PageHeader from "../components/PageHeader";
import { DONOR_WALL, sortedDonors } from "../data/donors";

// The SLOTAB Donor Wall.
//
// This page is the other half of a promise the donate form has been making
// since it shipped: "Display my name on the SLOTAB Donor Wall." Until #197
// there was no wall — no page, no data file — so every donor who ticked that
// box was consenting to something that did not exist (#197).
//
// NAMES ONLY, AND ON PURPOSE. No amounts, no giving levels, no ordering by
// size. The consent we hold reads exactly "Display my name", and this repo is
// public, so anything rendered here is in git history permanently. Publishing a
// band that implies what somebody gave is more than they agreed to.

export const metadata = {
  title: "Donor Wall — SLOTAB",
  description:
    "The people whose gifts support San Luis Obispo High School student-athletes.",
};

export default function DonorWallPage() {
  const donors = sortedDonors();

  return (
    <>
      <PageHeader kicker={DONOR_WALL.season} title="Donor Wall" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <p style={{ textAlign: "center" }}>
            Thank you to everyone supporting SLOHS student-athletes.
          </p>
          {donors.length === 0 ? (
            // Deliberately not an empty page. A wall with nobody on it reads
            // as broken; this reads as new, and still asks for the gift.
            <p style={{ textAlign: "center" }}>
              Our {DONOR_WALL.season} donor wall is just getting started.{" "}
              <Link href="/donate">Make a gift</Link> and choose to be listed,
              and your name will appear here.
            </p>
          ) : (
            <>
              <ul className="slotab-donor-wall" aria-label="SLOTAB donors">
                {donors.map((d) => (
                  <li key={d.name}>{d.name}</li>
                ))}
              </ul>
              <p className="slotab-donate-note" style={{ textAlign: "center" }}>
                Listed with each donor&apos;s permission. Gave and don&apos;t see
                your name, or would rather not be listed?{" "}
                <a href="mailto:slotabmembership@gmail.com">Let us know</a> and
                we&apos;ll fix it.
              </p>
            </>
          )}
        </div>
      </section>
    </>
  );
}
