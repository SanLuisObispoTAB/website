import { embedUrl } from "../data/broadcasts";

type Props = {
  broadcastId: string;
  title?: string;
  autoplay?: boolean;
};

/** Hudl vCloud iframe in a 16:9 responsive container. */
export default function BroadcastEmbed({
  broadcastId,
  title,
  autoplay = false,
}: Props) {
  return (
    <div className="slotab-broadcast-embed">
      <iframe
        src={embedUrl(broadcastId, { autoplay })}
        title={title ?? `Hudl broadcast ${broadcastId}`}
        allow="fullscreen"
        loading="lazy"
      />
    </div>
  );
}
