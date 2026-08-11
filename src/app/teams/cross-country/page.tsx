import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/cross-country.json";

export const metadata = {
  title: "Cross Country — SLOTAB",
};

export default function CrossCountryTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
