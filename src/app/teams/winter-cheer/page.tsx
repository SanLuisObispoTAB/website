import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/winter-cheer.json";

export const metadata = {
  title: "Tiger Winter Cheer — SLOTAB",
};

export default function WinterCheerTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
