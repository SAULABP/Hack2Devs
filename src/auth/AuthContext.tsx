import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, apiRequest, setToken, clearToken, getToken, setUnauthorizedHandler } from '../lib/apiClient';
import type { AuthUser, LoginResponse } from '../types/api';

interface AuthState {
  user: AuthUser | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  login: (teamCode: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthState['status']>('loading');

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  // 401 desde cualquier request => sesión muerta => logout global.
  useEffect(() => {
    setUnauthorizedHandler(logout);
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  // Restaurar sesión al cargar: si hay token, validarlo con /auth/me.
  useEffect(() => {
    const token = getToken();
    if (!token) { setStatus('unauthenticated'); return; }
    let alive = true;
    api.get<AuthUser>('/auth/me')
      .then((me) => { if (alive) { setUser(me); setStatus('authenticated'); } })
      .catch(() => { if (alive) { clearToken(); setStatus('unauthenticated'); } });
    return () => { alive = false; };
  }, []);

  const login = useCallback(async (teamCode: string, email: string, password: string) => {
    const res = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      auth: false,
      body: { teamCode, email, password },
    });
    setToken(res.token);
    setUser(res.user);
    setStatus('authenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
