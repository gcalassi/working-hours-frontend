// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE || "/api";

/**
 * apiFetch: wrapper de fetch que sempre envia cookies de sessão
 * e aplica Content-Type JSON por padrão.
 */
export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const defaultOpts = {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  };

  const merged = {
    ...defaultOpts,
    ...options,
    headers: { ...defaultOpts.headers, ...(options.headers || {}) },
  };

  const res = await fetch(url, merged);
  return res;
}
