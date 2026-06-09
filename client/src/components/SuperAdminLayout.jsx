import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const LINKS = [
  { to: '/super-admin/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/super-admin/distributors', label: 'Distributors', icon: '🏢' },
  { to: '/super-admin/support-tickets', label: 'Support Tickets', icon: '🎫' },
  { to: '/super-admin/settings', label: 'Settings', icon: '⚙️' },
];

export default function SuperAdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#0A1628] text-white flex flex-col">
        <div className="px-5 py-6 text-lg font-bold">💧 AquaFlow</div>
        <nav className="flex-1 px-3 space-y-1">
          {LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? 'bg-[#0EA5E9] text-white font-medium'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <p className="px-3 text-xs text-slate-400 mb-2">Super Admin</p>
          <button
            onClick={handleLogout}
            className="w-full text-left rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          >
            ↩ Log out
          </button>
        </div>
      </aside>
      <main className="ml-60 p-8">
        <Outlet />
      </main>
    </div>
  );
}
