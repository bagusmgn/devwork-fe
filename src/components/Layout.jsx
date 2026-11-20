import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/tasks', label: 'Tasks' },
  { to: '/projects', label: 'Projects' },
];

export default function Layout() {
  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">DevWork</div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
            {l.label}
          </NavLink>
        ))}
        <div className="foot">Data tersimpan di localStorage</div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
