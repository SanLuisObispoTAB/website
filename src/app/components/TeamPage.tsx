import Image from "next/image";
import Link from "next/link";
import HudlGrid from "./HudlGrid";
import PageHeader from "./PageHeader";
import { ALL_EVENTS } from "../data/events";

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
  bio?: string;
};

type AssistantCoach = {
  name: string;
  role: string;
  bio?: string;
};

type CommsChannel = {
  /** tool identifier — 'remind' | 'band' | 'google-site' | 'teamsnap' | 'instagram' | 'other' */
  kind: string;
  label: string;
  url: string;
  /** Optional display text under the label, e.g. "Code: @slohsfb26" */
  meta?: string;
};

type OperationalSetup = "standard" | "custom" | "none";

type Liaison = {
  name: string;
  email: string;
};

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
  /**
   * Operational communication channels this coach uses to reach current
   * players and parents (Remind, BAND, Google Site, etc.). Rendered as a
   * distinct "For Players & Parents" strip on the team page so nobody
   * confuses it with the public booster content.
   */
  playerParentChannels?: CommsChannel[];
  operationalSetup?: OperationalSetup;
  roster?: RosterEntry[];
  wishlist?: WishlistEntry[];
  externalLinks?: ExternalLink[];
};

const MONEY = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const DAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
function formatEventDate(iso: string) {
  const d = new Date(iso);
  return {
    day: DAY[d.getDay()],
    num: d.getDate(),
    mon: MONTH[d.getMonth()],
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export default function TeamPage({ team }: { team: Team }) {
  // Pull upcoming events matching this team's eventCategory
  const upcoming = team.eventCategory
    ? ALL_EVENTS.filter((e) => e.category === team.eventCategory).slice(0, 6)
    : [];

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
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* For Players & Parents — operational channels */}
      {((team.playerParentChannels && team.playerParentChannels.length > 0) ||
        team.operationalSetup === "none") && (
        <section className="slotab-team-comms">
          <div className="slotab-container">
            <div className="slotab-team-comms-inner">
              <div className="slotab-team-comms-head">
                <span className="slotab-kicker">
                  For Current Players &amp; Parents
                </span>
                <h2>
                  Coach{team.headCoach ? ` ${team.headCoach.name.split(" ").slice(-1)[0]}` : ""}&apos;s
                  announcements &amp; team updates
                </h2>
                <p>
                  Practice changes, game-day logistics, team chat, and
                  everything else your coach posts during the season live on
                  these channels. Bookmark them.
                </p>
              </div>

              {team.operationalSetup === "none" ? (
                <div className="slotab-team-comms-none">
                  <p>
                    <strong>Not set up yet.</strong> SLOTAB will get this
                    team on the{" "}
                    <a href="/docs/team-comms-kit">
                      standard Remind + BAND kit
                    </a>{" "}
                    before the season starts — contact a board member or the
                    team liaison if you need access in the meantime.
                  </p>
                </div>
              ) : (
                <div className="slotab-team-comms-channels">
                  {team.playerParentChannels!.map((c) => (
                    <a
                      key={c.url + c.kind}
                      href={c.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`slotab-team-comms-card slotab-team-comms-${c.kind}`}
                    >
                      <div className="slotab-team-comms-kind">
                        {c.kind === "remind"
                          ? "Remind"
                          : c.kind === "band"
                            ? "BAND"
                            : c.kind === "parentsquare"
                              ? "ParentSquare"
                              : c.kind === "google-site"
                                ? "Team Website"
                                : c.kind === "teamsnap"
                                  ? "TeamSnap"
                                  : c.kind === "instagram"
                                    ? "Instagram"
                                    : "Link"}
                      </div>
                      <div className="slotab-team-comms-label">{c.label}</div>
                      {c.meta && (
                        <div className="slotab-team-comms-meta">{c.meta}</div>
                      )}
                      <div className="slotab-team-comms-go">Open ↗</div>
                    </a>
                  ))}
                </div>
              )}

              {team.operationalSetup === "standard" && (
                <p className="slotab-team-comms-note">
                  This team uses the SLOTAB Standard Comms Kit (Remind +
                  BAND). Coaches who prefer their own tool can opt out —
                  see the{" "}
                  <a href="/docs/team-comms-kit">
                    team comms playbook
                  </a>
                  .
                </p>
              )}
              {team.operationalSetup === "custom" && (
                <p className="slotab-team-comms-note">
                  This coach runs their own communication platform. SLOTAB
                  hosts the public booster page above; the link(s) above go
                  to the coach&apos;s own site.
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming games */}
      {upcoming.length > 0 && (
        <section className="slotab-section alt">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">This Week &amp; Next</span>
              <h2>Upcoming {team.sport}</h2>
            </div>
            <ul
              className="slotab-event-list"
              style={{ maxWidth: 820, margin: "0 auto" }}
            >
              {upcoming.map((e) => {
                const d = formatEventDate(e.date);
                return (
                  <li key={e.id} className="slotab-event-row sport">
                    <div className="slotab-event-date">
                      <span className="day">{d.day}</span>
                      <span className="num">{d.num}</span>
                      <span className="mon">{d.mon}</span>
                    </div>
                    <div className="slotab-event-body">
                      <div className="slotab-event-title">
                        {e.isSport && e.isHome !== undefined && (
                          <span
                            className={`slotab-event-tag ${e.isHome ? "home" : "away"}`}
                          >
                            {e.isHome ? "HOME" : "AWAY"}
                          </span>
                        )}
                        {e.title}
                      </div>
                      <div className="slotab-event-meta">
                        {d.time}
                        {e.detail && <> · {e.detail}</>}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
              <Link
                href={`/upcoming`}
                className="slotab-btn"
              >
                Full Schedule
              </Link>
            </div>
          </div>
        </section>
      )}

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
