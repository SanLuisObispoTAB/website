import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";

// The merch store.
//
// NOT the storefront the donation flow falls back to. `slotab-3.square.site`
// carries memberships, sponsorships, sport passes and team donations — 37
// products, none of them apparel. Merch lives on its own Square Online site,
// attached to the "SLOTAB Merch" location in the club's *other* Square account
// (see decision #162 for why there are two).
//
// Recovered 2026-08-21 after it was lost in the production rollover. Note the
// host: `slotab-apparel`, NOT `slotab-3` — the two stores are separate Square
// Online sites in separate Square accounts.
const STORE_URL = "https://slotab-apparel.square.site/slotab-merch";

/** A shirt design, and where to buy it.
 *
 *  `url` is the product page for that specific shirt, so the gallery can be a
 *  shopfront rather than a lookbook — clicking Baseball should land on the
 *  Baseball shirt, not on a store homepage the parent then has to search.
 *
 *  **All nine are empty today, and that is correct.** The store was checked
 *  item by item on 2026-08-21: it stocks general Tiger gear — hoodies, hats,
 *  spirit tees, blankets — and carries **none** of these sport-specific
 *  designs. They are ordered through the coach and ParentSquare in a window at
 *  the start of each season, which is what the copy below says. Fill a `url`
 *  in if a design is ever listed; an empty one renders as a plain image rather
 *  than a link that goes somewhere unrelated. */
type Shirt = { name: string; src: string; url?: string };

const SHIRTS: Shirt[] = [
  { name: "Baseball", src: "/merch/SLOHS_Baseball_2-1.png", url: "" },
  { name: "Beach Volleyball", src: "/merch/SLOHS_BeachVolleyball_2-1.png", url: "" },
  { name: "Golf", src: "/merch/SLOHS_Golf_2.png", url: "" },
  { name: "Softball", src: "/merch/SLOHS_Softball_2-1.png", url: "" },
  { name: "Stunt", src: "/merch/SLOHS_Stunt_2-1.png", url: "" },
  { name: "Swim & Dive", src: "/merch/SLOHS_SwimDive_3-1.png", url: "" },
  { name: "Tennis", src: "/merch/SLOHS_Tennis_2-1.png", url: "" },
  { name: "Track & Field", src: "/merch/SLOHS_TrackField_2.png", url: "" },
  { name: "Volleyball", src: "/merch/SLOHS_Volleyball_2.png", url: "" },
];

export default function MerchPage() {
  return (
    <>
      <PageHeader kicker="Wear Your Stripes" title="SLOTAB Merch" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <p>
            Shop Tiger gear online, or find SLOTAB merch at select games and
            school events — home football games, sports physical night, and
            parent sports meetings.
          </p>

          {STORE_URL ? (
            <div style={{ textAlign: "center", margin: "2rem 0" }}>
              <Link href={STORE_URL} className="slotab-btn">
                Shop SLOTAB Merch
              </Link>
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--slotab-muted)" }}>
              The online store link for 2026-27 posts here once it opens.
            </p>
          )}

          <h2 style={{ textAlign: "center" }}>Sport-Specific Apparel</h2>
          <p>
            All SLOHS student-athletes receive one sport-specific t-shirt
            generously provided by SLOTAB. There is a limited window for
            parents and athletes to order additional sport-specific apparel at
            the beginning of each season.
          </p>
          <p>
            <strong>Fall ordering opens at the start of the season.</strong>{" "}
            Watch for the order form through your team&apos;s coach and
            ParentSquare; pickups are available in the school office.
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            {/* Kicker was "Current Season", but every design on file is from
                the spring run. Neutral label until the fall art is printed. */}
            <span className="slotab-kicker">Design Gallery</span>
            <h2>Team Apparel Designs</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              A look at recent sport-specific shirt art. Fall designs are added
              here as each season&apos;s run goes to print.
            </p>
          </div>
          <div className="slotab-merch-grid">
            {SHIRTS.map((s) => {
                const art = (
                  <>
                    <Image
                      src={s.src}
                      alt={`SLOHS ${s.name} shirt design`}
                      width={500}
                      height={500}
                    />
                    <h4>{s.name}</h4>
                  </>
                );
                // A linked tile only when there is somewhere to go. Wrapping a
                // design with no listing in an anchor would look identical and
                // do nothing, which is the worse failure.
                return s.url ? (
                  <a
                    key={s.name}
                    href={s.url}
                    className="slotab-merch-item is-linked"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {art}
                    <span className="slotab-merch-shop">Shop this design →</span>
                  </a>
                ) : (
                  <div key={s.name} className="slotab-merch-item">{art}</div>
                );
              })}
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "2rem",
              color: "var(--slotab-muted)",
              fontSize: "0.9rem",
            }}
          >
            Proceeds from sport-specific shirt and sweatshirt sales help
            offset the cost of providing each SLOHS athlete with their
            sport-specific shirt.
          </p>
        </div>
      </section>
    </>
  );
}
