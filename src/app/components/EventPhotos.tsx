import ZoomablePhotos from "./ZoomablePhotos";

export type EventPhoto = string | { photo: string; caption?: string };

/** Photos from an event that has happened. Until any are added it shows a
 *  plain placeholder, so the page reads as "photos on the way" rather than
 *  as a record with nothing in it. */
export default function EventPhotos({
  photos,
  eventName,
}: {
  photos?: EventPhoto[];
  eventName: string;
}) {
  const items = (photos ?? []).map((p, i) =>
    typeof p === "string"
      ? { photo: p, alt: `${eventName} photo ${i + 1}` }
      : { photo: p.photo, caption: p.caption, alt: p.caption ?? `${eventName} photo ${i + 1}` },
  );

  if (items.length > 0) {
    return <ZoomablePhotos variant="gallery" items={items} />;
  }

  return (
    <div className="slotab-event-photos-placeholder" role="note">
      <p>
        <strong>Photos coming soon.</strong> We&apos;re gathering pictures
        and will post them here.
      </p>
    </div>
  );
}
