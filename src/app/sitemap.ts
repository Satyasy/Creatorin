import type { MetadataRoute } from 'next';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { MOCK_ALL_UMKM } from '@/data/mockUmkm';
import { MOCK_PROJECTS } from '@/data/mockProjects';

export default function sitemap(): MetadataRoute.Sitemap {
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

  const creatorRoutes = MOCK_CREATORS.map((creator) => ({
    path: `/creator/${encodeURIComponent(creator.username || creator.id)}`,
    changeFrequency: 'weekly' as const,
    priority: creator.isPromoted ? 0.8 : 0.7,
  }));

  const umkmRoutes = MOCK_ALL_UMKM.map((umkm) => ({
    path: `/umkm/${encodeURIComponent(umkm.id)}`,
    changeFrequency: 'weekly' as const,
    priority: umkm.verified ? 0.75 : 0.65,
  }));

  const briefRoutes = MOCK_PROJECTS.map((brief) => ({
    path: `/briefs/${encodeURIComponent(brief.id)}`,
    changeFrequency: 'daily' as const,
    priority: brief.isUrgent ? 0.75 : 0.7,
  }));

  const schoolRoutes = [
    {
      path: '/school/smk-kreatif-indonesia',
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    },
  ];

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
