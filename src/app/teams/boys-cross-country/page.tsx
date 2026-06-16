import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-cross-country.json";

export const metadata = {
  title: "Boys Cross Country — SLOTAB",
};

export default function BoysCrossCountryTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
