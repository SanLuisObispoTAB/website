import Image from "next/image";
import Link from "next/link";
import HudlGrid from "./HudlGrid";

type RosterEntry = {
  number: number;
  name: string;
  year: string;
  position: string;
};

type WishlistEntry = {
  item: string;
  cost: number;
};

type ExternalLink = {
  label: string;
  url: string;
};

type Coach = {
  name: string;
  email?: string;
  /** Optional phone — free-form string (e.g. "(805) 549-1202").
   *  Wired into a `tel:` link by `telHref()`. */
  phone?: string;
  bio?: string;
};

type AssistantCoach = {
  name: string;
  role: string;
  email?: string;
  phone?: string;
  bio?: string;
};

type Liaison = {
  name: string;
  email: string;
  phone?: string;
};

/** Convert a free-form phone string to a `tel:` URL.
 *  Strips non-digits; prefixes `+1` if the result is exactly 10 digits
 *  (US numbers); otherwise passes the digits through. Falls back to the
 *  raw input if it has no digits at all. */
function telHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return `tel:${phone}`;
  if (digits.length === 10) return `tel:+1${digits}`;
  return `tel:+${digits}`;
}

export type Team = {
  slug: string;
  name: string;
  sport: string;
  gender: string;
  season: string;
  tagline?: string;
  heroPhoto?: string;
  hudlVideoSport?: string;
  tnnVideoSport?: string;
  eventCategory?: string;
  headCoach?: Coach;
  assistantCoaches?: AssistantCoach[];
  liaisons?: Liaison[];
  captains?: string[];
  roster?: RosterEntry[];
  wishlist?: WishlistEntry[];
  externalLinks?: ExternalLink[];
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export default function TeamPage({ team }: { team: Team }) {
  const rosterByYear = (team.roster ?? []).slice().sort((a, b) => a.number - b.number);

  return (
    <>
      {/* Team hero */}
      <section className="slotab-team-hero">
        {team.heroPhoto && (
          <Image
            src={team.heroPhoto}
            alt={team.name}
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover" }}
          />
        )}
        <div className="slotab-team-hero-overlay" />
        <div className="slotab-team-hero-content">
          <div className="slotab-kicker">
            SLOHS · {team.gender} · {team.season}
          </div>
          <h1>{team.name}</h1>
          {team.tagline && (
            <p className="slotab-team-tagline">{team.tagline}</p>
          )}
        </div>
      </section>

      {/* Quick facts row */}
      <section className="slotab-section slotab-team-quickfacts">
        <div className="slotab-container slotab-team-quickfacts-grid">
          {team.headCoach && (
            <div className="slotab-team-fact">
              <div className="slotab-team-fact-label">Head Coach</div>
              <div className="slotab-team-fact-value">{team.headCoach.name}</div>
              {team.headCoach.email && (
                <a href={`mailto:${team.headCoach.email}`}>
                  {team.headCoach.email}
                </a>
              )}
              {team.headCoach.phone && (
                <div>
                  <a href={telHref(team.headCoach.phone)}>
                    {team.headCoach.phone}
                  </a>
                </div>
              )}
            </div>
          )}
          {team.captains && team.captains.length > 0 && (
            <div className="slotab-team-fact">
              <div className="slotab-team-fact-label">Team Captains</div>
              <div className="slotab-team-fact-value">
                {team.captains.join(" · ")}
              </div>
            </div>
          )}
          {team.liaisons && team.liaisons.length > 0 && (
            <div className="slotab-team-fact">
              <div className="slotab-team-fact-label">SLOTAB Team Liaisons</div>
              {team.liaisons.map((l) => (
                <div key={l.name}>
                  {l.name} ·{" "}
                  <a href={`mailto:${l.email}`}>{l.email}</a>
                  {l.phone && (
                    <>
                      {" · "}
                      <a href={telHref(l.phone)}>{l.phone}</a>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Support this team — Donate CTAs */}
      <section className="slotab-section alt slotab-team-support">
        <div className="slotab-container">
          <div className="slotab-section-title">
            <span className="slotab-kicker">Support the Team</span>
            <h2>Donate to {team.sport}</h2>
            <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
              <strong>75%</strong> of your gift goes directly to the{" "}
              {team.sport.toLowerCase()} program.{" "}
              <strong>25%</strong> goes to the SLOTAB general fund that
              pays for things every Tigers team uses — Hudl streaming,
              senior banners, T-shirts, and more.
            </p>
          </div>
          <div
            className="slotab-btn-row"
            style={{ justifyContent: "center", flexWrap: "wrap", gap: "0.75rem" }}
          >
            <Link
              href={`/donate?team=${team.slug}`}
              className="slotab-btn"
            >
              Donate to {team.sport}
            </Link>
            <Link href="/donate" className="slotab-btn outline">
              Donate to SLOTAB General Fund
            </Link>
          </div>
        </div>
      </section>

      {/* Roster */}
      {rosterByYear.length > 0 && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">
                {rosterByYear.length} Tigers on the roster
              </span>
              <h2>Roster</h2>
            </div>
            <div className="slotab-team-roster">
              {rosterByYear.map((p) => (
                <div
                  key={p.number + p.name}
                  className="slotab-team-roster-row"
                >
                  <span className="slotab-team-roster-num">#{p.number}</span>
                  <span className="slotab-team-roster-name">{p.name}</span>
                  <span className="slotab-team-roster-position">
                    {p.position}
                  </span>
                  <span className="slotab-team-roster-year">{p.year}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Coach bio (if present) */}
      {team.headCoach?.bio && (
        <section className="slotab-section alt">
          <div className="slotab-container slotab-prose">
            <div className="slotab-section-title">
              <span className="slotab-kicker">Meet the Coach</span>
              <h2>{team.headCoach.name}</h2>
            </div>
            <p>{team.headCoach.bio}</p>
          </div>
        </section>
      )}

      {/* Coaching staff (if present) — for teams like T&F with many coaches */}
      {team.assistantCoaches && team.assistantCoaches.length > 0 && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">The Staff</span>
              <h2>Coaching Staff</h2>
            </div>
            <div className="slotab-coach-staff">
              {team.assistantCoaches.map((c) => (
                <div key={c.name} className="slotab-coach-card">
                  <div className="slotab-coach-name">{c.name}</div>
                  <div className="slotab-coach-role">{c.role}</div>
                  {(c.email || c.phone) && (
                    <div className="slotab-coach-contact">
                      {c.email && (
                        <a href={`mailto:${c.email}`}>{c.email}</a>
                      )}
                      {c.email && c.phone && " · "}
                      {c.phone && (
                        <a href={telHref(c.phone)}>{c.phone}</a>
                      )}
                    </div>
                  )}
                  {c.bio && <p className="slotab-coach-bio">{c.bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Hudl videos for this sport */}
      {team.hudlVideoSport && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">Watch the Team</span>
              <h2>{team.sport} on Hudl</h2>
            </div>
            <HudlGrid limit={3} showFilters={false} />
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link href="/watch" className="slotab-btn">
                Full Watch Tab
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Team wishlist */}
      {team.wishlist && team.wishlist.length > 0 && (
        <section className="slotab-section alt">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">Direct Support</span>
              <h2>Team Wishlist</h2>
              <p style={{ maxWidth: 640, margin: "1rem auto 0" }}>
                These are the specific items SLOTAB is raising funds for to
                support the {team.sport.toLowerCase()} program this season.
                Contact the team liaison to sponsor a line item directly.
              </p>
            </div>
            <ul className="slotab-team-wishlist">
              {team.wishlist.map((w) => (
                <li key={w.item}>
                  <span className="slotab-team-wishlist-item">{w.item}</span>
                  <span className="slotab-team-wishlist-cost">
                    {MONEY.format(w.cost)}
                  </span>
                </li>
              ))}
            </ul>
            <div
              className="slotab-btn-row"
              style={{ justifyContent: "center", marginTop: "1.5rem" }}
            >
              <Link href="/membership" className="slotab-btn">
                Sponsor This Team
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* External links */}
      {team.externalLinks && team.externalLinks.length > 0 && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">Off-Site Resources</span>
              <h2>More {team.sport}</h2>
            </div>
            <div
              className="slotab-grid"
              style={{ maxWidth: 820, margin: "0 auto" }}
            >
              {team.externalLinks.map((l) => (
                <Link
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="slotab-card"
                  style={{ textDecoration: "none" }}
                >
                  <h3>{l.label} ↗</h3>
                  <p style={{ margin: 0, color: "var(--slotab-muted)" }}>
                    Opens in a new tab.
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
