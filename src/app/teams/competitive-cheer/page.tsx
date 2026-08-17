import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/competitive-cheer.json";

export const metadata = {
  title: "Traditional Competitive Cheer — SLOTAB",
};

export default function CompetitiveCheerTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
