import { Creator, CreatorService, FeedProject } from '@/types';
import { MOCK_CREATORS } from '@/data/mockCreators';
import { MOCK_FEED_PROJECTS } from '@/data/mockFeedProjects';
import { apiUrl } from '@/lib/api-config';

function transformDbCreatorToFrontend(c: any): Creator {
  return {
    id: c.id,
    name: c.fullName || 'Kreator Creatorin',
    username: c.slug || c.fullName?.toLowerCase().replace(/\s+/g, '-'),
    avatar: c.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    category: c.skills?.some((s: string) => /video|tiktok|reels/i.test(s)) ? 'Video' : 'Image',
    roleTitle: c.headline || 'Creative Talent',
    bio: c.bio || 'Kreator muda berbakat yang siap berkolaborasi untuk proyek kreatif bisnis Anda.',
    location: c.location || 'Indonesia',
    startingRate: 150000,
    formattedRate: c.startingPrice || 'Mulai Rp150.000',
    careerScore: {
      overall: c.careerScore || 92,
      deadlineAccuracy: c.onTimeRate || 98,
      revisionRate: 1.1,
      completionRate: 100,
      clientRating: parseFloat(String(c.rating || '5.0')),
      completedProjects: c.completedProjectsCount || 0,
      tier: (c.careerScore || 92) >= 90 ? 'Top Tier' : 'Verified Talent',
    },
    rating: parseFloat(String(c.rating || '5.0')),
    reviewCount: c.reviewsCount || 0,
    skills: Array.isArray(c.skills) ? c.skills : ['Content Creation', 'Digital Design'],
    joinedDate: '2026',
    verified: true,
    proBadge: Boolean(c.isPro),
    isPromoted: Boolean(c.isPromoted),
    responseTime: c.responseTime || '< 1 Jam',
    handle: `@${c.slug || 'creator'}`,
  };
}

export const creatorService = {
  async getCreators(params?: { category?: string; search?: string; location?: string }): Promise<Creator[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.category) searchParams.set('category', params.category);
      if (params?.search) searchParams.set('search', params.search);
      if (params?.location) searchParams.set('location', params.location);

      const res = await fetch(apiUrl(`/api/creators?${searchParams.toString()}`), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('API failed');

      const data = await res.json();
      if (Array.isArray(data.creators) && data.creators.length > 0) {
        return data.creators.map(transformDbCreatorToFrontend);
      }
    } catch {
      // Graceful fallback to rich mock data
    }
    return MOCK_CREATORS;
  },

  async getCreatorDetail(idOrSlug: string): Promise<Creator | null> {
    try {
      const res = await fetch(apiUrl(`/api/creators/${encodeURIComponent(idOrSlug)}`), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.creator) {
          const transformed = transformDbCreatorToFrontend(data.creator);
          if (Array.isArray(data.services) && data.services.length > 0) {
            transformed.services = data.services.map((s: any): CreatorService => ({
              id: s.id,
              title: s.title,
              price: s.priceNumeric || 250000,
              formattedPrice: s.price || 'Rp250.000',
              deliveryDays: s.estimatedDays || '2 Hari Kerja',
              description: s.description,
              coverImage: s.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
              tag: s.category,
            }));
          }
          return transformed;
        }
      }
    } catch {
      // Fallback
    }

    const foundMock = MOCK_CREATORS.find((c) => c.id === idOrSlug || c.username === idOrSlug);
    return foundMock || MOCK_CREATORS[0] || null;
  },

  async getFeedProjects(): Promise<FeedProject[]> {
    try {
      const res = await fetch(apiUrl('/api/projects'), {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.projects) && data.projects.length > 0) {
          return data.projects.map((p: any, idx: number): FeedProject => ({
            id: p.id,
            title: p.title,
            description: p.description || '',
            coverImage: p.mediaUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
            mediaType: p.mediaType === 'video' ? 'video' : 'image',
            creator: MOCK_CREATORS[idx % MOCK_CREATORS.length],
            category: 'Karya Kreatif',
            tags: ['Featured', 'Verified'],
            likesCount: 120 + idx * 15,
            commentsCount: 14 + idx * 2,
            viewsCount: `${p.viewsCount || '1.2k'}`,
            sharesCount: 18 + idx,
          }));
        }
      }
    } catch {
      // Fallback
    }
    return MOCK_FEED_PROJECTS;
  },
};
