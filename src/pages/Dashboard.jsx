import { Link } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { todayStr, addDays, weekRange, formatMinutes, formatLongDate, formatShort } from '../lib/date';

export default function Dashboard() {
  const { tasks, projects, timeEntries } = useData();
  const today = todayStr();
  const [weekStart, weekEnd] = weekRange(today);

  const open = tasks.filter((t) => t.status !== 'done');
  const inProgress = tasks.filter((t) => t.status === 'in_progress');
  const dueSoon = open.filter((t) => t.dueDate && t.dueDate >= today && t.dueDate <= addDays(today, 7));
  const weekMinutes = timeEntries
    .filter((e) => e.date >= weekStart && e.date <= weekEnd)
    .reduce((sum, e) => sum + e.minutes, 0);

  const stats = [
    ['Open tasks', open.length],
    ['In progress', inProgress.length],
    ['Due in 7 days', dueSoon.length],
    ['Time this week', formatMinutes(weekMinutes)],
  ];

  // Fokus hari ini: task yang sedang dikerjakan, due date terdekat dulu, tanpa due date di akhir.
  const focus = [...inProgress]
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, 5);

  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? 'Tanpa proyek';

  return (
    <>
      <header className="page-head">
        <div>
          <h1>Dashboard</h1>
          <div className="muted">{formatLongDate()}</div>
        </div>
        <Link className="btn primary" to="/tasks">Lihat semua task</Link>
      </header>

      <div className="stats">
        {stats.map(([label, n]) => (
          <section className="card" key={label}>
            <div className="muted">{label}</div>
            <div className="stat">{n}</div>
          </section>
        ))}
      </div>

      <div className="dash-grid">
        <section className="card">
          <h2>Fokus hari ini</h2>
          {focus.length === 0 && <p className="muted">Tidak ada task yang sedang dikerjakan.</p>}
          {focus.map((t) => (
            <div className="focus-row" key={t.id}>
              <div>
                <div className="t-title">{t.title}</div>
                <div className="pills">
                  <span className="pill prj">{projectName(t.projectId)}</span>
                  <span className={`pill ${t.priority.toLowerCase()}`}>{t.priority}</span>
                </div>
              </div>
              <div className="muted small nowrap">{t.dueDate ? `Due ${formatShort(t.dueDate)}` : 'Tanpa due date'}</div>
            </div>
          ))}
        </section>

        <section className="card">
          <h2>Progress proyek</h2>
          {projects.length === 0 && <p className="muted">Belum ada proyek.</p>}
          {projects.map((p) => {
            const mine = tasks.filter((t) => t.projectId === p.id);
            const done = mine.filter((t) => t.status === 'done').length;
            const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
            return (
              <div className="prog" key={p.id}>
                <div className="row">
                  <strong>{p.name}</strong>
                  <span className="muted">{done} dari {mine.length} selesai</span>
                </div>
                <div className="bar"><div style={{ width: `${pct}%` }} /></div>
              </div>
            );
          })}
        </section>
      </div>
    </>
  );
}
