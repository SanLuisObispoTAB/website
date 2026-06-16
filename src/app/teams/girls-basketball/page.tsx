import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-basketball.json";

export const metadata = {
  title: "Girls Basketball — SLOTAB",
};

export default function GirlsBasketballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
