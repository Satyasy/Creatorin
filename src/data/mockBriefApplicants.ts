import { BriefApplicant } from '../types';
export type { BriefApplicant } from '../types';

export const MOCK_BRIEF_APPLICANTS: BriefApplicant[] = [
  {
    id: 'app-1',
    briefId: 'proj-1',
    creatorId: 'cr-1',
    creatorName: 'Maya Angelina',
    creatorUsername: '@mayaangelina.ugc',
    creatorAvatar: '/creatorin/maya-angelina.png',
    creatorRole: 'Beauty & Lifestyle Content Creator',
    careerScore: 95,
    careerTier: 'Pro Creator',
    location: 'Jakarta Barat',
    rating: 4.9,
    completedProjects: 142,
    appliedDate: '10 menit yang lalu',
    bidAmount: 1800000,
    formattedBid: 'Rp1.800.000',
    durationDays: '3 Hari Kerja',
    pitch: 'Halo tim Kopi Kenangan Senja! Saya sangat tertarik untuk kolaborasi campaign Cold Brew ini. Konsep visual hook pouring ASMR dan review ekspresif sudah sering saya eksekusi untuk brand minuman dan selalu tembus FYP TikTok.',
    status: 'pending',
    isPro: true,
    portfolioSamples: [
      {
        id: 'samp-1',
        title: 'Review Minuman Kopi Cold Brew Aesthetic ASMR',
        thumbnail: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&auto=format&fit=crop&q=80',
        views: '210.4K',
        likes: '18.2K',
        type: 'video'
      },
      {
        id: 'samp-2',
        title: 'UGC Unboxing & Pouring Shot 60fps',
        thumbnail: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=600&auto=format&fit=crop&q=80',
        views: '94.8K',
        likes: '7.6K',
        type: 'video'
      }
    ]
  },
  {
    id: 'app-2',
    briefId: 'proj-1',
    creatorId: 'cr-3',
    creatorName: 'Sobakhul Munir Siroj',
    creatorUsername: '@munirs.design',
    creatorAvatar: '/creatorin/avatar.png',
    creatorRole: 'UGC Content & Video Specialist',
    careerScore: 93,
    careerTier: 'Top Talent',
    location: 'Jakarta Selatan',
    rating: 4.9,
    completedProjects: 64,
    appliedDate: '35 menit yang lalu',
    bidAmount: 1500000,
    formattedBid: 'Rp1.500.000',
    durationDays: '2 Hari Kerja',
    pitch: 'Sudah berpengalaman menggarap 20+ video UGC F&B dan coffee shop lokal. Siap kerjakan 3 video dengan storyline hook 3 detik pertama, pencahayaan studio memukau, dan color grading estetik.',
    status: 'pending',
    isPro: true,
    portfolioSamples: [
      {
        id: 'samp-3',
        title: 'Cinematic B-Roll Cafe & RTD Bottle Showcase',
        thumbnail: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80',
        views: '185.4K',
        likes: '14.1K',
        type: 'video'
      }
    ]
  },
  {
    id: 'app-3',
    briefId: 'proj-1',
    creatorId: 'cr-4',
    creatorName: 'Sarah Kurniawan',
    creatorUsername: '@sarah.kurnia',
    creatorAvatar: '/creatorin/sarah-kurniawan.png',
    creatorRole: 'Aesthetic Video & UGC Creator',
    careerScore: 91,
    careerTier: 'Rising Star',
    location: 'Surabaya, Jawa Timur',
    rating: 4.8,
    completedProjects: 73,
    appliedDate: '1 jam yang lalu',
    bidAmount: 1650000,
    formattedBid: 'Rp1.650.000',
    durationDays: '4 Hari Kerja',
    pitch: 'Saya pecinta artisan coffee dan terbiasa memproduksi reels berkonsep cozy day in my life yang natural tanpa terkesan hard selling. Siap kirim ide script sebelum shooting dimulai.',
    status: 'shortlisted',
    isPro: false,
    portfolioSamples: [
      {
        id: 'samp-4',
        title: 'Morning Coffee Routine Aesthetic Reels',
        thumbnail: 'https://images.unsplash.com/photo-1498804103079-a6351b050096?w=600&auto=format&fit=crop&q=80',
        views: '124.0K',
        likes: '11.5K',
        type: 'video'
      }
    ]
  },
  {
    id: 'app-4',
    briefId: 'proj-1',
    creatorId: 'cr-6',
    creatorName: 'Amanda Larasati',
    creatorUsername: '@amanda.larasati',
    creatorAvatar: '/creatorin/amanda-larasati.png',
    creatorRole: 'Food Stylist & Creative Videographer',
    careerScore: 89,
    careerTier: 'Verified Creator',
    location: 'Denpasar, Bali',
    rating: 4.7,
    completedProjects: 48,
    appliedDate: '2 jam yang lalu',
    bidAmount: 1400000,
    formattedBid: 'Rp1.400.000',
    durationDays: '3 Hari Kerja',
    pitch: 'Hai Kopi Kenangan Senja! Setup kamera 4K dan studio lighting lengkap. Siap membuat konten review jujur dengan visual appetizing dan editing dinamis.',
    status: 'pending',
    isPro: false,
    portfolioSamples: [
      {
        id: 'samp-5',
        title: 'Pouring Coffee Outdoor Sunlight Mood',
        thumbnail: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=600&auto=format&fit=crop&q=80',
        views: '67.2K',
        likes: '5.8K',
        type: 'video'
      }
    ]
  }
];
