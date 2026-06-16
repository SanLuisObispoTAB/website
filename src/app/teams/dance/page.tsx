import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/dance.json";

export const metadata = {
  title: "Dance — SLOTAB",
};

export default function DanceTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
