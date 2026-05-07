type TopBarItem = {
  tag?: string;
  text: string;
  score?: string;
};

type Props = {
  items: TopBarItem[];
};

export default function TopBar({ items }: Props) {
  // Items duplicated 3× so the marquee loops seamlessly without a gap.
  const triple = [...items, ...items, ...items];

  return (
    <div className="tiger-topbar" aria-label="Recent Tiger results and upcoming events">
      <div className="tiger-marquee tiger-topbar-track">
        {triple.map((it, i) => (
          <span key={i} className="tiger-topbar-item">
            {it.tag && <span className="tiger-topbar-tag">{it.tag}</span>}
            <span className="tiger-topbar-text">{it.text}</span>
            {it.score && <span className="tiger-topbar-score">{it.score}</span>}
          </span>
        ))}
      </div>
    </div>
  );
}
