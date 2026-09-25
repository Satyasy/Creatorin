import { UMKMProfile } from '../types';
import { MOCK_PROJECTS } from './mockProjects';

export const MOCK_PRIMARY_UMKM: UMKMProfile = {
  id: 'umkm-1',
  name: 'Dimas Wicaksono',
  brandName: 'Kopi Kenangan Senja',
  logo: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=240&auto=format&fit=crop&q=80',
  coverBanner: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&auto=format&fit=crop&q=80',
  industry: 'Food & Beverage',
  category: 'Coffee Roastery & Artisan Cafe',
  tagline: 'Racikan Kopi Nusantara Autentik untuk Generasi Muda Urban',
  bio: 'Brand roastery & kedai kopi lokal asal Jakarta Selatan yang fokus menghadirkan biji kopi arabika pilihan dari petani lereng Gunung Ijen dan Gayo. Kami rutin berkolaborasi dengan kreator konten, videografer, dan desainer grafis untuk kampanye produk kopi siap minum (RTD) dan promosi event cafe mingguan.',
  location: 'Senopati, Jakarta Selatan',
  website: 'https://kopikenangansenja.id',
  instagram: '@kopikenangansenja',
  marketplaceUrl: 'https://shopee.co.id/kopikenangansenja',
  whatsapp: '+6281234567890',
  verified: true,
  joinedDate: 'Bergabung Januari 2024',
  stats: {
    activeBriefs: 2,
    completedProjects: 18,
    totalPaidFormatted: 'Rp34.800.000',
    ratingFromCreators: 4.9,
    reviewCount: 22,
    paymentOnTimeRate: 100,
    avgResponseHours: 1.2
  },
  brandGuide: {
    primaryColor: '#78350f', // Warm Amber Coffee
    secondaryColor: '#fef3c7',
    targetAudience: 'Anak muda usia 19-35 tahun, penikmat kopi spesialti, pekerja remote & mahasiswa kreatif perkotaan.',
    brandValues: [
      'Authentic Coffee Craftsmanship',
      'Fair Trade Petani Lokal',
      'Aesthetic & Cozy Experience',
      'Ramah Lingkungan (Eco Cup)'
    ],
    sampleShippingPolicy: 'Produk sampel fisik (cold brew botol, roasted beans 250gr, merchandise) dikirim gratis menggunakan kurir instan/same-day ke alamat kreator yang proposalnya disetujui.'
  },
  activeBriefsList: [
    MOCK_PROJECTS[0], // Reels Cold Brew
    {
      id: 'proj-umkm-custom',
      title: 'Foto Katalog & Flatlay 8 Menu Signature Cafe untuk Menu Board & Website',
      clientName: 'Kopi Kenangan Senja',
      clientAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=120&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?w=800&auto=format&fit=crop&q=80',
      clientLocation: 'Jakarta Selatan',
      clientIndustry: 'FnB & Coffee Roastery',
      category: 'Foto Produk',
      budgetMin: 1800000,
      budgetMax: 2800000,
      formattedBudget: 'Rp1.800.000',
      deadline: '7 Hari Kerja',
      scopeDurationDays: 7,
      description: 'Dibutuhkan fotografer produk profesional untuk photoshoot on-site di outlet Senopati. Mengambil foto 8 menu minuman & pastry dengan konsep warm natural sunlight.',
      deliverables: [
        '16 foto hi-res teredit warna profesional (color-graded)',
        'Versi crop rasio 1:1, 4:5, dan 16:9',
        'Hak pakai komersial untuk menu cetak & sosmed'
      ],
      requiredSkills: ['Food Photography', 'Lighting', 'Adobe Lightroom', 'Photo Retouching'],
      proposalsCount: 4,
      postedTimeAgo: '1 hari yang lalu',
      isUrgent: false,
      isVerifiedClient: true,
      productShippingProvided: false,
      clientRating: 4.9,
      clientProjectsCount: 18
    }
  ],
  completedCollaborations: [
    {
      id: 'collab-1',
      title: 'Kampanye Video TikTok Viral "Unboxing Cold Brew Senja"',
      creatorId: 'c1',
      creatorName: 'Rian Pratama',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'Food & Beverage UGC Videographer',
      category: 'Video Reels & TikTok',
      completedDate: '12 Maret 2026',
      deliverableMedia: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&auto=format&fit=crop&q=80',
      mediaType: 'video',
      ratingGiven: 5,
      budgetFormatted: 'Rp2.200.000',
      reviewComment: 'Hasil video sangat sinematik, lighting pouring coffee-nya luar biasa menggugah selera! Viewers tembus 180K di TikTok.'
    },
    {
      id: 'collab-2',
      title: 'Redesain Label Stiker Botol Cold Brew 250ml & Kartu Ucapan Barista',
      creatorId: 'c2',
      creatorName: 'Sarah Alika',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'Brand & Packaging Specialist',
      category: 'Desain Grafis & Packaging',
      completedDate: '28 Februari 2026',
      deliverableMedia: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      ratingGiven: 5,
      budgetFormatted: 'Rp1.750.000',
      reviewComment: 'Kak Sarah sangat komunikatif dan mengerti konsep earthy minimalist yang kami inginkan. File siap cetak diserahkan rapi.'
    },
    {
      id: 'collab-3',
      title: 'Fotografi Suasana & Konten IG Carousel "Behind The Beans"',
      creatorId: 'c3',
      creatorName: 'Bima Satria',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'Commercial Photographer',
      category: 'Foto Produk & Editorial',
      completedDate: '15 Januari 2026',
      deliverableMedia: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      ratingGiven: 5,
      budgetFormatted: 'Rp2.500.000',
      reviewComment: 'Foto-foto detail roasting dan latte art-nya sangat berkarakter. Engagement Instagram langsung naik 35%!'
    }
  ],
  creatorReviews: [
    {
      id: 'rev-1',
      creatorId: 'c1',
      creatorName: 'Rian Pratama',
      creatorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'UGC Content Creator',
      rating: 5,
      date: '14 Maret 2026',
      comment: 'Kolaborasi terbaik bersama UMKM! Brief-nya super jelas, instruksi visual terarah, dan sampel produk dikirim cepat dengan kurir instan dalam kondisi dingin segar. Pembayaran via Escrow langsung dirilis begitu revisi minor selesai disetujui. Highly recommended client!',
      projectTitle: 'Produksi 3x Video Reels Instagram & TikTok Cold Brew',
      tags: ['Pembayaran Instan', 'Brief Sangat Jelas', 'Sampel Produk Cepat', 'Komunikasi Ramah']
    },
    {
      id: 'rev-2',
      creatorId: 'c2',
      creatorName: 'Sarah Alika',
      creatorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'Brand Designer',
      rating: 5,
      date: '2 Maret 2026',
      comment: 'Kopi Kenangan Senja sangat menghargai ide kreatif desainer. Feedback yang diberikan terstruktur dan to the point tanpa revisi berlarut-larut. Dana aman tersimpan di escrow jadi kerja tanpa cemas.',
      projectTitle: 'Desain Label Botol Cold Brew & Kartu Barista',
      tags: ['Feedback Jelas', 'Apresiatif', 'Escrow Aman']
    },
    {
      id: 'rev-3',
      creatorId: 'c3',
      creatorName: 'Bima Satria',
      creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      creatorRole: 'Commercial Photographer',
      rating: 4.9,
      date: '18 Januari 2026',
      comment: 'Tim yang sangat suportif saat photoshoot on-site di cafe. Barista membantu menyiapkan properti kopi dengan ramah. Sangat senang bisa bermitra jangka panjang dengan brand ini.',
      projectTitle: 'Fotografi Suasana & Editorial Carousel',
      tags: ['On-site Friendly', 'Suportif', 'Suka Bermitra Lagi']
    }
  ]
};

