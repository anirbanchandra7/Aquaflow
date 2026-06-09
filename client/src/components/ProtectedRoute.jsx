import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, DASHBOARD_BY_ROLE } from '../context/AuthContext.jsx';

/**
 * Guards a route subtree. Redirects to /login when unauthenticated
 * (including expired/invalid tokens — /me fails and user stays null),
 * and to the user's own dashboard when the role doesn't match.
 */
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A1628]">
        <span className="text-slate-400 text-sm">Loading…</span>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={DASHBOARD_BY_ROLE[user.role] || '/login'} replace />;
  }
  return <Outlet />;
}
