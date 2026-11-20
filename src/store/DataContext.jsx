import { createContext, useContext, useMemo, useReducer } from 'react';
import { projectRepo, taskRepo } from '../services/repositories';

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
  }));

  const value = useMemo(() => {
    const p = crud(dispatch, 'projects', projectRepo);
    const t = crud(dispatch, 'tasks', taskRepo);
    return {
      ...state,
      addProject: p.add,
      updateProject: p.update,
      removeProject: (id) => {
        // Hapus proyek ikut menghapus task-nya.
        taskRepo.removeBy('projectId', id);
        dispatch({ type: 'removeBy', entity: 'tasks', field: 'projectId', value: id });
        p.remove(id);
      },
      addTask: t.add,
      updateTask: t.update,
      removeTask: t.remove,
    };
  }, [state]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => useContext(DataContext);
