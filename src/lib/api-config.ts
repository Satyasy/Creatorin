/**
 * Central API configuration helper.
 * Automatically resolves the base URL for frontend requests when deployed on CDN/Cloudflare Pages.
 */
export function apiUrl(path: string): string {
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
