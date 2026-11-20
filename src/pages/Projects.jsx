import { useState } from 'react';
import { useData } from '../store/DataContext';
import Modal from '../components/Modal';

const EMPTY = { name: '', description: '' };

export default function Projects() {
  const { projects, tasks, addProject, updateProject, removeProject } = useData();
  const [editing, setEditing] = useState(null); // null = tutup, {} = baru, objek project = edit
  const [form, setForm] = useState(EMPTY);

  const openForm = (p) => {
    setForm(p ? { name: p.name, description: p.description } : EMPTY);
    setEditing(p || {});
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const data = { name: form.name.trim(), description: form.description.trim() };
    if (editing.id) updateProject(editing.id, data);
    else addProject(data);
    setEditing(null);
  };

  const remove = (p) => {
    if (window.confirm(`Hapus proyek "${p.name}" beserta semua task-nya?`)) removeProject(p.id);
  };

  return (
    <>
      <header className="page-head">
        <h1>Projects</h1>
        <button className="btn primary" onClick={() => openForm()}>+ New project</button>
      </header>

      {projects.length === 0 && <p className="muted">Belum ada proyek. Buat yang pertama.</p>}

      <div className="grid3">
        {projects.map((p) => {
          const mine = tasks.filter((t) => t.projectId === p.id);
          const done = mine.filter((t) => t.status === 'done').length;
          const pct = mine.length ? Math.round((done / mine.length) * 100) : 0;
          return (
            <section className="card" key={p.id}>
              <h2>{p.name}</h2>
              <p className="muted">{p.description}</p>
              <div className="bar"><div style={{ width: `${pct}%` }} /></div>
              <div className="row">
                <span className="muted">{done} dari {mine.length} task selesai</span>
                <span>
                  <button className="btn" onClick={() => openForm(p)}>Edit</button>{' '}
                  <button className="btn danger" onClick={() => remove(p)}>Hapus</button>
                </span>
              </div>
            </section>
          );
        })}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit project' : 'New project'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={submit}>
            <label>Nama
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required autoFocus />
            </label>
            <label>Deskripsi
              <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
