import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-soccer.json";

export const metadata = {
  title: "Girls Soccer — SLOTAB",
};

export default function GirlsSoccerTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
