import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api.js';

const AuthContext = createContext(null);

export const DASHBOARD_BY_ROLE = {
  super_admin: '/super-admin/dashboard',
  admin: '/admin/dashboard',
  driver: '/driver/dashboard',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, ask the server who we are (the cookie is httpOnly,
  // so the only way to know is to call /me).
  useEffect(() => {
    api('/api/auth/me')
      .then(({ user }) => setUser(user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { user } = await api('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  // Called by ProtectedRoute when an API call returns 401 mid-session.
  const clearSession = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
