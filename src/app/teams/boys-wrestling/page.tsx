import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-wrestling.json";

export const metadata = {
  title: "Boys Wrestling — SLOTAB",
};

export default function BoysWrestlingTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
