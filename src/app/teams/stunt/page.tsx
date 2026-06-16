import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/stunt.json";

export const metadata = {
  title: "STUNT — SLOTAB",
};

export default function StuntTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
