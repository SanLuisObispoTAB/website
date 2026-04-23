import Image from "next/image";
import Link from "next/link";
import PageHeader from "../components/PageHeader";

const SHIRTS = [
  { name: "Baseball", src: "/merch/SLOHS_Baseball_2-1.png" },
  { name: "Beach Volleyball", src: "/merch/SLOHS_BeachVolleyball_2-1.png" },
  { name: "Golf", src: "/merch/SLOHS_Golf_2.png" },
  { name: "Softball", src: "/merch/SLOHS_Softball_2-1.png" },
  { name: "Stunt", src: "/merch/SLOHS_Stunt_2-1.png" },
  { name: "Swim & Dive", src: "/merch/SLOHS_SwimDive_3-1.png" },
  { name: "Tennis", src: "/merch/SLOHS_Tennis_2-1.png" },
  { name: "Track & Field", src: "/merch/SLOHS_TrackField_2.png" },
  { name: "Volleyball", src: "/merch/SLOHS_Volleyball_2.png" },
];

export default function MerchPage() {
  return (
    <>
      <PageHeader kicker="Wear Your Stripes" title="SLOTAB Merch" />
      <section className="slotab-section">
        <div className="slotab-container slotab-prose">
          <p>
            SLOTAB Merch is available to order online. You can also find us at
            select games and school events — home football games, sports
            physical night, and parent sports meetings.
          </p>

          <div style={{ textAlign: "center", margin: "2rem 0" }}>
            <Link href="#" className="slotab-btn">
              Shop SLOTAB Merch
            </Link>
          </div>

          <h2 style={{ textAlign: "center" }}>Sport-Specific Apparel</h2>
          <p>
            All SLOHS student-athletes receive one sport-specific t-shirt
            generously provided by SLOTAB. There is a limited window for
            parents and athletes to order additional sport-specific apparel at
            the beginning of each season.
          </p>
          <p>
            <strong>Spring sports orders are now closed.</strong> Order pickups
            will be available in the school office.
          </p>
        </div>
      </section>

      <section className="slotab-section alt">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Current Season</span>
            <h2>Team Apparel Designs</h2>
          </div>
          <div className="slotab-merch-grid">
            {SHIRTS.map((s) => (
              <div key={s.name} className="slotab-merch-item">
                <Image
                  src={s.src}
                  alt={`SLOHS ${s.name} shirt design`}
                  width={500}
                  height={500}
                />
                <h4>{s.name}</h4>
              </div>
            ))}
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
