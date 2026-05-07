import Image from "next/image";
import Link from "next/link";

export default function TigerFooter() {
  return (
    <footer className="tiger-footer">
      <div className="tiger-container">
        <div className="tiger-footer-grid">
          <div>
            <div className="tiger-footer-brand-row">
              <Image
                src="/logos/slotab-roundel.png"
                alt=""
                width={56}
                height={56}
              />
              <div>
                <div className="tiger-footer-brand-name">SLOTAB</div>
                <div className="tiger-footer-brand-tag">
                  Est. 1894 · San Luis Obispo
                </div>
              </div>
            </div>
            <p className="tiger-footer-blurb">
              The San Luis Obispo Tiger Athletic Booster Club is a 501(c)(3)
              non-profit supporting every CIF-sanctioned team and cheer
              squad at SLOHS.
            </p>
            <div className="tiger-footer-ein">EIN # 45-4897120</div>
          </div>

          <div>
            <div className="tiger-footer-col-label">Get Involved</div>
            <Link href="/donate" className="tiger-footer-link">
              Donate
            </Link>
            <Link href="/membership" className="tiger-footer-link">
              Become a Member
            </Link>
            <Link href="/membership" className="tiger-footer-link">
              Sponsorship
            </Link>
            <Link href="/volunteer" className="tiger-footer-link">
              Volunteer
            </Link>
            <Link href="/season-passes" className="tiger-footer-link">
              Season Passes
            </Link>
            <Link href="/merch" className="tiger-footer-link">
              Tiger Merch
            </Link>
          </div>

          <div>
            <div className="tiger-footer-col-label">Explore</div>
            <Link href="/teams" className="tiger-footer-link">
              All Teams
            </Link>
            <Link href="/watch" className="tiger-footer-link">
              Watch
            </Link>
            <Link href="/upcoming" className="tiger-footer-link">
              Events
            </Link>
            <Link href="/hall-of-fame" className="tiger-footer-link">
              Hall of Fame
            </Link>
            <Link href="/impact" className="tiger-footer-link">
              Impact
            </Link>
          </div>

          <div>
            <div className="tiger-footer-col-label">Connect</div>
            <Link href="/contact" className="tiger-footer-link">
              Board &amp; Contact
            </Link>
            <Link href="/about" className="tiger-footer-link">
              About
            </Link>
          </div>
        </div>

        <div className="tiger-footer-bottom">
          <div>© 2026 SLOTAB · All Rights Reserved</div>
          <div>Title IX Compliant</div>
        </div>
      </div>
    </footer>
  );
}
