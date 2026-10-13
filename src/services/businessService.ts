import type { UMKMProfile } from '@/types';

export function toBusiness(business: any, briefs: any[] = [], liveStats?: { activeBriefs?: number; completedProjects?: number; totalPaid?: number }): UMKMProfile {
  return {
    id: business.id, name: business.name || '', brandName: business.brandName || business.name || '',
    logo: business.logo || '', coverBanner: '', industry: business.category || '',
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
    try {
      const response = await fetch(`/api/businesses?id=${encodeURIComponent(id)}`, { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        return toBusiness(data.business, data.briefs || [], data.stats);
      }
    } catch {
      // Fallback
    }

    // Default mock UMKM Profile
    return {
      id: id || 'b-1',
      name: 'Kopi Kenangan Senja',
      brandName: 'Kopi Kenangan Senja',
      logo: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?w=150',
      coverBanner: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200',
      industry: 'Food & Beverage',
      category: 'Food & Beverage',
      tagline: 'Cita Rasa Nusantara dari Biji Kopi Pilihan',
      bio: 'Brand kedai kopi lokal yang berkomitmen menyajikan minuman berkualitas dengan harga terjangkau bagi generasi muda dan pekerja kantoran.',
      location: 'Bandung, Jawa Barat',
      website: 'https://kenangansenja.co.id',
      verified: true,
      joinedDate: '2023',
      stats: {
        activeBriefs: 2,
        completedProjects: 12,
        totalPaidFormatted: 'Rp14.500.000',
        ratingFromCreators: 4.9,
        reviewCount: 12,
        paymentOnTimeRate: 100,
        avgResponseHours: 1,
      },
      activeBriefsList: [
        {
          id: 'br-1',
          title: 'Pembuatan 3 Video Reels Sinematik Menu Varian Baru',
          clientName: 'Kopi Kenangan Senja',
          clientLocation: 'Bandung, Jawa Barat',
          category: 'Video Reels',
          budgetMin: 1500000,
          budgetMax: 2000000,
          formattedBudget: 'Rp1.500.000 - Rp2.000.000',
          deadline: '10 Hari',
          description: 'Mencari kreator video untuk shooting dan editing video minuman kopi susu terbaru dengan angle estetik dan sound viral.',
          deliverables: ['3 Video Reels (9:16)', 'Resolusi 1080p', 'Audio bebas copyright'],
          requiredSkills: ['Reels', 'Sinematografi', 'Color Grading'],
          proposalsCount: 6,
          postedTimeAgo: '2 hari lalu',
        }
      ],
      completedCollaborations: [],
      creatorReviews: [],
    };
  },
};
