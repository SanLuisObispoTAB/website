import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="slotab-footer">
      <div className="slotab-footer-inner">
        <div>
          <h4>SLOTAB</h4>
          <p style={{ fontSize: "0.9rem", color: "#bdbdbd" }}>
            The San Luis Obispo Tiger Athletic Booster Club is a 501(c)(3)
            non-profit supporting every CIF-sanctioned team and cheer squad at
            San Luis Obispo High School.
          </p>
          <p style={{ fontSize: "0.8rem", color: "#888" }}>EIN# 45-4897120</p>
        </div>
        <div>
          <h4>Get Involved</h4>
          <ul>
            <li><Link href="/membership">Become a Member</Link></li>
            <li><Link href="/membership">Business Sponsorship</Link></li>
            <li><Link href="/volunteer">Volunteer</Link></li>
            <li><Link href="/season-passes">Season Passes</Link></li>
            <li><Link href="/merch">Tiger Merch</Link></li>
          </ul>
        </div>
        <div>
          <h4>Connect</h4>
          <ul>
            <li><Link href="/contact">Board &amp; Contact</Link></li>
            <li><Link href="/upcoming">Upcoming Events</Link></li>
            <li><Link href="/spring-social">Spring Social</Link></li>
          </ul>
        </div>
      </div>
      <div className="slotab-footer-copy">
        SLOTAB ● © {year} ● EIN# 45-4897120
      </div>
    </footer>
  );
}
