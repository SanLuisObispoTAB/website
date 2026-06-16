import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-golf.json";

export const metadata = {
  title: "Girls Golf — SLOTAB",
};

export default function GirlsGolfTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
