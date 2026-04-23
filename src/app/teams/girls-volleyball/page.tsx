import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-volleyball.json";

export const metadata = {
  title: "Girls Volleyball — SLOTAB",
};

export default function GirlsVolleyballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
