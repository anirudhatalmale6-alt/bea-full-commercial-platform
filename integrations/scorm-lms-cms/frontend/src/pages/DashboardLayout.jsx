import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';

const NAV_BY_ROLE = {
  teacher: [
    { to: '/teacher', label: 'Class Overview', end: true },
    { to: '/teacher/heatmap', label: 'Skill Heatmap' },
    { to: '/teacher/groups', label: 'Groups & Assignments' },
    { to: '/teacher/cefr', label: 'CEFR Courses' },
    { to: '/teacher/curriculum', label: 'Curriculum & Resources' },
  ],
  admin: [
    { to: '/admin', label: 'Content Coverage', end: true },
    { to: '/admin/audit', label: 'Audit Log' },
    { to: '/admin/cefr', label: 'CEFR Catalogue' },
    { to: '/admin/curriculum', label: 'Scope & Sequence' },
  ],
  parent: [
    { to: '/parent', label: 'My Child', end: true },
  ],
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const nav = NAV_BY_ROLE[user?.role] || [];

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          London English Academy
          <span>{user?.role} portal</span>
        </div>
        {nav.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <div className="mb-2">Signed in as<br /><strong style={{ color: '#fff' }}>{user?.display_name}</strong></div>
          <button className="btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff', width: '100%' }} onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
