import Link from "next/link";
import PageHeader from "../components/PageHeader";
import teamsIndex from "../data/teams.json";

type TeamIndexEntry = {
  slug: string;
  name: string;
  gender: string;
  season: string;
  hasPage: boolean;
  operationalSetup?: "standard" | "custom" | "none";
};

const STATUS_LABEL: Record<string, string> = {
  standard: "Standard Kit",
  custom: "Coach's Site",
  none: "Not set up",
};

type Group = { season: string; teams: TeamIndexEntry[] };

function groupBySeason(teams: TeamIndexEntry[]): Group[] {
  const order = ["Fall", "Winter", "Spring", "Year-round"];
  const map = new Map<string, TeamIndexEntry[]>();
  for (const t of teams) {
    if (!map.has(t.season)) map.set(t.season, []);
    map.get(t.season)!.push(t);
  }
  return order
    .filter((s) => map.has(s))
    .map((s) => ({ season: s, teams: map.get(s)! }))
    .map((g) => ({
      ...g,
      teams: g.teams
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name) || a.gender.localeCompare(b.gender)),
    }));
}

export const metadata = {
  title: "Teams — SLOTAB",
};

export default function TeamsIndexPage() {
  const groups = groupBySeason(teamsIndex.teams as TeamIndexEntry[]);

  return (
    <>
      <PageHeader kicker="Every SLOHS Program" title="Tiger Teams" />
      <section className="slotab-section">
        <div
          className="slotab-container slotab-prose"
          style={{ textAlign: "center" }}
        >
          <p style={{ fontSize: "1.15rem" }}>
            Every CIF-sanctioned varsity program SLOTAB supports. The three
            teams with active pages are the prototype template — the rest get
            pages as soon as each coach and team liaison contributes content.
          </p>
        </div>
      </section>

      {groups.map((g) => (
        <section
          key={g.season}
          className="slotab-section"
          style={{
            background:
              g.season === "Fall" || g.season === "Spring"
                ? "var(--slotab-bg-alt)"
                : "#fff",
          }}
        >
          <div className="slotab-container">
            <div className="slotab-section-title">
              <span className="slotab-kicker">{g.season} Season</span>
              <h2>
                {g.teams.length}{" "}
                {g.teams.length === 1 ? "program" : "programs"}
              </h2>
            </div>
            <div className="slotab-teams-grid">
              {g.teams.map((t) => {
                const setup = t.operationalSetup ?? "none";
                const statusLabel = STATUS_LABEL[setup] ?? "Not set up";
                const body = (
                  <>
                    <div className="slotab-team-card-gender">{t.gender}</div>
                    <div className="slotab-team-card-name">{t.name}</div>
                    <div
                      className={`slotab-team-card-status ${setup}`}
                      title={`Player/parent comms: ${statusLabel}`}
                    >
                      {statusLabel}
                    </div>
                    <div className="slotab-team-card-cta">
                      {t.hasPage ? "View team →" : "Coming soon"}
                    </div>
                  </>
                );
                return t.hasPage ? (
                  <Link
                    key={t.slug}
                    href={`/teams/${t.slug}`}
                    className="slotab-team-card"
                  >
                    {body}
                  </Link>
                ) : (
                  <div
                    key={t.slug}
                    className="slotab-team-card soon"
                    aria-disabled
                  >
                    {body}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
