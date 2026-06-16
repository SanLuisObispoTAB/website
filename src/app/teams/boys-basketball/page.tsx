import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-basketball.json";

export const metadata = {
  title: "Boys Basketball — SLOTAB",
};

export default function BoysBasketballTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
