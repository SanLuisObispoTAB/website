import { notFound } from "next/navigation";
import FeaturedEventPage, {
  getFeaturedEvent,
} from "../components/FeaturedEventPage";

const SLUG = "back-to-school";
const event = getFeaturedEvent(SLUG);

export const metadata = {
  title: `${event?.title ?? "Event"} — SLOTAB`,
};

export default function BackToSchoolPage() {
  if (!event) notFound();
  return <FeaturedEventPage event={event} />;
}
