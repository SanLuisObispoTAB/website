import Image from "next/image";
import Link from "next/link";

type RosterEntry = {
  /** Jersey number. Optional, because plenty of rosters don't have one:
   *  cheer doesn't issue numbers at all, and flag football's practice
   *  players hadn't been given a uniform when the coach sent the list. */
  number?: number;
  name: string;
  /** Grade level. A bare number renders as "Gr. 12" so a lone "12" in the
   *  corner of a card isn't ambiguous; anything else renders verbatim, for
   *  a team that sends "Senior" or "Sr." instead. */
  year: string;
  /** Optional — a JV list often arrives before positions are settled. */
  position?: string;
  /** Squad name, for a program fielding more than one (Varsity / JV Black /
   *  JV Gold). Rows group under it, in first-appearance order. Absent on
   *  every entry means one flat list, which is how a single-squad team
   *  renders. */
  squad?: string;
};

type WishlistEntry = {
  item: string;
  /** A number is formatted as currency. A string renders verbatim, which is
   *  what coaches actually give us — ranges ("$3,000–4,000") and per-unit
   *  prices ("$50–100 each") rather than one figure. Flattening those to a
   *  single number would invent precision the team didn't quote.
   *  Omit when the need is named but unpriced — renders "Pricing TBD". */
  cost?: number | string;
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
  /** Overrides the "Head Coach" label — for a team with more than one head
   *  coach, e.g. "Head Coach — Boys". */
  role?: string;
};

/** Posed squad portrait. `label` names the squad for teams that field
 *  more than one (e.g. cross country's boys and girls). */
type TeamPhoto = {
  photo: string;
  label?: string;
  /** A sentence under the label, for when the picture needs explaining —
   *  a squad that has since split, a photo from a prior season, a group
   *  that isn't what its label implies. The label itself is set in small
   *  uppercase with wide tracking, which a sentence reads badly in, so
   *  this renders separately in normal case. */
  note?: string;
};

/** A gallery entry. A bare path is the common case and every existing team
 *  uses it. The object form adds a caption, for a photo whose *point* isn't
 *  visible in the photo — Dance's Future Tigers shot is a wide, soft crowd
 *  picture that reads as nothing until you're told it's the outreach
 *  workshop, which is the only reason the coach asked for it at all. */
type GalleryEntry = string | { photo: string; caption?: string };

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
  /** Absent for a team with no gender designation — the hero kicker drops
   *  the segment rather than rendering "SLOHS · · Fall". */
  gender?: string;
  season: string;
  tagline?: string;
  heroPhoto?: string;
  /** Optional CSS object-position for the hero crop (e.g. "center top",
   *  "center 20%"). The hero band is short (min-height 360px) and uses
   *  object-fit: cover, so without anchoring, tall photos get center-
   *  cropped — which often lands at chest height for team shots. Set
   *  this when faces sit above the natural center of the source image. */
  heroPhotoPosition?: string;
  /** Formal team portrait — shown on a dedicated "Team Photo" section
   *  on the team page. Distinct from heroPhoto (which is the immersive
   *  action shot at the top). */
  teamPhoto?: string;
  /** Several posed portraits, for a team fielding more than one squad.
   *  Takes precedence over `teamPhoto` when both are set. */
  teamPhotos?: TeamPhoto[];
  /** Action-shot gallery — a responsive grid of in-game photos shown below
   *  the portrait. Natural aspect ratios are preserved (no crop), so mix
   *  landscape + portrait freely. Distinct from heroPhoto (the single top
   *  action shot) and teamPhoto (the posed portrait). */
  gallery?: GalleryEntry[];
  eventCategory?: string;
  headCoach?: Coach;
  /** Several head coaches, for a combined team (cross country runs boys and
   *  girls as one program under two head coaches). Takes precedence over
   *  `headCoach` when both are set; give each a `role` naming its squad. */
  headCoaches?: Coach[];
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

/** Wishlist costs arrive three ways: a number from the JSON, a bare numeric
 *  string from the CMS (its cost field is a text input so ranges are typeable),
 *  or free text like "$3,000–4,000" / "$50–100 each". Numbers and numeric
 *  strings get currency formatting; anything else is shown exactly as typed.
 *  Returns null when there's nothing to show, so the caller renders "Pricing
 *  TBD". */
