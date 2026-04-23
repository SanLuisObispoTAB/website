import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/football.json";

export const metadata = {
  title: "Football — SLOTAB",
};

export default function FootballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
