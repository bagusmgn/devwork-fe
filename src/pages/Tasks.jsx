import { useState } from 'react';
import { useData } from '../store/DataContext';
import Modal from '../components/Modal';
import { STATUSES, PRIORITIES } from '../lib/constants';
import { formatShort } from '../lib/date';

const EMPTY = { title: '', description: '', projectId: '', status: 'backlog', priority: 'Medium', dueDate: '' };

export default function Tasks() {
  const { tasks, projects, addTask, updateTask, removeTask } = useData();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null); // null = tutup, {} = baru, objek task = edit
  const [form, setForm] = useState(EMPTY);
  const [overCol, setOverCol] = useState(null); // kolom yang sedang disorot saat drag

  const projectName = (id) => projects.find((p) => p.id === id)?.name ?? 'Tanpa proyek';
  const visible = tasks.filter((t) => !filter || t.projectId === filter);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const openForm = (task) => {
    if (task) {
      const { id, createdAt, updatedAt, ...rest } = task;
      setForm({ ...EMPTY, ...rest });
    } else {
      setForm({ ...EMPTY, projectId: filter || projects[0]?.id || '' });
    }
    setEditing(task || {});
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { ...form, title: form.title.trim() };
    if (editing.id) updateTask(editing.id, data);
    else addTask(data);
    setEditing(null);
  };

  const remove = (t) => {
    if (window.confirm(`Hapus task "${t.title}"?`)) removeTask(t.id);
  };

  return (
    <>
      <header className="page-head">
        <h1>Tasks</h1>
        <button className="btn primary" onClick={() => openForm()} disabled={projects.length === 0}>+ New task</button>
      </header>

      {projects.length === 0 ? (
        <p className="muted">Buat proyek dulu di halaman Projects sebelum menambah task.</p>
      ) : (
        <select aria-label="Filter proyek" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ width: 220 }}>
          <option value="">Semua proyek</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      )}

      <div className="board">
        {STATUSES.map((s) => {
          const items = visible.filter((t) => t.status === s.value);
          return (
            <section
              className={overCol === s.value ? 'col over' : 'col'}
              key={s.value}
              onDragOver={(e) => {
                e.preventDefault();
                setOverCol(s.value);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setOverCol(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setOverCol(null);
                const id = e.dataTransfer.getData('text/plain');
                const task = tasks.find((x) => x.id === id);
                if (task && task.status !== s.value) updateTask(id, { status: s.value });
              }}
            >
              <h2>{s.label} <span className="muted">{items.length}</span></h2>
              {items.map((t) => (
                <article
                  className="task"
                  key={t.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/plain', t.id)}
                  onDragEnd={() => setOverCol(null)}
                >
                  <div className="t-title">{t.title}</div>
                  <div className="pills">
                    <span className="pill prj">{projectName(t.projectId)}</span>
                    <span className={`pill ${t.priority.toLowerCase()}`}>{t.priority}</span>
                  </div>
                  <div className="muted small">{t.dueDate ? `Due ${formatShort(t.dueDate)}` : 'Tanpa due date'}</div>
                  <div className="row">
                    <select aria-label="Ubah status" value={t.status} onChange={(e) => updateTask(t.id, { status: e.target.value })}>
                      {STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <span>
                      <button className="btn" onClick={() => openForm(t)}>Edit</button>{' '}
                      <button className="btn danger" onClick={() => remove(t)}>Hapus</button>
                    </span>
                  </div>
                </article>
              ))}
            </section>
          );
        })}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit task' : 'New task'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={submit}>
            <label>Judul
              <input value={form.title} onChange={set('title')} required autoFocus />
            </label>
            <label>Proyek
              <select value={form.projectId} onChange={set('projectId')} required>
                <option value="" disabled>Pilih proyek</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Status
              <select value={form.status} onChange={set('status')}>
                {STATUSES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label>Prioritas
              <select value={form.priority} onChange={set('priority')}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </label>
            <label>Due date
              <input type="date" value={form.dueDate} onChange={set('dueDate')} />
            </label>
            <label>Deskripsi
              <textarea rows={3} value={form.description} onChange={set('description')} />
            </label>
            <div className="actions">
              <button type="button" className="btn" onClick={() => setEditing(null)}>Batal</button>
              <button className="btn primary">Simpan</button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
