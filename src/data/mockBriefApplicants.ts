export interface BriefApplicant {
  id: string;
  briefId: string;
  creatorId: string;
  creatorName: string;
  creatorUsername: string;
  creatorAvatar: string;
  creatorRole: string;
  careerScore: number;
  careerTier: 'Top Tier' | 'Rising Star' | 'Verified Talent';
  location: string;
  rating: number;
  completedProjects: number;
  appliedDate: string;
  bidAmount: number;
  formattedBid: string;
  durationDays: string;
  pitch: string;
  status: 'pending' | 'shortlisted' | 'accepted' | 'declined';
  portfolioSamples: {
    id: string;
    title: string;
    thumbnail: string;
    views?: string;
    likes?: string;
    type?: 'video' | 'image';
  }[];
  isPro?: boolean;
}

export const MOCK_BRIEF_APPLICANTS: BriefApplicant[] = [
  {
    id: 'app-1',
    briefId: 'proj-1',
    creatorId: 'cr-alya',
    creatorName: 'Alya Rahmadhani',
    creatorUsername: '@alyacreative',
    creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'UGC Video Specialist & Food Beverage Content Creator',
    careerScore: 98,
    careerTier: 'Top Tier',
    location: 'Jakarta Selatan',
    rating: 4.9,
    completedProjects: 42,
    appliedDate: '1 jam yang lalu',
    bidAmount: 1500000,
    formattedBid: 'Rp1.500.000',
    durationDays: '3 Hari Kerja',
    status: 'shortlisted',
    pitch: 'Halo tim Kopi Kenangan Senja! Saya sangat tertarik memproduksi 3 video Reels & TikTok untuk menu Cold Brew Caramel ini. Saya terbiasa menyusun visual hook ASMR pouring yang memikat pada 3 detik pertama dengan pencahayaan studio aesthetic dan voiceover yang natural. Rata-rata video kolaborasi saya ditonton 45k-120k views di TikTok.',
    portfolioSamples: [
      {
        id: 'samp-1',
        title: 'ASMR Iced Coffee Pouring & Aesthetic Studio Shot',
        thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        views: '84.2K',
        likes: '6.4K',
        type: 'video'
      },
      {
        id: 'samp-2',
        title: 'Honest Taste Test & Daily Coffee Routine',
        thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
        views: '112K',
        likes: '9.8K',
        type: 'video'
      }
    ],
    isPro: true
  },
  {
    id: 'app-2',
    briefId: 'proj-1',
    creatorId: 'cr-dimas',
    creatorName: 'Dimas Pratama',
    creatorUsername: '@dimasvideoworks',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Cinematic B-Roll & Commercial Videographer',
    careerScore: 96,
    careerTier: 'Verified Talent',
    location: 'Bandung',
    rating: 4.85,
    completedProjects: 29,
    appliedDate: '3 jam yang lalu',
    bidAmount: 1450000,
    formattedBid: 'Rp1.450.000',
    durationDays: '4 Hari Kerja',
    status: 'pending',
    pitch: 'Siap menghadirkan 3 konten video berkualitas kamera Sony Cinema Line dengan lensa makro untuk menonjolkan tekstur swirl caramel dan es batu. Sudah termasuk color grading coffee tone khas kafe modern, royalty-free audio trending, dan 2x opsi revisi.',
    portfolioSamples: [
      {
        id: 'samp-3',
        title: 'Cinematic Macro Coffee Commercial',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
        views: '64.5K',
        likes: '5.1K',
        type: 'video'
      },
      {
        id: 'samp-4',
        title: 'Bottle Packaging Reveal & Ambient Beats',
        thumbnail: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80',
        views: '51.3K',
        likes: '3.9K',
        type: 'video'
      }
    ],
    isPro: false
  },
  {
    id: 'app-3',
    briefId: 'proj-1',
    creatorId: 'cr-nabila',
    creatorName: 'Nabila Salsabila',
    creatorUsername: '@nabilacoffeelife',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Lifestyle Creator & Work From Cafe Influencer',
    careerScore: 95,
    careerTier: 'Rising Star',
    location: 'Jakarta Barat',
    rating: 4.95,
    completedProjects: 18,
    appliedDate: '5 jam yang lalu',
    bidAmount: 1500000,
    formattedBid: 'Rp1.500.000',
    durationDays: '3 Hari Kerja',
    status: 'pending',
    pitch: 'Konsep yang saya tawarkan berfokus pada "Relatable Daily WFH Hustle": bagaimana cold brew caramel ini jadi booster mood saat deadline kerjaan. Format video sangat engaging, ekspresif, dan disisipi stiker promo untuk memicu direct click ke link pembelian.',
    portfolioSamples: [
      {
        id: 'samp-5',
        title: 'WFH Afternoon Coffee Break Routine',
        thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
        views: '93.1K',
        likes: '7.8K',
        type: 'video'
      }
    ],
    isPro: false
  },
  {
    id: 'app-4',
    briefId: 'proj-1',
    creatorId: 'cr-1',
    creatorName: 'Sobakhul Munir Siroj',
    creatorUsername: '@munirsr',
    creatorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=240&auto=format&fit=crop&q=80',
    creatorRole: 'Visual Director & Motion Designer',
    careerScore: 98,
    careerTier: 'Top Tier',
    location: 'Jakarta Selatan',
    rating: 4.95,
    completedProjects: 144,
    appliedDate: '7 jam yang lalu',
    bidAmount: 1600000,
    formattedBid: 'Rp1.600.000',
    durationDays: '5 Hari Kerja',
    status: 'pending',
    pitch: 'Saya menawarkan produksi Reels yang dilengkapi kinetic typography animasi modern untuk teks promo & pricing, sehingga visual tampil sekelas iklan brand global dengan retensi penonton yang tinggi.',
    portfolioSamples: [
      {
        id: 'samp-6',
        title: 'Kinetic Motion Typography Campaign',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        views: '124K',
        likes: '14.2K',
        type: 'video'
      }
    ],
    isPro: true
  }
];