export const MOCK_ALL_UMKM: UMKMProfile[] = [
  MOCK_PRIMARY_UMKM,
  {
    id: 'umkm-2',
    name: 'Citra Kirana',
    brandName: 'Glow Botanic Indonesia',
    logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=240&auto=format&fit=crop&q=80',
    coverBanner: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1600&auto=format&fit=crop&q=80',
    industry: 'Beauty & Wellness',
    category: 'Skincare Organik & Herbal',
    tagline: 'Perawatan Kulit Alami Berbahan Nabati Lokal Indonesia',
    bio: 'Brand skincare lokal dengan formulasi bahan alami teruji BPOM. Fokus pada produk brightening dan skin barrier restore. Aktif mencari beauty creator untuk review jujur dan edukasi formula botanical.',
    location: 'Bandung, Jawa Barat',
    website: 'https://glowbotanic.co.id',
    instagram: '@glowbotanic.id',
    marketplaceUrl: 'https://shopee.co.id/glowbotanic',
    whatsapp: '+6281398765432',
    verified: true,
    joinedDate: 'Bergabung November 2023',
    stats: {
      activeBriefs: 1,
      completedProjects: 14,
      totalPaidFormatted: 'Rp42.500.000',
      ratingFromCreators: 5.0,
      reviewCount: 16,
      paymentOnTimeRate: 100,
      avgResponseHours: 0.8
    },
    brandGuide: {
      primaryColor: '#059669',
      secondaryColor: '#ecfdf5',
      targetAudience: 'Wanita 18-35 tahun pencinta produk natural, vegan, dan bersertifikasi aman.',
      brandValues: ['100% Vegan Botanical', 'Cruelty Free', 'BPOM Certified', 'Sustainable Packaging'],
      sampleShippingPolicy: 'Paket lengkap produk serum, toner, dan sunscreen dikirim via ekspedisi kilat setelah MoU disepakati.'
    },
    activeBriefsList: [MOCK_PROJECTS[1]],
    completedCollaborations: [],
    creatorReviews: []
  }
];
