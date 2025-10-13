import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuthStatus(); }, []);

  const checkAuthStatus = async () => {
    try {
      const res = await apiFetch('/me');
      if (res.ok) setUser(await res.json());
    } catch {}
    finally { setLoading(false); }
  };

  const login = async (username, password) => {
    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setUser(data.user); return { success: true }; }
      return { success: false, error: data.error || 'Credenciais inválidas' };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await apiFetch('/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      return res.ok ? { success: true, message: data.message } 
                    : { success: false, error: data.error || 'Erro ao registrar' };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const logout = async () => {
    try { await apiFetch('/logout', { method: 'POST' }); }
    finally { setUser(null); }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
