import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-soccer.json";

export const metadata = {
  title: "Boys Soccer — SLOTAB",
};

export default function BoysSoccerTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
