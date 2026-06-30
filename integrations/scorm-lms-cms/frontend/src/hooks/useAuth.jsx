import { createContext, useContext, useState, useCallback } from 'react';
import { api, getToken, setToken, clearToken, getStoredUser, setStoredUser } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser());
  const [token, setTok] = useState(getToken());

  const login = useCallback(async (email, password) => {
    const result = await api.login(email, password);
    setToken(result.token);
    setTok(result.token);
    const u = { id: result.user_id, role: result.role, display_name: result.display_name };
    setStoredUser(u);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    setTok(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
