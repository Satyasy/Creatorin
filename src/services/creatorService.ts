import type { Creator, CreatorService, FeedProject } from '@/types';

export function toCreator(c: any): Creator {
  const score = Number(c.careerScore || 0);
  const rating = Number(c.rating || 0);
  return {
    id: c.id, name: c.fullName || '', username: c.slug || '', avatar: c.avatarUrl || '',
    category: c.skills?.some((skill: string) => /video|tiktok|reels/i.test(skill)) ? 'Video' : 'Image',
    roleTitle: c.headline || '', bio: c.bio || '', location: c.location || '',
    startingRate: Number(String(c.startingPrice || '').replace(/\D/g, '')) || 0,
    formattedRate: c.startingPrice || '',
    careerScore: {
      overall: score, deadlineAccuracy: Number(c.onTimeRate || 0), revisionRate: 0,
      completionRate: 0, clientRating: rating,
      completedProjects: Number(c.completedProjectsCount || 0),
      tier: score >= 90 ? 'Top Tier' : score > 0 ? 'Rising Star' : 'Belum Dinilai',
    },
    rating, reviewCount: Number(c.reviewsCount || 0),
    skills: Array.isArray(c.skills) ? c.skills : [],
    joinedDate: c.createdAt ? new Date(c.createdAt).getFullYear().toString() : '',
    verified: false, proBadge: Boolean(c.isPro), isPromoted: Boolean(c.isPromoted),
    responseTime: c.responseTime || '', handle: `@${c.slug || c.id}`,
    followersCount: Number(c.followersCount || 0),
  };
}

export function toFeedProject(p: any, creator?: Creator): FeedProject {
  const owner = creator || toCreator({ id: p.creatorId, fullName: p.creatorName, avatarUrl: p.creatorAvatar, slug: p.creatorHandle?.replace(/^@/, '') });
  return {
    id: p.id, title: p.title, description: p.description || '',
    coverImage: p.mediaUrl || '', mediaUrl: p.mediaUrl || '',
    videoUrl: p.mediaType === 'video' ? p.mediaUrl : undefined,
    mediaType: p.mediaType === 'video' ? 'video' : 'image', creatorId: p.creatorId,
    creator: owner, category: p.category || 'Karya Kreatif', platform: 'direct',
    tags: p.description?.match(/#[\w]+/g)?.map((tag: string) => tag.slice(1)) || [],
    likesCount: 0, commentsCount: 0, viewsCount: p.viewsCount || '0',
    sharesCount: 0, createdAt: p.createdAt,
  };
}

export const creatorService = {
  async getCreators(params?: { category?: string; search?: string; location?: string }): Promise<Creator[]> {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.location) query.set('location', params.location);
    const response = await fetch(`/api/creators?${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal memuat kreator.');
    const data = await response.json();
    return (data.creators || []).map(toCreator);
  },
  async getCreatorDetail(id: string): Promise<Creator | null> {
    try {
      const response = await fetch(`/api/creators/${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        const creator = toCreator(data.creator);
        creator.services = (data.services || []).map((service: any): CreatorService => ({
          id: service.id, title: service.title, price: service.priceNumeric || 0,
          formattedPrice: service.price || '', deliveryDays: service.estimatedDays || '',
          description: service.description || '', coverImage: service.imageUrl || '', tag: service.category || '',
        }));
        creator.reviewsList = (data.reviews || []).map((review: any) => ({
          id: review.id,
          clientName: review.reviewerName,
          clientCompany: review.reviewerRole || '',
          rating: Number(review.rating || 0),
          comment: review.comment || '',
          date: review.completedDate || '',
          projectTitle: review.projectTitle || '',
        }));
        return creator;
      }
    } catch {
      // Fallback
    }

    const { DEFAULT_CREATORS } = await import('@/data/defaultCreators');
    const matched = DEFAULT_CREATORS.find(
      c => c.id === id || c.username === id || c.handle === id || c.handle === `@${id}`
    );
    return matched || DEFAULT_CREATORS[0] || null;
  },
  async getFeedProjects(creatorId?: string): Promise<FeedProject[]> {
    const query = creatorId ? `?creatorId=${encodeURIComponent(creatorId)}` : '';
    const response = await fetch(`/api/projects${query}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal memuat karya.');
    const data = await response.json();
    return (data.projects || []).map((project: any) => toFeedProject(project));
  },
};
