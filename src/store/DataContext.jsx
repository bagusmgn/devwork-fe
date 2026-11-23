import { createContext, useContext, useMemo, useReducer } from 'react';
import { projectRepo, taskRepo, timeRepo, noteRepo } from '../services/repositories';

const DataContext = createContext(null);

function reducer(state, a) {
  const list = state[a.entity];
  switch (a.type) {
    case 'add':
      return { ...state, [a.entity]: [...list, a.item] };
    case 'update':
      return { ...state, [a.entity]: list.map((i) => (i.id === a.item.id ? a.item : i)) };
    case 'remove':
      return { ...state, [a.entity]: list.filter((i) => i.id !== a.id) };
    case 'removeBy':
      return { ...state, [a.entity]: list.filter((i) => i[a.field] !== a.value) };
    default:
      return state;
  }
}

// Tulis ke repository dulu, lalu perbarui state di memori.
const crud = (dispatch, entity, repo) => ({
  add: (data) => dispatch({ type: 'add', entity, item: repo.create(data) }),
  update: (id, patch) => {
    const item = repo.update(id, patch);
    if (item) dispatch({ type: 'update', entity, item });
  },
  remove: (id) => {
    repo.remove(id);
    dispatch({ type: 'remove', entity, id });
  },
});

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({
    projects: projectRepo.list(),
    tasks: taskRepo.list(),
    timeEntries: timeRepo.list(),
    notes: noteRepo.list(),
  }));

  const value = useMemo(() => {
    const p = crud(dispatch, 'projects', projectRepo);
    const t = crud(dispatch, 'tasks', taskRepo);
    const te = crud(dispatch, 'timeEntries', timeRepo);
    const n = crud(dispatch, 'notes', noteRepo);

    // Hapus data anak milik satu induk, di repository dan di state.
    const cascade = (repo, entity, field, val) => {
      repo.removeBy(field, val);
      dispatch({ type: 'removeBy', entity, field, value: val });
    };

    return {
      ...state,
      addProject: p.add,
      updateProject: p.update,
      removeProject: (id) => {
        // Proyek dihapus: task, time entry milik task itu, dan note ikut dihapus.
        state.tasks.filter((x) => x.projectId === id).forEach((x) => cascade(timeRepo, 'timeEntries', 'taskId', x.id));
        cascade(taskRepo, 'tasks', 'projectId', id);
        cascade(noteRepo, 'notes', 'projectId', id);
        p.remove(id);
      },
      addTask: t.add,
      updateTask: t.update,
      removeTask: (id) => {
        cascade(timeRepo, 'timeEntries', 'taskId', id);
        t.remove(id);
      },
      addTimeEntry: te.add,
      removeTimeEntry: te.remove,
      addNote: n.add,
      updateNote: n.update,
      removeNote: n.remove,
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
