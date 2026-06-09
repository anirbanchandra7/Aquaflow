import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/** Minimal shared frame for the role dashboards (real UI comes later). */
export default function DashboardShell({ title, children }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-[#0A1628] text-white px-6 py-4 flex items-center justify-between">
        <span className="font-bold">💧 AquaFlow</span>
        <button
          onClick={handleLogout}
          className="text-sm text-slate-300 hover:text-white transition-colors"
        >
          Log out
        </button>
      </header>
      <main className="p-6">
        <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
        {children}
      </main>
    </div>
  );
}
