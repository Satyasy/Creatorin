/**
 * Central API Configuration & Routing Helper
 * Connects frontend (creatorin.my.id) to backend API (api.creatorin.my.id)
 */

const isLocalhost = 
  typeof window !== 'undefined'
    ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    : process.env.NODE_ENV === 'development';

// In development / localhost, use relative URLs (empty string) so local Next.js API routes handle requests.
// In production, route to the backend domain unless overridden by NEXT_PUBLIC_API_URL.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ||
  (isLocalhost ? '' : 'https://api.creatorin.my.id')
).replace(/\/api$/, '');

/**
 * Returns the absolute or relative URL for any API endpoint.
 * Automatically normalizes duplicate /api/ prefixes and ensures credentials compliance.
 * Example: apiUrl('/api/auth/me') -> 'https://api.creatorin.my.id/api/auth/me' (prod) or '/api/auth/me' (local)
 */
export function apiUrl(path: string): string {
  if (!path) return API_BASE_URL || '/';

  // If already absolute URL, clean any accidental /api/api/ duplication
  if (/^https?:\/\//i.test(path)) {
    return path.replace(/\/api\/api\//g, '/api/');
  }

  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  // Ensure path starts with /api
  if (!cleanPath.startsWith('/api/')) {
    cleanPath = `/api${cleanPath}`;
  }
  // Sanitize any double /api/api/
  cleanPath = cleanPath.replace(/^\/api\/api\//, '/api/');

  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
}
