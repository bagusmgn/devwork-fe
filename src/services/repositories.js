// UI tidak pernah memanggil localStorage langsung, hanya repository ini.
// Saat backend siap, ganti isi createRepository dengan panggilan REST (list/create/update/remove).
import { read, write } from './storage';

const now = () => new Date().toISOString();
const newId = () => crypto.randomUUID(); // butuh localhost atau https

export function createRepository(entity) {
  const all = () => read(entity, []);

  return {
    list: all,
    create(data) {
      const item = { ...data, id: newId(), createdAt: now(), updatedAt: now() };
      write(entity, [...all(), item]);
      return item;
    },
    update(id, patch) {
      let updated = null;
      const items = all().map((i) => {
        if (i.id !== id) return i;
        updated = { ...i, ...patch, updatedAt: now() };
        return updated;
      });
      write(entity, items);
      return updated;
    },
    remove(id) {
      write(entity, all().filter((i) => i.id !== id));
    },
    removeBy(field, value) {
      write(entity, all().filter((i) => i[field] !== value));
    },
  };
}

export const projectRepo = createRepository('projects');
export const taskRepo = createRepository('tasks');
export const timeRepo = createRepository('timeEntries');
export const noteRepo = createRepository('notes');
