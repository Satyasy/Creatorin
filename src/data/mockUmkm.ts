import { UmkmProfile } from '../types';

export const MOCK_PRIMARY_UMKM: UmkmProfile = {
  id: 'umkm-1',
  brandName: 'Kopi Kenangan Senja',
  bio: 'Brand roastery & kedai kopi lokal asal Jakarta Selatan yang fokus menghadirkan biji kopi arabika pilihan dari petani lereng Gunung Ijen dan Gayo. Kami rutin berkolaborasi dengan kreator konten, videografer, dan desainer grafis untuk kampanye produk kopi siap minum (RTD) dan promosi cafe.',
  location: 'Senopati, Jakarta Selatan',
  joinedDate: 'Member since Mei 2023',
  website: 'https://kopikenangansenja.creatorin.id',
  whatsapp: '081288990011',
  instagram: '@kopikenangan.senja',
  email: 'halo@kopikenangansenja.com',
  brandGuide: {
    brandValues: [
      'Authentic Coffee Craftsmanship',
      'Fair Trade Petani Lokal',
      'Aesthetic & Cozy Experience',
      'Ramah Lingkungan (Eco Cup)'
    ],
    targetAudience: 'Anak muda usia 19-35 tahun, penikmat kopi specialty, pekerja remote & mahasiswa kreatif perkotaan.',
    sampleShippingPolicy: 'Kami mengirimkan 1 paket sample Cold Brew (3 varian rasa) gratis ke studio/domisili kreator terpilih H+1 setelah proposal disetujui.',
    primaryColor: '#78350f',
    secondaryColor: '#fef3c7'
  },
  stats: {
    completedProjects: 18,
    activeBriefs: 2
  }
};

export const MOCK_ALL_UMKM: UmkmProfile[] = [
  MOCK_PRIMARY_UMKM,
  {
    id: 'umkm-2',
    brandName: 'Glow Botanic Indonesia',
    bio: 'Brand perawatan kulit organik berbahan dasar ekstrak botani tropis Nusantara yang teruji dermatologis dan ramah lingkungan.',
    location: 'Bandung, Jawa Barat',
    joinedDate: 'Member since Januari 2024',
    website: 'https://glowbotanic.id',
    whatsapp: '081399887766',
    instagram: '@glowbotanic.id',
    email: 'collaboration@glowbotanic.id',
    brandGuide: {
      brandValues: ['Clean Beauty', 'Cruelty Free', 'Eco Friendly Packaging', 'Organic Botanical Extract'],
      targetAudience: 'Wanita & pria 18-35 tahun pencari skincare natural dan gentle untuk barrier kulit.',
      sampleShippingPolicy: 'Paket box serum & facial wash lengkap akan kami kirimkan ke alamat kreator.',
      primaryColor: '#065f46',
      secondaryColor: '#d1fae5'
    },
    stats: {
      completedProjects: 8,
      activeBriefs: 1
    }
  },
  {
    id: 'umkm-3',
    brandName: 'Zaskia Hijab Official',
    bio: 'Label modest fashion lokal yang memproduksi pakaian muslim modern, hijab voal premium, dan gamis syari berkualitas tinggi.',
    location: 'Tangerang Selatan',
    joinedDate: 'Member since Oktober 2022',
    website: 'https://zaskiahijab.com',
    whatsapp: '081277665544',
    instagram: '@zaskiahijabofficial',
    email: 'partnership@zaskiahijab.com',
    brandGuide: {
      brandValues: ['Modest Elegance', 'Premium Fabric Quality', 'Affordable Luxury'],
      targetAudience: 'Muslimah urban usia 22-45 tahun aktif dan modis.',
      sampleShippingPolicy: '12 artikel pakaian fisik dipinjamkan / dikirimkan langsung ke studio fotografer.',
      primaryColor: '#831843',
      secondaryColor: '#fce7f3'
    },
    stats: {
      completedProjects: 22,
      activeBriefs: 1
    }
  },
  {
    id: 'umkm-4',
    brandName: 'Amanah Wealth App',
    bio: 'Platform teknologi finansial syariah terdaftar yang membantu keluarga muda dan profesional mengelola tabungan dan investasi halal.',
    location: 'Jakarta Pusat',
    joinedDate: 'Member since Maret 2024',
    website: 'https://amanahwealth.id',
    whatsapp: '081122334455',
    instagram: '@amanahwealth',
    email: 'marketing@amanahwealth.id',
    brandGuide: {
      brandValues: ['Sharia Compliance', 'Transparent', 'Financial Literacy First'],
      targetAudience: 'Generasi milenial & Gen Z melek finansial usia 21-40 tahun.',
      sampleShippingPolicy: 'Akses akun uji coba (sandbox premium) akan diberikan kepada kreator terpilih.',
      primaryColor: '#1e3a8a',
      secondaryColor: '#dbeafe'
    },
    stats: {
      completedProjects: 31,
      activeBriefs: 2
    }
  }
];

export const MOCK_UMKM_BRIEFS = [
  {
    category: 'Video UGC & Review',
    time: '5 Hari Kerja',
    title: '3x Video TikTok Review Kopi Susu Kemasan Botol (Cold Brew)',
    description: 'Kami butuh kreator video UGC ekspresif untuk mengulas varian Cold Brew Caramel & Hazelnut dengan konsep ASMR unboxing dan pouring.',
    deliverables: ['3 Video TikTok 1080p 60fps', 'Hook 3 detik pertama', 'Raw footage Drive'],
    tags: ['#TikTokUGC', '#ReelsInstagram', '#FoodVideography'],
    budget: 'Rp1.500.000'
  },
  {
    category: 'Foto Produk Katalog',
    time: '3 Hari Kerja',
    title: 'Photoshoot 6 Botol Cold Brew Kopi Kenangan Senja',
    description: 'Sesi foto produk studio clean white background dan lifestyle table setup bertema coffee morning.',
    deliverables: ['18 Foto resolusi tinggi', 'Format e-commerce 1:1', 'Banner 16:9'],
    tags: ['#FotoProduk', '#FoodStyling', '#CoffeePhotography'],
    budget: 'Rp1.000.000'
  }
];

export const MOCK_UMKM_WORKS = [
  'Skincare Barrier Restoring Serum 14-Day Honest Review',
  'Coffee Shop Reels Campaign with Cinematic B-Roll',
  'Design System Launch Video for SaaS Dashboard'
];
