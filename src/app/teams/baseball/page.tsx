import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/baseball.json";

export const metadata = {
  title: "Baseball — SLOTAB",
};

export default function BaseballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
