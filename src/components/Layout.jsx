import { NavLink, Outlet } from 'react-router-dom';
import { Home, CheckSquare, Folder, FileText, Clock } from 'react-feather';

const links = [
  { to: '/', label: 'Dashboard', icon: Home, end: true },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/projects', label: 'Projects', icon: Folder },
  { to: '/notes', label: 'Notes', icon: FileText },
  { to: '/timelog', label: 'Time log', icon: Clock },
];

export default function Layout() {
  return (
    <div className="shell">
      {/* Desktop dan tablet: sidebar */}
      <aside className="sidebar">
        <div className="brand">DevWork</div>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'nav active' : 'nav')}>
            {l.label}
          </NavLink>
        ))}
        <div className="foot">Data tersimpan di localStorage</div>
      </aside>

      <div className="content">
        <div className="topbar">DevWork</div>
        <main className="main">
          <Outlet />
        </main>
      </div>

      {/* HP: navigasi bawah (mudah dijangkau ibu jari) */}
      <nav className="bottom-nav" aria-label="Navigasi utama">
        {links.map(({ to, label, end, icon: Icon }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'tab active' : 'tab')}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
