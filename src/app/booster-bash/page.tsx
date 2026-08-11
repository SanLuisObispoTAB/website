import { notFound } from "next/navigation";
import FeaturedEventPage, {
  getFeaturedEvent,
} from "../components/FeaturedEventPage";

const SLUG = "booster-bash";
const event = getFeaturedEvent(SLUG);

export const metadata = {
  title: `${event?.title ?? "Event"} — SLOTAB`,
};

export default function BoosterBashPage() {
  if (!event) notFound();
  return <FeaturedEventPage event={event} />;
}
