import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-cross-country.json";

export const metadata = {
  title: "Girls Cross Country — SLOTAB",
};

export default function GirlsCrossCountryTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
