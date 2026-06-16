import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-wrestling.json";

export const metadata = {
  title: "Girls Wrestling — SLOTAB",
};

export default function GirlsWrestlingTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
