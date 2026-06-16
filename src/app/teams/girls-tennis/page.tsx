import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-tennis.json";

export const metadata = {
  title: "Girls Tennis — SLOTAB",
};

export default function GirlsTennisTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
