/**
 * Resolves FoodGuard API paths against the deployed backend.
 *
 * The frontend no longer serves its own `/api/*` routes — client-side calls
 * target the shared Hono backend via `NEXT_PUBLIC_API_URL`. When the variable
 * is unset (local dev / tests) the path is returned relative to the origin,
 * preserving the previous same-origin behaviour.
 */
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");

export function apiUrl(path: string): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  return API_BASE ? `${API_BASE}${clean}` : clean;
}