import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/cheer.json";

export const metadata = {
  title: "Cheer — SLOTAB",
};

export default function CheerTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
