import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/girls-swim-dive.json";

export const metadata = {
  title: "Girls Swim & Dive — SLOTAB",
};

export default function GirlsSwimDiveTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
