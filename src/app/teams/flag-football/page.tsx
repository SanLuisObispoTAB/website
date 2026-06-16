import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/flag-football.json";

export const metadata = {
  title: "Girls Flag Football — SLOTAB",
};

export default function FlagFootballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