function formatCost(cost: number | string | undefined): string | null {
  if (typeof cost === "number") return MONEY.format(cost);
  if (typeof cost !== "string") return null;
  const trimmed = cost.trim();
  if (!trimmed) return null;
  return /^\d+(\.\d+)?$/.test(trimmed) ? MONEY.format(Number(trimmed)) : trimmed;
}

/** Grade level for the roster card's corner. Coaches send the grade as a
 *  bare number, and "12" alone in a corner reads as a jersey number or a
 *  count — so a numeric grade is labelled. Anything else ("Senior", "Sr.")
 *  is already self-describing and passes through untouched. Mirrors the
 *  number-or-free-text handling in `formatCost` above. */
function formatYear(year: string): string {
  const trimmed = year.trim();
  return /^\d{1,2}$/.test(trimmed) ? `Gr. ${trimmed}` : trimmed;
}

export default function TeamPage({ team }: { team: Team }) {
  // A team may declare one head coach or several (cross country runs boys and
  // girls under two). Normalise to a list so the markup has one shape.
  const headCoaches: Coach[] =
    team.headCoaches ?? (team.headCoach ? [team.headCoach] : []);
  // Same for gallery entries, which may be a bare path or a captioned object.
  const gallery = (team.gallery ?? []).map((g) =>
    typeof g === "string" ? { photo: g, caption: undefined } : g,
  );
  // Same for squad portraits.
  const teamPhotos: TeamPhoto[] =
    team.teamPhotos ?? (team.teamPhoto ? [{ photo: team.teamPhoto }] : []);

  // Roster rows, grouped into squads. A program may field one list (no
  // `squad` anywhere) or several; both render through the same path, the
  // single-squad case simply producing one unnamed group.
  //
  // Within a group, numbered athletes sort by number and unnumbered ones
  // fall to the end in name order — so a flag football JV list with three
  // practice players still reads as a jersey-ordered roster with the
  // not-yet-issued names after it, rather than putting them first.
  const roster = team.roster ?? [];
  const rosterSquads: Array<{ label?: string; players: RosterEntry[] }> = [];
  for (const p of roster) {
    let group = rosterSquads.find((g) => g.label === p.squad);
    if (!group) {
      group = { label: p.squad, players: [] };
      rosterSquads.push(group);
    }
    group.players.push(p);
  }
  for (const g of rosterSquads) {
    g.players.sort((a, b) => {
      if (a.number != null && b.number != null) return a.number - b.number;
      if (a.number != null) return -1;
      if (b.number != null) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  // The quick-facts band holds coach / captains / liaisons. Teams awaiting
  // their 2026-27 handoff info have none of the three, so skip the band
  // entirely rather than render an empty strip.
  const hasQuickFacts =
    headCoaches.length > 0 ||
    (team.captains?.length ?? 0) > 0 ||
    (team.liaisons?.length ?? 0) > 0;

  return (
    <>
      {/* Team hero. Without a photo the band would be transparent over the
          cream page background, leaving the white hero text unreadable — so
          a photoless hero paints itself brand-black instead (decision #108). */}
      <section
        className={`slotab-team-hero${team.heroPhoto ? "" : " no-photo"}`}
      >
        {team.heroPhoto && (
          <Image
            src={team.heroPhoto}
            alt={team.name}
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: "cover",
              objectPosition: team.heroPhotoPosition ?? "center center",
            }}
          />
        )}
        <div className="slotab-team-hero-overlay" />
        <div className="slotab-team-hero-content">
          <div className="slotab-kicker">
            {["SLOHS", team.gender, team.season].filter(Boolean).join(" · ")}
          </div>
          <h1>{team.name}</h1>
          {team.tagline && (
            <p className="slotab-team-tagline">{team.tagline}</p>
          )}
        </div>
      </section>

      {/* Quick facts row */}
      {hasQuickFacts && (
      <section className="slotab-section slotab-team-quickfacts">
        <div className="slotab-container slotab-team-quickfacts-grid">
          {headCoaches.map((coach) => (
            <div className="slotab-team-fact" key={coach.name}>
              <div className="slotab-team-fact-label">
                {coach.role ?? "Head Coach"}
              </div>
              <div className="slotab-team-fact-value">{coach.name}</div>
              {coach.email && (
                <a href={`mailto:${coach.email}`}>{coach.email}</a>
              )}
              {coach.phone && (
                <div>
                  <a href={telHref(coach.phone)}>{coach.phone}</a>
                </div>
              )}
            </div>
          ))}
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
      )}

      {/* Team photo — formal 2025-26 portrait */}
      {teamPhotos.length > 0 && (
        <section className="slotab-section slotab-team-photo-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">Meet the Team</span>
              <h2>{team.name} — 2026-27</h2>
            </div>
            {teamPhotos.map(({ photo, label, note }) => (
              <figure className="slotab-team-photo-frame" key={photo}>
                <Image
                  src={photo}
                  alt={
                    label
                      ? `${team.name} ${label} team photo`
                      : `${team.name} team photo`
                  }
                  width={1200}
                  height={800}
                  sizes="(max-width: 1024px) 100vw, 1100px"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                {(label || note) && (
                  <figcaption className="slotab-team-photo-caption">
                    {label}
                    {note && (
                      <span className="slotab-team-photo-note">{note}</span>
                    )}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* Action gallery — showcase as many in-game photos as we have */}
      {gallery.length > 0 && (
        <section className="slotab-section slotab-team-gallery-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">In Action</span>
              <h2>{team.name} on the field</h2>
            </div>
            <div className="slotab-team-gallery">
              {gallery.map((g, i) => (
                <figure key={g.photo} className="slotab-team-gallery-item">
                  <Image
                    src={g.photo}
                    alt={g.caption ?? `${team.name} action photo ${i + 1}`}
                    width={1200}
                    height={800}
                    sizes="(max-width: 720px) 100vw, (max-width: 1100px) 50vw, 360px"
                    loading="lazy"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                  {g.caption && (
                    <figcaption className="slotab-team-gallery-caption">
                      {g.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

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
      {roster.length > 0 && (
        <section className="slotab-section">
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">
                {roster.length} Tigers on the roster
              </span>
              <h2>Roster</h2>
            </div>
            {rosterSquads.map((g) => (
              <div key={g.label ?? "_"} className="slotab-team-roster-squad">
                {g.label && (
                  <h3 className="slotab-team-roster-squad-label">
                    {g.label}
                    <span className="slotab-team-roster-squad-count">
                      {g.players.length}
                    </span>
                  </h3>
                )}
                <div className="slotab-team-roster">
                  {g.players.map((p) => (
                    <div
                      key={`${g.label ?? ""}-${p.number ?? ""}-${p.name}`}
                      className={`slotab-team-roster-row${
                        p.number == null ? " no-num" : ""
                      }`}
                    >
                      {p.number != null && (
                        <span className="slotab-team-roster-num">
                          #{p.number}
                        </span>
                      )}
                      <span className="slotab-team-roster-name">{p.name}</span>
                      {p.position && (
                        <span className="slotab-team-roster-position">
                          {p.position}
                        </span>
                      )}
                      <span className="slotab-team-roster-year">
                        {formatYear(p.year)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Coach bios (if present) */}
      {headCoaches.some((c) => c.bio) && (
        <section className="slotab-section alt">
          <div className="slotab-container slotab-prose">
            <div className="slotab-section-title">
              <span className="slotab-kicker">
                {headCoaches.filter((c) => c.bio).length > 1
                  ? "Meet the Coaches"
                  : "Meet the Coach"}
              </span>
              <h2>
                {headCoaches
                  .filter((c) => c.bio)
                  .map((c) => c.name)
                  .join(" & ")}
              </h2>
            </div>
            {headCoaches
              .filter((c) => c.bio)
              .map((c) => (
                <div key={c.name} className="slotab-headcoach-bio">
                  {headCoaches.filter((x) => x.bio).length > 1 && (
                    <h3>
                      {c.name}
                      {c.role ? ` — ${c.role.replace(/^Head Coach\s*—?\s*/i, "")}` : ""}
                    </h3>
                  )}
                  <p>{c.bio}</p>
                </div>
              ))}
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

      {/* Watch this team — link to the BlueFrame portal on /watch */}
      <section className="slotab-section">
        <div
          className="slotab-container"
          style={{ textAlign: "center", maxWidth: 640 }}
        >
          <div className="slotab-section-title">
            <span className="slotab-kicker">Watch the Team</span>
            <h2>{team.sport} on Hudl</h2>
          </div>
          <p style={{ marginBottom: "1.5rem" }}>
            Live broadcasts plus the full archive — filterable by sport on
            our SLOHS Hudl portal. Streaming sponsored by SLOTAB.
          </p>
          <Link href="/watch" className="slotab-btn">
            Open the Tigers Watch Portal →
          </Link>
        </div>
      </section>

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
                    {formatCost(w.cost) ?? (
                      <em className="slotab-team-wishlist-tbd">Pricing TBD</em>
                    )}
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
