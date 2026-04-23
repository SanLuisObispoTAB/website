import TeamPage, { type Team } from "../../components/TeamPage";
import teamData from "../../data/teams/track-field.json";

export const metadata = {
  title: "Track & Field — SLOTAB",
};

export default function TrackFieldTeamPage() {
  return <TeamPage team={teamData as Team} />;
}
