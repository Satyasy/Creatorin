/**
 * Central API Configuration & Routing Helper
 * Connects frontend (creatorin.my.id) to backend API (api.creatorin.my.id)
 */

// Strip trailing slash and trailing /api to ensure standard base domain
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') || 'https://api.creatorin.my.id'
).replace(/\/api$/, '');

/**
 * Returns the absolute URL for any API endpoint.
 * Automatically normalizes duplicate /api/ prefixes and ensures credentials compliance.
 * Example: apiUrl('/api/auth/me') -> 'https://api.creatorin.my.id/api/auth/me'
 */
export function apiUrl(path: string): string {
  if (!path) return API_BASE_URL;

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

  return `${API_BASE_URL}${cleanPath}`;
}
