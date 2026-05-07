export default function TigerPageHeader({
  kicker,
  title,
}: {
  kicker?: string;
  title: string;
}) {
  return (
    <section className="tiger-page-header">
      <div className="tiger-container">
        {kicker && <div className="tiger-eyebrow">{kicker}</div>}
        <h1>{title}</h1>
      </div>
    </section>
  );
}
