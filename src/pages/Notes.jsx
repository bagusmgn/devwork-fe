import { useState } from 'react';
import { useData } from '../store/DataContext';
import Modal from '../components/Modal';
import { formatShort } from '../lib/date';

const EMPTY = { title: '', body: '', projectId: '' };

export default function Notes() {
  const { notes, projects, addNote, updateNote, removeNote } = useData();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null); // null = tutup, {} = baru, objek note = edit
  const [form, setForm] = useState(EMPTY);
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const projectName = (id) => projects.find((p) => p.id === id)?.name;
  const visible = notes
    .filter((n) => !filter || n.projectId === filter)
    .filter((n) => `${n.title} ${n.body}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  const openForm = (n) => {
    setForm(n ? { title: n.title, body: n.body, projectId: n.projectId || '' } : EMPTY);
    setEditing(n || {});
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const data = { title: form.title.trim(), body: form.body, projectId: form.projectId };
    if (editing.id) updateNote(editing.id, data);
    else addNote(data);
    setEditing(null);
  };

  const remove = (n) => {
    if (window.confirm(`Hapus note "${n.title}"?`)) removeNote(n.id);
  };

  return (
    <>
      <header className="page-head">
        <h1>Notes</h1>
        <button className="btn primary" onClick={() => openForm()}>+ New note</button>
      </header>

      <div className="toolbar">
        <input aria-label="Cari note" placeholder="Cari note" value={query} onChange={(e) => setQuery(e.target.value)} className="w-search" />
        <select aria-label="Filter proyek" value={filter} onChange={(e) => setFilter(e.target.value)} className="w-filter">
          <option value="">Semua proyek</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      {visible.length === 0 && <p className="muted">{notes.length === 0 ? 'Belum ada note.' : 'Tidak ada note yang cocok.'}</p>}

      <div className="grid3">
        {visible.map((n) => (
          <section className="card" key={n.id}>
            <h2>{n.title}</h2>
            {projectName(n.projectId) && <div className="pills"><span className="pill prj">{projectName(n.projectId)}</span></div>}
            <p className="muted clamp">{n.body}</p>
            <div className="row">
              <span className="muted small">Diubah {formatShort(n.updatedAt.slice(0, 10))}</span>
              <span>
                <button className="btn" onClick={() => openForm(n)}>Edit</button>{' '}
                <button className="btn danger" onClick={() => remove(n)}>Hapus</button>
              </span>
            </div>
          </section>
        ))}
      </div>

      {editing && (
        <Modal title={editing.id ? 'Edit note' : 'New note'} onClose={() => setEditing(null)}>
          <form className="form" onSubmit={submit}>
            <label>Judul
              <input value={form.title} onChange={set('title')} required autoFocus />
            </label>
            <label>Proyek (opsional)
              <select value={form.projectId} onChange={set('projectId')}>
                <option value="">Tanpa proyek</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label>Isi
              <textarea rows={8} value={form.body} onChange={set('body')} />
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
