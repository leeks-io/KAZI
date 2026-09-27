/**
 * api.js — Centralised base URL helper
 *
 * In LOCAL dev:  VITE_API_URL is undefined → uses '' (empty string)
 *                Vite proxy handles /api/* → http://localhost:5000
 *
 * In PRODUCTION: VITE_API_URL = "https://kazi-1-3bl6.onrender.com"
 *                fetch calls become absolute URLs pointing at Render
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';

/**
 * Convenience wrapper — usage:
 *   import { apiFetch } from '../api';
 *   const res = await apiFetch('/api/jobs');
 */
export function apiFetch(path, options = {}) {
  return fetch(`${API_BASE}${path}`, options);
}
