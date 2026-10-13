import type { MetadataRoute } from 'next';
import { getDb } from '@/lib/db';
import { creatorProfiles, businessProfiles, projectBriefs, schools } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://creatorin.my.id').replace(/\/$/, '');
  const lastModified = new Date();

  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }> = [
    { path: '/', changeFrequency: 'daily', priority: 1.0 },
    { path: '/jelajah', changeFrequency: 'daily', priority: 0.9 },
    { path: '/jelajah/layanan', changeFrequency: 'daily', priority: 0.9 },
    { path: '/jelajah/proyek', changeFrequency: 'daily', priority: 0.9 },
    { path: '/jelajah/kreator', changeFrequency: 'daily', priority: 0.9 },
    { path: '/briefs', changeFrequency: 'daily', priority: 0.85 },
    { path: '/landing', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/terms', changeFrequency: 'monthly', priority: 0.5 },
    { path: '/privacy', changeFrequency: 'monthly', priority: 0.5 },
  ];

  const db = getDb();
  let creatorRoutes: Array<{ path: string; changeFrequency: 'weekly'; priority: number }> = [];
  let umkmRoutes: Array<{ path: string; changeFrequency: 'weekly'; priority: number }> = [];
  let briefRoutes: Array<{ path: string; changeFrequency: 'daily'; priority: number }> = [];
  let schoolRoutes: Array<{ path: string; changeFrequency: 'weekly'; priority: number }> = [];

  if (db) {
    try {
      const [creators, businesses, briefs, schoolList] = await Promise.all([
        db.select({ id: creatorProfiles.profileId, slug: creatorProfiles.slug }).from(creatorProfiles),
        db.select({ id: businessProfiles.profileId }).from(businessProfiles),
        db.select({ id: projectBriefs.id }).from(projectBriefs).where(eq(projectBriefs.status, 'open')),
        db.select({ slug: schools.slug }).from(schools),
      ]);

      creatorRoutes = creators.map(({ id, slug }) => {
        const path = slug && slug.trim() ? `/creator/${slug}` : `/creator/${id}`;
        return { path, changeFrequency: 'weekly', priority: 0.75 };
      });

      umkmRoutes = businesses.map(({ id }) => ({
        path: `/umkm/${id}`,
        changeFrequency: 'weekly',
        priority: 0.65,
      }));

      briefRoutes = briefs.map(({ id }) => ({
        path: `/briefs/${id}`,
        changeFrequency: 'daily',
        priority: 0.7,
      }));

      schoolRoutes = schoolList
        .filter(({ slug }) => Boolean(slug && slug.trim()))
        .map(({ slug }) => ({
          path: `/school/${slug}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        }));
    } catch {
      /* Static routes remain available while the database is offline. */
    }
  }

  const routes = [
    ...staticRoutes,
    ...creatorRoutes,
    ...umkmRoutes,
    ...briefRoutes,
    ...schoolRoutes,
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
