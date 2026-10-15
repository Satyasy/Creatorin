import type { UMKMProfile } from '@/types';

export function toBusiness(business: any, briefs: any[] = [], liveStats?: { activeBriefs?: number; completedProjects?: number; totalPaid?: number }): UMKMProfile {
  return {
    id: business.id, name: business.name || '', brandName: business.brandName || business.name || '',
    logo: business.logo || '', coverBanner: business.coverBanner || business.coverUrl || '', industry: business.category || '',
    category: business.category || '', tagline: '', bio: business.bio || '',
    location: business.location || '', website: business.website || '', verified: false,
    joinedDate: business.createdAt ? new Date(business.createdAt).getFullYear().toString() : '',
    stats: {
      activeBriefs: liveStats?.activeBriefs ?? briefs.filter((brief) => brief.status === 'open').length,
      completedProjects: liveStats?.completedProjects ?? 0,
      totalPaidFormatted: new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(liveStats?.totalPaid ?? 0),
      ratingFromCreators: 0, reviewCount: 0, paymentOnTimeRate: 0, avgResponseHours: 0,
    },
    activeBriefsList: briefs.map((brief) => ({
      id: brief.id, title: brief.title, clientName: business.brandName || business.name || '',
      clientLocation: business.location || '', category: brief.category || '',
      budgetMin: Number(String(brief.budget || '').replace(/\D/g, '')) || 0,
      budgetMax: Number(String(brief.budget || '').replace(/\D/g, '')) || 0,
      formattedBudget: brief.budget || '', deadline: brief.deadline || '',
      description: brief.description || '', deliverables: brief.expectedOutput ? [brief.expectedOutput] : [],
      requiredSkills: [], proposalsCount: 0, postedTimeAgo: '',
    })),
    completedCollaborations: [], creatorReviews: [],
  };
}

export const businessService = {
  async getBusinesses(): Promise<UMKMProfile[]> {
    const response = await fetch('/api/businesses', { cache: 'no-store' });
    if (!response.ok) throw new Error('Gagal memuat daftar UMKM.');
    const data = await response.json();
    return (data.businesses || []).map((business: any) => toBusiness(business));
  },
  async getBusiness(id: string): Promise<UMKMProfile | null> {
    if (!id) return null;
    try {
      const response = await fetch(`/api/businesses?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        return toBusiness(data.business, data.briefs || [], data.stats);
      }
    } catch (err) {
      console.warn('Failed to fetch business profile:', err);
    }
    return null;
  },
};
