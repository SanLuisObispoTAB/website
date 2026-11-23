import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/boys-swim-dive.json";

export const metadata = {
  title: "Boys Swim & Dive — SLOTAB",
};

export default function BoysSwimDiveTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
