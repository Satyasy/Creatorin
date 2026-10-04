import type { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';
import { creatorProfiles, businessProfiles, projectBriefs } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.id').replace(/\/$/, '');
  const lastModified = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/explore', changeFrequency: 'daily', priority: 0.9 },
    { path: '/explore/projects', changeFrequency: 'daily', priority: 0.9 },
    { path: '/explore/services', changeFrequency: 'daily', priority: 0.9 },
    { path: '/briefs', changeFrequency: 'daily', priority: 0.85 },
    { path: '/landing', changeFrequency: 'weekly', priority: 0.8 },
  ];

  const db = getDb();
  let creatorRoutes: Array<{ path: string; changeFrequency: 'weekly'; priority: number }> = [];
  let umkmRoutes: Array<{ path: string; changeFrequency: 'weekly'; priority: number }> = [];
  let briefRoutes: Array<{ path: string; changeFrequency: 'daily'; priority: number }> = [];
  if (db) {
    try {
      const [creators, businesses, briefs] = await Promise.all([
        db.select({ id: creatorProfiles.profileId }).from(creatorProfiles),
        db.select({ id: businessProfiles.profileId }).from(businessProfiles),
        db.select({ id: projectBriefs.id }).from(projectBriefs).where(eq(projectBriefs.status, 'open')),
      ]);
      creatorRoutes = creators.map(({ id }) => ({ path: `/creator/${id}`, changeFrequency: 'weekly', priority: 0.7 }));
      umkmRoutes = businesses.map(({ id }) => ({ path: `/umkm/${id}`, changeFrequency: 'weekly', priority: 0.65 }));
      briefRoutes = briefs.map(({ id }) => ({ path: `/briefs/${id}`, changeFrequency: 'daily', priority: 0.7 }));
    } catch { /* Static routes remain available while the database is offline. */ }
  }

  const routes = [
    ...staticRoutes,
    ...creatorRoutes,
    ...umkmRoutes,
    ...briefRoutes,
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
