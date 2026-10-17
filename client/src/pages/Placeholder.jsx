export default function Placeholder({ title, milestone, blurb }) {
  return (
    <section className="card">
      <h1>{title}</h1>
      <p>{blurb}</p>
      <p className="muted">Not built yet. Planned for milestone {milestone}.</p>
    </section>
  );
}
