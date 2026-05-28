import PageHeader from "../components/PageHeader";
import TeamsIndexList from "../components/TeamsIndexList";
import teamsIndex from "../data/teams.json";

type TeamIndexEntry = {
  slug: string;
  name: string;
  gender: string;
  season: string;
  hasPage: boolean;
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
            Every CIF-sanctioned varsity program SLOTAB supports. Scroll
            through the seasons — each section blooms with team photos as it
            comes into focus.
          </p>
        </div>
      </section>

      <TeamsIndexList groups={groups} />
    </>
  );
}
