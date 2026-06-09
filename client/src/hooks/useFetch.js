import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Fetch JSON from the API on mount (and when `path` changes).
 * A 401 mid-session clears the auth state, which sends the user
 * back to /login via ProtectedRoute.
 */
export function useFetch(path) {
  const { clearSession } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    return api(path)
      .then(setData)
      .catch((err) => {
        if (err.status === 401) clearSession();
        else setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [path, clearSession]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, error, loading, refetch };
}
