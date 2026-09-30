/**
 * api.js — Centralised base URL helper
 *
 * In LOCAL dev:  VITE_API_URL is undefined → uses '' (empty string)
 *                Vite proxy handles /api/* → http://localhost:5000
 *
 * In PRODUCTION: VITE_API_URL = "https://kazi-1-3bl6.onrender.com"
 *                fetch calls become absolute URLs pointing at Render
 */
const RENDER_API_URL = 'https://kazi-1-3bl6.onrender.com';

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const rawApiBase = configuredApiUrl || (import.meta.env.PROD ? RENDER_API_URL : '');

// Avoid malformed URLs when Vercel's variable is entered with a trailing slash.
export const API_BASE = rawApiBase.replace(/\/+$/, '');

/**
 * Convenience wrapper — usage:
 *   import { apiFetch } from '../api';
 */
export function apiFetch(path, options = {}) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return fetch(`${API_BASE}${normalizedPath}`, options);
}
