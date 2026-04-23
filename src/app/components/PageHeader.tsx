export default function PageHeader({
  kicker,
  title,
}: {
  kicker?: string;
  title: string;
}) {
  return (
    <section className="slotab-page-header">
      {kicker && <div className="slotab-kicker">{kicker}</div>}
      <h1>{title}</h1>
    </section>
  );
}
