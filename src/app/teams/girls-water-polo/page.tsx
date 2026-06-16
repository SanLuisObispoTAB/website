import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-water-polo.json";

export const metadata = {
  title: "Girls Water Polo — SLOTAB",
};

export default function GirlsWaterPoloTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
