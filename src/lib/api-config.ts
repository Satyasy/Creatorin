/**
 * Central API Configuration & Routing Helper
 * Connects frontend (creatorin.my.id) to backend API (api.creatorin.my.id)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.creatorin.my.id';

/**
 * Returns the absolute URL for any API endpoint.
 * If the path already has http/https, it is returned as is.
 * Example: apiUrl('/api/auth/me') -> 'https://api.creatorin.my.id/api/auth/me'
 */
export function apiUrl(path: string): string {
  if (!path) return API_BASE_URL;
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
