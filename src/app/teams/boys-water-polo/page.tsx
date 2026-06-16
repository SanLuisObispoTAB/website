import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-water-polo.json";

export const metadata = {
  title: "Boys Water Polo — SLOTAB",
};

export default function BoysWaterPoloTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
