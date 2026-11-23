import { Link } from 'react-router-dom';
import { useData } from '../store/DataContext';
import { todayStr, addDays, weekRange, formatMinutes, formatLongDate, formatShort } from '../lib/date';

const MAX_FOCUS = 5;
const MAX_PROJECTS = 5;

function DueLabel({ date, today }) {
  if (!date) return <span className="muted small nowrap">Tanpa due date</span>;
  if (date < today) return <span className="small nowrap late">Terlambat · {formatShort(date)}</span>;
  if (date === today) return <span className="small nowrap soon">Hari ini</span>;
  return <span className="muted small nowrap">Due {formatShort(date)}</span>;
}

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

  // Fokus: task yang sedang dikerjakan, due date terdekat dulu, tanpa due date di akhir.
  const focus = [...inProgress]
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))
    .slice(0, MAX_FOCUS);

  // Progress: hanya proyek yang punya task, yang masih punya pekerjaan terbuka tampil lebih dulu.
  const withTasks = projects
    .map((p) => {
      const mine = tasks.filter((t) => t.projectId === p.id);
      const done = mine.filter((t) => t.status === 'done').length;
      return { id: p.id, name: p.name, total: mine.length, done, open: mine.length - done };
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.open - a.open || a.name.localeCompare(b.name));
  const shown = withTasks.slice(0, MAX_PROJECTS);
  const hiddenCount = projects.length - shown.length;

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
        <section className="card dash-main">
          <div className="card-head">
            <h2>Fokus hari ini</h2>
            <Link className="link" to="/tasks">Lihat semua</Link>
          </div>
          {focus.length === 0 && (
            <p className="muted empty">Tidak ada task yang sedang dikerjakan. Pindahkan task ke In progress di halaman Tasks.</p>
          )}
          {focus.map((t) => (
            <div className="focus-row" key={t.id}>
              <div className="grow">
                <div className="t-title">{t.title}</div>
                <div className="pills">
                  <span className="pill prj">{projectName(t.projectId)}</span>
                  <span className={`pill ${t.priority.toLowerCase()}`}>{t.priority}</span>
                </div>
              </div>
              <DueLabel date={t.dueDate} today={today} />
            </div>
          ))}
        </section>

        <section className="card dash-side">
          <div className="card-head">
            <h2>Progress proyek</h2>
            <Link className="link" to="/projects">Semua proyek</Link>
          </div>
          {projects.length === 0 && <p className="muted empty">Belum ada proyek.</p>}
          {projects.length > 0 && shown.length === 0 && <p className="muted empty">Belum ada task di proyek mana pun.</p>}
          {shown.map((p) => {
            const pct = Math.round((p.done / p.total) * 100);
            return (
              <div className="prog" key={p.id}>
                <div className="row">
                  <strong className="ellipsis">{p.name}</strong>
                  <span className="muted small nowrap">{pct}%</span>
                </div>
                <div className={pct === 100 ? 'bar done' : 'bar'}><div style={{ width: `${pct}%` }} /></div>
                <div className="muted small">{p.done} dari {p.total} task selesai</div>
              </div>
            );
          })}
          {hiddenCount > 0 && shown.length > 0 && (
            <Link className="link small" to="/projects">+{hiddenCount} proyek lain</Link>
          )}
        </section>
      </div>
    </>
  );
}
