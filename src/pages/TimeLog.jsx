import { useState } from 'react';
import { useData } from '../store/DataContext';
import { todayStr, weekRange, formatMinutes, formatDay } from '../lib/date';

export default function TimeLog() {
  const { tasks, timeEntries, addTimeEntry, removeTimeEntry } = useData();
  const [form, setForm] = useState({ taskId: '', date: todayStr(), minutes: '', note: '' });
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const taskTitle = (id) => tasks.find((t) => t.id === id)?.title ?? 'Task dihapus';

  const submit = (e) => {
    e.preventDefault();
    const minutes = parseInt(form.minutes, 10);
    if (!form.taskId || !(minutes > 0)) return;
    addTimeEntry({ taskId: form.taskId, date: form.date, minutes, note: form.note.trim() });
    setForm({ ...form, minutes: '', note: '' });
  };

  const [weekStart, weekEnd] = weekRange();
  const weekTotal = timeEntries
    .filter((e) => e.date >= weekStart && e.date <= weekEnd)
    .reduce((sum, e) => sum + e.minutes, 0);

  // Kelompokkan per tanggal, terbaru dulu.
  const byDate = {};
  timeEntries.forEach((e) => {
    (byDate[e.date] = byDate[e.date] || []).push(e);
  });
  const dates = Object.keys(byDate).sort().reverse();

  return (
    <>
      <header className="page-head">
        <h1>Time log</h1>
        <div className="muted">Minggu ini: <strong>{formatMinutes(weekTotal)}</strong></div>
      </header>

      {tasks.length === 0 ? (
        <div className="empty-state">Buat task dulu di halaman Tasks sebelum mencatat waktu.</div>
      ) : (
        <section className="card">
          <h2>Catat waktu</h2>
          <form className="tl-form" onSubmit={submit}>
          <label>Task
            <select value={form.taskId} onChange={set('taskId')} required>
              <option value="" disabled>Pilih task</option>
              {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </label>
          <label>Tanggal
            <input type="date" value={form.date} onChange={set('date')} required />
          </label>
          <label>Durasi (menit)
            <input type="number" min="1" step="1" placeholder="45" value={form.minutes} onChange={set('minutes')} required />
          </label>
          <label>Catatan (opsional)
            <input placeholder="Apa yang dikerjakan?" value={form.note} onChange={set('note')} />
          </label>
          <button className="btn primary">Catat</button>
          </form>
        </section>
      )}

      {dates.length === 0 && <div className="empty-state">Belum ada waktu yang dicatat.</div>}

      {dates.map((d) => {
        const entries = byDate[d];
        const total = entries.reduce((sum, e) => sum + e.minutes, 0);
        return (
          <section className="card" key={d}>
            <div className="row" style={{ marginTop: 0 }}>
              <h2 style={{ margin: 0 }}>{formatDay(d)}</h2>
              <span className="muted">Total {formatMinutes(total)}</span>
            </div>
            {entries.map((e) => (
              <div className="entry" key={e.id}>
                <div>
                  <div className="t-title">{taskTitle(e.taskId)}</div>
                  {e.note && <div className="muted small">{e.note}</div>}
                </div>
                <div className="entry-right">
                  <strong>{formatMinutes(e.minutes)}</strong>
                  <button className="btn danger" onClick={() => removeTimeEntry(e.id)}>Hapus</button>
                </div>
              </div>
            ))}
          </section>
        );
      })}
    </>
  );
}