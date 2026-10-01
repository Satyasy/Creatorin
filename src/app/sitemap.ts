import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.id';
  const lastModified = new Date();

  const routes = [
    '',
    '/explore',
    '/explore/projects',
    '/explore/services',
    '/briefs',
    '/landing',
    '/chat',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : 0.8,
  }));
}
