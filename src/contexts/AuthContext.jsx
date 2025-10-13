import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const res = await apiFetch('/me', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMe();
  }, []);

  async function login(username, password) {
    try {
      const res = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        return { success: false, error: data.error || 'Erro de conexão' };
      }
      await fetchMe(); // carrega /me após login
      return { success: true };
    } catch {
      return { success: false, error: 'Erro de conexão' };
    }
  }

  async function logout() {
    try {
      await apiFetch('/logout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }

  const value = { user, loading, login, logout, refresh: fetchMe };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);