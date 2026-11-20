import { useData } from '../store/DataContext';

export default function Dashboard() {
  const { tasks, projects } = useData();
  const count = (status) => tasks.filter((t) => t.status === status).length;
  const stats = [
    ['Open tasks', tasks.length - count('done')],
    ['In progress', count('in_progress')],
    ['Done', count('done')],
    ['Projects', projects.length],
  ];

  return (
    <>
      <header className="page-head">
        <h1>Dashboard</h1>
      </header>
      <div className="stats">
        {stats.map(([label, n]) => (
          <section className="card" key={label}>
            <div className="muted">{label}</div>
            <div className="stat">{n}</div>
          </section>
        ))}
      </div>
    </>
  );
}
