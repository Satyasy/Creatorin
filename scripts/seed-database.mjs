import postgres from 'postgres';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Muat konfigurasi environment
const envFiles = ['.env.local', '.env.production', '.env'];
for (const file of envFiles) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath });
    break;
  }
}

const connectionString = 
  process.env.DATABASE_URL || 
  'postgresql://postgres.lhmmutetdnnbehsjdxwq:CreatorinPostgres2026!Secure@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require';

console.log('🌱 Menghubungkan ke PostgreSQL untuk eksekusi Database Seeder...');
const isLocal = connectionString.includes('127.0.0.1') || connectionString.includes('localhost');
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString('hex')}`;
}

const defaultPasswordHash = hashPassword('Creatorin2026');

// ==============================================================================
// 1. DATA MASTER AKUN & PROFIL
// ==============================================================================
const ACCOUNTS = [
  // Core Accounts
  {
    email: 'admin@creatorin.my.id',
    fullName: 'Admin CreatorIn',
    role: 'admin',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300&auto=format&fit=crop&q=80',
    location: 'Jakarta Pusat',
    phone: '08110000001',
    creatorProfile: {
      slug: 'admin-creatorin',
      headline: 'Platform Administrator & Community Lead',
      bio: 'Pusat operasional dan tata kelola ekosistem kemitraan industri kreatif CreatorIn.',
      careerScore: 99,
      rating: 5.0,
      startingPrice: 'Rp 2.000.000',
      skills: ['Community Management', 'Industry Partnership', 'Platform Governance'],
      isPro: true
    }
  },
  {
    email: 'creator@creatorin.my.id',
    fullName: 'Creator Pro CreatorIn',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Jakarta Selatan',
    phone: '08120000001',
    creatorProfile: {
      slug: 'creator-pro',
      headline: 'Lead Motion Designer & Creative Director',
      bio: 'Spesialis video komersial, motion branding, dan identitas visual konversi tinggi untuk brand modern.',
      careerScore: 98,
      rating: 4.9,
      startingPrice: 'Rp 500.000',
      skills: ['Motion Graphic', 'Video TikTok', 'Reels Instagram', 'Branding'],
      isPro: true
    }
  },
  {
    email: 'umkm@creatorin.my.id',
    fullName: 'Kopi Lereng Nusantara',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    location: 'Malang, Jawa Timur',
    phone: '08130000001',
    businessProfile: {
      companyName: 'Kopi Lereng Nusantara UMKM',
      category: 'Food & Beverage',
      description: 'Produsen biji kopi arabika dan robusta specialty lereng pegunungan Jawa Timur siap ekspor dan distribusi nasional.',
      website: 'https://kopilereng.id'
    }
  },
  {
    email: 'school@creatorin.my.id',
    fullName: 'SMK Negeri 1 Surabaya',
    role: 'school',
    avatarUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya, Jawa Timur',
    phone: '08140000001',
    schoolInfo: {
      name: 'SMK Negeri 1 Surabaya',
      slug: 'smk-negeri-1-surabaya',
      tagline: 'Pusat Keunggulan Vokasi Desain Komunikasi Visual & Animasi',
      description: 'Institusi pendidikan kejuruan terakreditasi A dengan teaching factory desain kreatif dan kemitraan industri nasional.',
      city: 'Surabaya',
      address: 'Jl. SMEA No. 4, Wonokromo, Surabaya',
      website: 'https://smkn1-surabaya.sch.id',
      picName: 'Dra. Endang Wahyuni, M.Pd.',
      picContact: '081234567890',
      isVerified: true
    }
  },

  // Additional High-Quality Creators
  {
    email: 'qaesyaar.aqeel@creatorin.my.id',
    fullName: 'Qaesyaar Aqeel',
    role: 'creator',
    avatarUrl: '/creatorin/avatar.png',
    location: 'Bandung, Jawa Barat',
    phone: '08129990001',
    creatorProfile: {
      slug: 'qaesyaar-aqeel',
      headline: 'Brand Identity & Visual Designer',
      bio: 'Membantu UMKM dan brand membangun identitas visual profesional, packaging, serta feed media sosial berkonversi tinggi.',
      careerScore: 95,
      rating: 5.0,
      startingPrice: 'Rp 200.000',
      skills: ['Brand Identity', 'Product Photography', 'Packaging', 'Social Media Feed', 'UI Mockups', 'Motion Graphics', 'Banner Promo'],
      isPro: true
    }
  },
  {
    email: 'sarah.amelia@creatorin.my.id',
    fullName: 'Sarah Amelia',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    location: 'Jakarta Selatan',
    phone: '08150000002',
    creatorProfile: {
      slug: 'sarah-amelia',
      headline: 'UGC Specialist & Video Creator F&B',
      bio: 'Membuat konten video UGC autentik yang terbukti menaikkan konversi penjualan di TikTok Shop & Instagram.',
      careerScore: 96,
      rating: 4.9,
      startingPrice: 'Rp 250.000',
      skills: ['Video TikTok', 'Reels Instagram', 'UGC Content', 'Food Styling'],
      isPro: true
    }
  },
  {
    email: 'kevin.sanjaya@creatorin.my.id',
    fullName: 'Kevin Sanjaya',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Bandung',
    phone: '08160000003',
    creatorProfile: {
      slug: 'kevin-sanjaya',
      headline: 'Motion Graphic Artist & Commercial Animator',
      bio: 'Membantu produk lokal bertransformasi menjadi visual modern berkelas melalui video animasi 2D/3D dinamis.',
      careerScore: 98,
      rating: 5.0,
      startingPrice: 'Rp 400.000',
      skills: ['Motion Graphic', 'Video Iklan', 'Branding', 'Visual Effects'],
      isPro: true
    }
  },
  {
    email: 'anisa.rahma@creatorin.my.id',
    fullName: 'Anisa Rahma',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    location: 'Yogyakarta',
    phone: '08170000004',
    creatorProfile: {
      slug: 'anisa-rahma',
      headline: 'Packaging Designer & Brand Strategist',
      bio: 'Desainer grafis berfokus pada kemasan ramah lingkungan, etiket produk, dan visual identity yang estetik.',
      careerScore: 94,
      rating: 4.9,
      startingPrice: 'Rp 200.000',
      skills: ['Feed Instagram', 'Poster', 'Logo & Branding', 'Packaging'],
      isPro: true
    }
  },
  {
    email: 'budi.pratama@creatorin.my.id',
    fullName: 'Budi Pratama',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08180000005',
    creatorProfile: {
      slug: 'budi-pratama',
      headline: 'Commercial Photographer & Food Stylist',
      bio: 'Fotografi katalog produk e-commerce dan foto editorial studio untuk menu restoran dan produk ritel.',
      careerScore: 93,
      rating: 4.8,
      startingPrice: 'Rp 350.000',
      skills: ['Foto Produk', 'Video Sinematik', 'Komersial', 'Color Grading'],
      isPro: true
    }
  },
  {
    email: 'dimas.anggara@creatorin.my.id',
    fullName: 'Dimas Anggara',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    location: 'Malang',
    phone: '08190000006',
    creatorProfile: {
      slug: 'dimas-anggara',
      headline: '3D Artist & Realistic Product Mockup Specialist',
      bio: 'Membuat visualisasi 3D photorealistic untuk mockup botol, pouch, karton box, dan presentasi produk.',
      careerScore: 95,
      rating: 4.9,
      startingPrice: 'Rp 300.000',
      skills: ['3D Modeling', 'Rendering', 'Desain Kemasan', 'Pouch Mockup'],
      isPro: true
    }
  },
  {
    email: 'rahmat.hidayat@creatorin.my.id',
    fullName: 'Rahmat Hidayat (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08210000007',
    creatorProfile: {
      slug: 'rahmat-hidayat',
      headline: 'Talenta Vokasi DKV - Medalis LKS Desain Grafis',
      bio: 'Siswa berprestasi SMK Negeri 1 Surabaya dengan spesialisasi ilustrasi digital, layout brosur, dan konten media sosial.',
      careerScore: 92,
      rating: 4.8,
      startingPrice: 'Rp 150.000',
      skills: ['Brosur', 'Banner', 'Vector Art', 'Feed Instagram'],
      schoolName: 'SMK Negeri 1 Surabaya',
      schoolStatus: 'approved',
      major: 'Desain Komunikasi Visual',
      classGrade: 'XII DKV 1',
      isPro: false
    }
  },
  {
    email: 'alya.putri@creatorin.my.id',
    fullName: 'Alya Putri (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08210000010',
    creatorProfile: {
      slug: 'alya-putri',
      headline: 'Siswa Vokasi Animasi 2D & Motion Graphic',
      bio: 'Siswa SMK Negeri 1 Surabaya jurusan Animasi. Sedang mengajukan verifikasi ke pihak sekolah untuk program teaching factory.',
      careerScore: 84,
      rating: 0,
      startingPrice: 'Rp 100.000',
      skills: ['Animasi 2D', 'Storyboard', 'Character Design'],
      schoolName: 'SMK Negeri 1 Surabaya',
      schoolStatus: 'pending',
      major: 'Animasi & Multimedia',
      classGrade: 'XI ANM 2',
      isPro: false
    }
  },

  // Additional UMKM Businesses
  {
    email: 'glowlab@creatorin.my.id',
    fullName: 'GlowLab Skincare Indonesia',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
    location: 'Jakarta Barat',
    phone: '08220000008',
    businessProfile: {
      companyName: 'GlowLab Skincare Indonesia',
      category: 'Kecantikan & Kosmetik',
      description: 'Brand lokal formulasi bahan alami untuk kesehatan kulit wanita Indonesia dengan sertifikasi BPOM dan Halal.',
      website: 'https://glowlabskincare.co.id'
    }
  },
  {
    email: 'batik.pusaka@creatorin.my.id',
    fullName: 'Batik Pusaka Heritage',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300&auto=format&fit=crop&q=80',
    location: 'Solo, Jawa Tengah',
    phone: '08230000009',
    businessProfile: {
      companyName: 'Batik Pusaka Heritage',
      category: 'Fashion & Wastra Nusantara',
      description: 'UMKM pelestari motif batik tradisional Solo dengan potongan busana siap pakai kontemporer untuk generasi muda.',
      website: 'https://batikpusaka.id'
    }
  }
];

// ==============================================================================
// 2. DATA LAYANAN (SERVICES) BERKUALITAS DENGAN STOCK FOTO UNSPLASH
// ==============================================================================
const SERVICES_DATA = [
  {
    creatorSlug: 'qaesyaar-aqeel',
    title: 'Desain Identitas Brand & Logo UMKM',
    category: 'Logo',
    description: 'Konsep desain identitas visual lengkap dari logo primer, alternatif vertikal/horizontal, palet warna berkarakter, hingga guideline tipografi.',
    price: 'Rp100.000',
    priceNumeric: 100000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'qaesyaar-aqeel',
    title: 'Desain Feed Instagram Aesthetic (9 Grid)',
    category: 'Feed Instagram',
    description: 'Desain puzzle/grid Instagram 9 kotak dengan visual konsisten, template promosi, quote inspiratif, dan etalase produk siap posting.',
    price: 'Rp50.000',
    priceNumeric: 50000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'qaesyaar-aqeel',
    title: 'Packaging & Label Design Siap Cetak',
    category: 'Logo',
    description: 'Desain kemasan box, pouch, atau stiker label botol dengan dieline presisi sesuai standar percetakan dan estetika modern.',
    price: 'Rp70.000',
    priceNumeric: 70000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'creator-pro',
    title: 'Video Animasi Produk & Motion Reel 15 Detik',
    category: 'Reels Instagram',
    description: 'Video animasi motion graphic dinamis berdurasi 15-30 detik dengan sound design profesional, visual branding modern, dan call-to-action yang memikat calon pembeli.',
    price: 'Rp450.000',
    priceNumeric: 450000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'creator-pro',
    title: 'Desain Identitas Visual Brand & Logo Master Kit',
    category: 'Logo',
    description: 'Paket lengkap desain logo primer, logo sekunder, palet warna, tipografi panduan, dan file master vector (AI, EPS, SVG, PNG transparan) siap cetak dan digital.',
    price: 'Rp750.000',
    priceNumeric: 750000,
    estimatedDays: '4 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'sarah-amelia',
    title: 'Video TikTok UGC Review & Storytelling Konversi',
    category: 'Video Tiktok',
    description: 'Video konten UGC kreatif dengan angle problem-solution, unboxing jujur, live product demo, dan hook menarik yang disesuaikan dengan algoritma TikTok terkini.',
    price: 'Rp250.000',
    priceNumeric: 250000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'sarah-amelia',
    title: 'Reels Instagram Estetik & Lifestyle Showcase',
    category: 'Reels Instagram',
    description: 'Pembuatan video reels estetik bergaya editorial untuk produk makanan, fashion, atau cafe dengan grading warna sinematik dan audio trending.',
    price: 'Rp300.000',
    priceNumeric: 300000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'anisa-rahma',
    title: 'Desain Label Kemasan Kopi & Pouch Standing Zipper',
    category: 'Logo',
    description: 'Desain kemasan standing pouch kopi premium atau cemilan UMKM dengan informasi nilai gizi, barcode, dan layout visual eyecatching siap cetak rotogravure/digital.',
    price: 'Rp350.000',
    priceNumeric: 350000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'anisa-rahma',
    title: 'Feed Instagram Estetik 12 Grid & Template Canva',
    category: 'Feed Instagram',
    description: '12 desain postingan Instagram berkesinambungan (puzzle/seamless grid) dilengkapi file template Canva yang bisa diedit mandiri oleh pemilik UMKM.',
    price: 'Rp300.000',
    priceNumeric: 300000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'budi-pratama',
    title: 'Foto Produk Komersial Studio & Styling Katalog',
    category: 'Foto Produk',
    description: 'Sesi pemotretan produk studio dengan pencahayaan profesional, properti pendukung natural, dan retouching warna high-resolution untuk e-commerce dan marketplace.',
    price: 'Rp400.000',
    priceNumeric: 400000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'budi-pratama',
    title: 'Foto Menu Kuliner Restoran & Minuman Kafe',
    category: 'Foto Produk',
    description: 'Fotografi makanan & minuman menggugah selera (appetizing food photography) untuk buku menu, GrabFood/GoFood banners, dan media sosial.',
    price: 'Rp350.000',
    priceNumeric: 350000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'dimas-anggara',
    title: '3D Mockup Botol Serum Skincare & Kosmetik Realistis',
    category: 'Banner',
    description: 'Visualisasi 3D botol kaca serum kecantikan dengan efek pantulan cairan, tekstur akurat, dan render pencahayaan ultra realistis 4K.',
    price: 'Rp500.000',
    priceNumeric: 500000,
    estimatedDays: '4 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-009180746b14?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'dimas-anggara',
    title: 'Desain Banner Promosi Billboard & Roll-Up Display',
    category: 'Banner',
    description: 'Desain spanduk, X-banner, dan backdrop pameran UMKM dengan tipografi keterbacaan tinggi dari kejauhan dan resolusi cetak tanpa pecah.',
    price: 'Rp200.000',
    priceNumeric: 200000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'rahmat-hidayat',
    title: 'Desain Brosur Lipat Tiga (Trifold) Profil Usaha',
    category: 'Brosur',
    description: 'Tata letak brosur profesional dua sisi untuk pengenalan profil bisnis, katalog harga, dan portofolio layanan dengan komposisi rapi.',
    price: 'Rp150.000',
    priceNumeric: 150000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'rahmat-hidayat',
    title: 'Poster Event Musik & Bazaar Kuliner Kreatif',
    category: 'Poster',
    description: 'Desain poster promosi acara bazar, festival kampus, atau promo diskon toko dengan palet warna cerah dan elemen grafis kekinian.',
    price: 'Rp175.000',
    priceNumeric: 175000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
  }
];

// ==============================================================================
// 3. DATA SHOWCASE PORTOFOLIO (PROJECTS) DENGAN STOCK FOTO UNSPLASH
// ==============================================================================
const PROJECTS_DATA = [
  {
    creatorSlug: 'creator-pro',
    title: 'Rebranding Visual Kopi Specialty Lereng Ijen',
    category: 'Branding & Kemasan',
    description: 'Peremajaan identitas visual kemasan biji kopi single origin dengan stiker warna bumi dan tipografi modern.',
    mediaUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.240',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'creator-pro',
    title: 'Motion Teaser Peluncuran Koleksi Batik Kontemporer',
    category: 'Motion Graphic',
    description: 'Video teaser 3D partikel kain batik sutra berpadu efek cahaya sinematik untuk promosi peluncuran produk baru.',
    mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80',
    viewsCount: '980',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'sarah-amelia',
    title: 'Kampanye Video UGC Minuman Segar Herbal Organik',
    category: 'UGC & Video',
    description: 'Serial 5 video TikTok edukatif tentang khasiat rempah nusantara yang menghasilkan 450.000 views organik.',
    mediaUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    viewsCount: '3.420',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'sarah-amelia',
    title: 'Lookbook Video Fashion Streetwear Lokal',
    category: 'Fashion Video',
    description: 'Video reels dinamis menampilkan detail jahitan dan gaya berpakaian kasual di area perkotaan Jakarta.',
    mediaUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.110',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'anisa-rahma',
    title: 'Desain Kotak Kemasan Cookies & Pastry Ramadan',
    category: 'Packaging Design',
    description: 'Desain hardbox premium bernuansa islami modern dengan aksen hot stamp gold foil untuk hampers Idul Fitri.',
    mediaUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.870',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'anisa-rahma',
    title: 'Identitas Visual Kedai Teh Tradisional Omah Jamu',
    category: 'Brand Identity',
    description: 'Eksplorasi logo organik, stempel kemasan craft, dan menu kayu untuk kedai teh artisan di Yogyakarta.',
    mediaUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.450',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'budi-pratama',
    title: 'Fotografi Studio Produk Keramik Kerajinan Tangan',
    category: 'Commercial Photo',
    description: 'Pemotretan cangkir dan vas gerabah dengan pencahayaan softbox dramatis menonjolkan tekstur tanah liat.',
    mediaUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
    viewsCount: '890',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'budi-pratama',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    category: 'Food Photography',
    description: 'Foto close-up tetesan embun dan gradasi susu kopi dengan depth of field sempit yang menggiurkan.',
    mediaUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.340',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'dimas-anggara',
    title: 'Render 3D Packaging Botol Madu Hutan Liar Sumbawa',
    category: '3D Visualization',
    description: 'Model 3D botol heksagonal dengan material kaca tebal dan cairan madu amber emas ultra realistis.',
    mediaUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.670',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'dimas-anggara',
    title: 'Visual Mockup Tube Krim Pelembap Botanical',
    category: '3D Mockup',
    description: 'Visualisasi produk kosmetik di atas bebatuan marmer basah dengan latar dedaunan tropis hijau segar.',
    mediaUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.920',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'rahmat-hidayat',
    title: 'Karya LKS Desain Brosur Promosi Wisata Kota Pahlawan',
    category: 'Karya Siswa SMK',
    description: 'Desain media promosi destinasi wisata sejarah Surabaya yang meraih Juara 1 Tingkat Provinsi Jawa Timur.',
    mediaUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=800&auto=format&fit=crop&q=80',
    viewsCount: '3.150',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'rahmat-hidayat',
    title: 'Poster Festival Budaya Nusantara & Kuliner Rakyat',
    category: 'Karya Siswa SMK',
    description: 'Karya poster ilustrasi vektor wayang kontemporer memadukan motif mega mendung dan tipografi modern.',
    mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.480',
    isFeaturedSchool: true
  }
];

// ==============================================================================
// 4. DATA LOWONGAN BRIEFS PROYEK DARI UMKM
// ==============================================================================
const BRIEFS_DATA = [
  {
    businessEmail: 'umkm@creatorin.my.id',
    title: 'Desain Ulang Kemasan Standing Pouch Kopi Specialty 250gr',
    category: 'Desain Kemasan',
    description: 'Kami membutuhkan desainer kemasan kreatif untuk merombak total kemasan produk kopi specialty kami. Target pasar adalah penikmat kopi urban usia 22-40 tahun. Kemasan harus mencantumkan notes rasa, origin, dan certifikasi halal.',
    expectedOutput: 'File siap cetak AI/PDF dengan pola potong (dieline), 3D render preview untuk promosi di marketplace.',
    budget: 'Rp1.200.000',
    deadline: '7 Hari',
    status: 'open'
  },
  {
    businessEmail: 'umkm@creatorin.my.id',
    title: 'Pembuatan 3 Video Reels Sinematik Pengolahan Biji Kopi',
    category: 'Video Kreatif',
    description: 'Mencari videografer dan editor untuk membuat serial 3 video pendek tentang proses roasting biji kopi hingga seduh manual (V60). Durasi masing-masing 20-30 detik dengan voice over inspiratif.',
    expectedOutput: '3 video resolusi 1080x1920 (9:16) format MP4 beserta thumbnail menarik.',
    budget: 'Rp900.000',
    deadline: '5 Hari',
    status: 'open'
  },
  {
    businessEmail: 'glowlab@creatorin.my.id',
    title: 'Desain 15 Template Feed Instagram Produk Skincare Alami',
    category: 'Social Media',
    description: 'Dibutuhkan template postingan Instagram estetik bertema clean, pastel, dan scientific-natural. Meliputi postingan edukasi bahan aktif, testimoni pelanggan, dan pengumuman promo mingguan.',
    expectedOutput: 'File Canva yang dapat diedit mandiri, file PNG master resolusi tinggi, dan panduan font.',
    budget: 'Rp600.000',
    deadline: '4 Hari',
    status: 'open'
  },
  {
    businessEmail: 'glowlab@creatorin.my.id',
    title: 'Render 3D Mockup Botol Toner & Serum Botanical',
    category: '3D Visual',
    description: 'Membutuhkan artist 3D untuk membuat visual photorealistic 2 varian produk baru botol kaca amber dengan pipet. Aset akan digunakan pada banner utama toko Shopee dan Tokopedia.',
    expectedOutput: '4 sudut pandang render (front, angle, close-up dropper, group) resolusi 4000x4000px dengan background transparan dan background bertema marmer.',
    budget: 'Rp1.500.000',
    deadline: '6 Hari',
    status: 'open'
  },
  {
    businessEmail: 'batik.pusaka@creatorin.my.id',
    title: 'Foto Katalog & Lookbook Koleksi Kemeja Batik Modern',
    category: 'Foto Produk',
    description: 'Pekerjaan foto studio untuk 8 model kemeja batik pria kontemporer dengan model. Pencahayaan natural editorial gaya majalah fashion.',
    expectedOutput: 'Minimal 40 foto high-res yang sudah di-color grade dan di-retouch, rasio 3:4 dan 1:1.',
    budget: 'Rp2.000.000',
    deadline: '10 Hari',
    status: 'open'
  },
  {
    businessEmail: 'batik.pusaka@creatorin.my.id',
    title: 'Video TikTok UGC Storytelling Filosofi Motif Batik Solo',
    category: 'Video Tiktok',
    description: 'Dicari content creator yang fasih bercerita untuk mengangkat makna mendalam di balik motif batik Parang dan Kawung yang kami buat, dikemas santai dan relevan untuk anak muda.',
    expectedOutput: '2 video TikTok dengan hook kuat, subtitle dinamis, dan musik berlisensi komersial.',
    budget: 'Rp500.000',
    deadline: '3 Hari',
    status: 'open'
  }
];

// ==============================================================================
// 5. DATA PRESTASI & MITRA SEKOLAH (SMK)
// ==============================================================================
const SCHOOL_ACHIEVEMENTS_DATA = [
  {
    title: 'Juara 1 Lomba Kompetensi Siswa (LKS) Nasional Desain Grafis',
    year: '2024',
    category: 'Kompetisi Nasional',
    description: 'Siswa jurusan DKV meraih medali emas dengan skor tertinggi dalam modul packaging design dan vector illustration.',
    imageUrl: 'https://images.unsplash.com/photo-1569154941061-e231b4725ef1?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Medali Emas Festival Animasi Kreatif Pelajar Indonesia',
    year: '2025',
    category: 'Animasi & Multimedia',
    description: 'Karya film pendek animasi 2D tentang pelestarian terumbu karang berhasil terpilih sebagai karya terbaik pilihan dewan juri.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80'
  },
  {
    title: 'Sertifikasi Kemitraan Teaching Factory Industri Kreatif',
    year: '2025',
    category: 'Akreditasi Industri',
    description: 'Terakreditasi A sebagai satuan pendidikan vokasi dengan kurikulum berstandar industri digital dan marketplace nasional.',
    imageUrl: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&auto=format&fit=crop&q=80'
  }
];

// ==============================================================================
// 6. DATA ULASAN & TESTIMONI RIIL KOLABORASI UMKM & KREATOR
// ==============================================================================
const REVIEWS_DATA = [
  {
    creatorSlug: 'qaesyaar-aqeel',
    businessEmail: 'umkm@creatorin.my.id',
    reviewerName: 'Kopi Lereng Nusantara',
    reviewerRole: 'Pemilik Brand UMKM F&B',
    reviewerAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Desain Kemasan Pouch Kopi Specialty 250g',
    rating: 5.0,
    amount: 1200000,
    comment: 'Hasil desain packaging sangat rapi dengan pola dieline akurat siap cetak. Komunikasi cepat dan revisi selesai dalam hitungan jam. Sangat direkomendasikan untuk UMKM.',
    completedDate: '12 Okt 2026',
  },
  {
    creatorSlug: 'sarah-amelia',
    businessEmail: 'glowlab@creatorin.my.id',
    reviewerName: 'GlowLab Skincare Indonesia',
    reviewerRole: 'Brand Marketing Lead',
    reviewerAvatar: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Serial Video Reels UGC Botanical Serum',
    rating: 5.0,
    amount: 900000,
    comment: 'Penyampaian video UGC sangat natural dan hook videonya terbukti menaikkan konversi checkout di TikTok Shop. Kualitas audio dan lighting sangat jernih.',
    completedDate: '8 Okt 2026',
  },
  {
    creatorSlug: 'kevin-sanjaya',
    businessEmail: 'batik.pusaka@creatorin.my.id',
    reviewerName: 'Batik Pusaka Heritage',
    reviewerRole: 'Creative Director',
    reviewerAvatar: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Animasi Logo Bumper & Video Promo Koleksi Modern',
    rating: 4.9,
    amount: 1500000,
    comment: 'Animasi motion graphic bernuansa elegan dan mengangkat prestise motif batik tradisional ke level modern. Eksekusi timing audio visual sangat pas.',
    completedDate: '5 Okt 2026',
  },
  {
    creatorSlug: 'rahmat-hidayat',
    businessEmail: 'umkm@creatorin.my.id',
    reviewerName: 'Kopi Lereng Nusantara',
    reviewerRole: 'Pemilik Brand UMKM F&B',
    reviewerAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Desain Brosur Edukasi & Flyer Pameran Kopi',
    rating: 4.8,
    amount: 450000,
    comment: 'Meskipun masih berstatus siswa SMK vokasi, etos kerja Rahmat sangat disiplin. Vektor ilustrasinya berkarakter kuat dan layout infografisnya sangat mudah dipahami.',
    completedDate: '1 Okt 2026',
  },
];

// ==============================================================================
// EKSEKUSI SEEDING DATABASE
// ==============================================================================
async function main() {
  console.log('🚀 Memulai sinkronisasi data komprehensif ke database...\n');
  const userMap = new Map(); // email -> userId
  const creatorSlugMap = new Map(); // slug -> profileId

  // 1. Seed Profil Pengguna & Peran
  for (const acc of ACCOUNTS) {
    console.log(`👤 Menyinkronkan akun: ${acc.email} (${acc.role})...`);
    const [existing] = await sql`SELECT id FROM profiles WHERE LOWER(email) = LOWER(${acc.email}) LIMIT 1`;
    let userId;

    if (existing) {
      userId = existing.id;
      await sql`
        UPDATE profiles SET 
          full_name = ${acc.fullName}, 
          role = ${acc.role}, 
          password_hash = ${defaultPasswordHash}, 
          avatar_url = ${acc.avatarUrl}, 
          location = ${acc.location}, 
          phone = ${acc.phone}, 
          updated_at = NOW() 
        WHERE id = ${userId}
      `;
    } else {
      userId = crypto.randomUUID();
      await sql`
        INSERT INTO profiles 
          (id, full_name, email, role, password_hash, avatar_url, location, phone, created_at, updated_at) 
        VALUES 
          (${userId}, ${acc.fullName}, ${acc.email}, ${acc.role}, ${defaultPasswordHash}, ${acc.avatarUrl}, ${acc.location}, ${acc.phone}, NOW(), NOW())
      `;
    }
    userMap.set(acc.email.toLowerCase(), userId);

    // Seed Creator Profiles
    if (acc.creatorProfile) {
      const cp = acc.creatorProfile;
      creatorSlugMap.set(cp.slug, userId);
      const [existingCp] = await sql`SELECT profile_id FROM creator_profiles WHERE profile_id = ${userId} LIMIT 1`;
      if (existingCp) {
        await sql`
          UPDATE creator_profiles SET 
            headline = ${cp.headline},
            bio = ${cp.bio},
            career_score = ${cp.careerScore},
            rating = ${cp.rating},
            starting_price = ${cp.startingPrice},
            skills = ${JSON.stringify(cp.skills)},
            school_name = ${cp.schoolName || null},
            school_status = ${cp.schoolStatus || 'pending'},
            major = ${cp.major || null},
            class_grade = ${cp.classGrade || null},
            is_pro = ${cp.isPro ?? false}
          WHERE profile_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO creator_profiles 
            (profile_id, slug, headline, bio, career_score, rating, starting_price, skills, school_name, school_status, major, class_grade, is_pro, created_at)
          VALUES 
            (${userId}, ${cp.slug}, ${cp.headline}, ${cp.bio}, ${cp.careerScore}, ${cp.rating}, ${cp.startingPrice}, ${JSON.stringify(cp.skills)}, ${cp.schoolName || null}, ${cp.schoolStatus || 'pending'}, ${cp.major || null}, ${cp.classGrade || null}, ${cp.isPro ?? false}, NOW())
          ON CONFLICT (slug) DO UPDATE SET headline = EXCLUDED.headline, bio = EXCLUDED.bio, career_score = EXCLUDED.career_score
        `;
      }

      // Pastikan dompet kreator ada
      const [wal] = await sql`SELECT id FROM creator_wallets WHERE creator_id = ${userId} LIMIT 1`;
      if (!wal) {
        await sql`INSERT INTO creator_wallets (id, creator_id, balance) VALUES (${crypto.randomUUID()}, ${userId}, 5000000)`;
      }
    }

    // Seed Business Profiles
    if (acc.businessProfile) {
      const bp = acc.businessProfile;
      const [existingBp] = await sql`SELECT profile_id FROM business_profiles WHERE profile_id = ${userId} LIMIT 1`;
      if (existingBp) {
        await sql`
          UPDATE business_profiles SET 
            company_name = ${bp.companyName},
            business_category = ${bp.category},
            description = ${bp.description},
            website = ${bp.website}
          WHERE profile_id = ${userId}
        `;
      } else {
        await sql`
          INSERT INTO business_profiles 
            (profile_id, company_name, business_category, description, website, created_at)
          VALUES 
            (${userId}, ${bp.companyName}, ${bp.category}, ${bp.description}, ${bp.website}, NOW())
        `;
      }
    }

    // Seed School Profile & Partner Record
    if (acc.schoolInfo) {
      const sc = acc.schoolInfo;
      const [existingSchool] = await sql`SELECT id FROM schools WHERE slug = ${sc.slug} LIMIT 1`;
      let schoolId;
      if (existingSchool) {
        schoolId = existingSchool.id;
        await sql`
          UPDATE schools SET 
            profile_id = ${userId},
            name = ${sc.name},
            tagline = ${sc.tagline},
            description = ${sc.description},
            city = ${sc.city},
            address = ${sc.address},
            website = ${sc.website},
            pic_name = ${sc.picName},
            pic_contact = ${sc.picContact},
            is_verified = ${sc.isVerified},
            logo_url = ${acc.avatarUrl},
            cover_url = ${'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80'}
          WHERE id = ${schoolId}
        `;
      } else {
        const [insertedSchool] = await sql`
          INSERT INTO schools 
            (profile_id, name, slug, tagline, description, city, address, website, pic_name, pic_contact, is_verified, logo_url, cover_url, created_at)
          VALUES 
            (${userId}, ${sc.name}, ${sc.slug}, ${sc.tagline}, ${sc.description}, ${sc.city}, ${sc.address}, ${sc.website}, ${sc.picName}, ${sc.picContact}, ${sc.isVerified}, ${acc.avatarUrl}, ${'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80'}, NOW())
          RETURNING id
        `;
        schoolId = insertedSchool.id;
      }

      // Seed Prestasi Sekolah (Achievements)
      await sql`DELETE FROM school_achievements WHERE school_id = ${schoolId}`;
      for (const ach of SCHOOL_ACHIEVEMENTS_DATA) {
        await sql`
          INSERT INTO school_achievements 
            (id, school_id, title, year, category, description, image_url, created_at)
          VALUES 
            (${crypto.randomUUID()}, ${schoolId}, ${ach.title}, ${ach.year}, ${ach.category}, ${ach.description}, ${ach.imageUrl}, NOW())
        `;
      }

      // Hubungkan Siswa Vokasi (Approved & Pending) ke SMK ini
      await sql`DELETE FROM student_school_relations WHERE school_id = ${schoolId}`;
      const rahmatId = userMap.get('rahmat.hidayat@creatorin.my.id');
      if (rahmatId) {
        await sql`
          INSERT INTO student_school_relations 
            (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
          VALUES 
            (${crypto.randomUUID()}, ${rahmatId}, ${schoolId}, 'approved', true, '2026', 'Desain Komunikasi Visual', 'XII DKV 1', NOW(), NOW(), NOW())
        `;
      }
      const alyaId = userMap.get('alya.putri@creatorin.my.id');
      if (alyaId) {
        await sql`
          INSERT INTO student_school_relations 
            (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
          VALUES 
            (${crypto.randomUUID()}, ${alyaId}, ${schoolId}, 'pending', false, '2026', 'Animasi & Multimedia', 'XI ANM 2', NOW(), null, NOW())
        `;
      }
    }
  }

  // 2. Seed Services (Katalog Layanan Jasa)
  console.log('\n🎨 Menyinkronkan Layanan Kreatif (Services)...');
  await sql`DELETE FROM services`;
  for (const srv of SERVICES_DATA) {
    const creatorId = creatorSlugMap.get(srv.creatorSlug);
    if (!creatorId) continue;

    await sql`
      INSERT INTO services 
        (id, creator_id, title, category, description, price, price_numeric, estimated_days, image_url, is_active, created_at)
      VALUES 
        (${crypto.randomUUID()}, ${creatorId}, ${srv.title}, ${srv.category}, ${srv.description}, ${srv.price}, ${srv.priceNumeric}, ${srv.estimatedDays}, ${srv.imageUrl}, true, NOW())
    `;
  }
  console.log(`✅ Berhasil menyisipkan ${SERVICES_DATA.length} layanan jasa aktif.`);

  // 3. Seed Projects (Showcase Karya Portofolio)
  console.log('\n📁 Menyinkronkan Portofolio Karya (Projects)...');
  await sql`DELETE FROM projects`;
  for (const prj of PROJECTS_DATA) {
    const creatorId = creatorSlugMap.get(prj.creatorSlug);
    if (!creatorId) continue;

    await sql`
      INSERT INTO projects 
        (id, creator_id, title, category, description, creator_handle, media_url, media_type, views_count, is_featured_school, created_at)
      VALUES 
        (${crypto.randomUUID()}, ${creatorId}, ${prj.title}, ${prj.category}, ${prj.description}, ${'@' + prj.creatorSlug}, ${prj.mediaUrl}, 'image', ${prj.viewsCount}, ${prj.isFeaturedSchool}, NOW())
    `;
  }
  console.log(`✅ Berhasil menyisipkan ${PROJECTS_DATA.length} portofolio proyek.`);

  // 4. Seed Project Briefs (Peluang Kerja dari UMKM)
  console.log('\n💼 Menyinkronkan Lowongan Brief UMKM...');
  await sql`DELETE FROM project_briefs`;
  for (const brf of BRIEFS_DATA) {
    const businessId = userMap.get(brf.businessEmail.toLowerCase());
    if (!businessId) continue;

    await sql`
      INSERT INTO project_briefs 
        (id, business_id, title, category, description, expected_output, budget, deadline, status, created_at)
      VALUES 
        (${crypto.randomUUID()}, ${businessId}, ${brf.title}, ${brf.category}, ${brf.description}, ${brf.expectedOutput}, ${brf.budget}, ${brf.deadline}, ${brf.status}, NOW())
    `;
  }
  console.log(`✅ Berhasil menyisipkan ${BRIEFS_DATA.length} brief lowongan UMKM.`);

  // 5. Seed Reviews, Invoices & Collaboration Rooms (Transaksi & Ulasan Selesai)
  console.log('\n⭐ Menyinkronkan Kolaborasi & Ulasan Nyata (Reviews)...');
  await sql`DELETE FROM reviews`;
  await sql`DELETE FROM collaboration_rooms`;
  await sql`DELETE FROM invoices`;

  for (const rev of REVIEWS_DATA) {
    const creatorId = creatorSlugMap.get(rev.creatorSlug);
    const businessId = userMap.get(rev.businessEmail.toLowerCase());
    if (!creatorId || !businessId) continue;

    const invoiceId = crypto.randomUUID();
    const roomId = crypto.randomUUID();
    const reviewId = crypto.randomUUID();
    const invoiceNum = `INV-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    // 1. Invoice Lunas
    await sql`
      INSERT INTO invoices 
        (id, invoice_number, creator_id, business_id, title, scope_description, total_amount, deadline_days, revision_rules, status, paid_at, created_at)
      VALUES 
        (${invoiceId}, ${invoiceNum}, ${creatorId}, ${businessId}, ${rev.projectTitle}, ${rev.comment}, ${rev.amount || 750000}, 3, 'Maksimal 2 kali revisi minor.', 'paid', NOW(), NOW())
    `;

    // 2. Collaboration Room Selesai (Completed)
    await sql`
      INSERT INTO collaboration_rooms 
        (id, invoice_id, creator_id, business_id, title, brief_summary, status, approved_at, created_at)
      VALUES 
        (${roomId}, ${invoiceId}, ${creatorId}, ${businessId}, ${rev.projectTitle}, ${rev.comment}, 'completed', NOW(), NOW())
    `;

    // 3. Review Riil
    await sql`
      INSERT INTO reviews 
        (id, creator_id, reviewer_id, room_id, reviewer_name, reviewer_role, reviewer_avatar, project_title, rating, comment, completed_date, created_at)
      VALUES 
        (${reviewId}, ${creatorId}, ${businessId}, ${roomId}, ${rev.reviewerName}, ${rev.reviewerRole}, ${rev.reviewerAvatar}, ${rev.projectTitle}, ${rev.rating}, ${rev.comment}, ${rev.completedDate}, NOW())
    `;
  }
  console.log(`✅ Berhasil menyisipkan ${REVIEWS_DATA.length} ulasan riil dan ruangan kolaborasi selesai.`);

  // 6. Sinkronisasi Agregat Rating & Jumlah Proyek di creator_profiles
  console.log('\n📊 Memperbarui agregat rating dan riwayat ulasan di profil kreator...');
  for (const [slug, profileId] of creatorSlugMap.entries()) {
    const creatorReviews = await sql`SELECT rating FROM reviews WHERE creator_id = ${profileId}`;
    const completedRooms = await sql`SELECT id FROM collaboration_rooms WHERE creator_id = ${profileId} AND status = 'completed'`;
    
    let avgRating = '0.0';
    if (creatorReviews.length > 0) {
      const sum = creatorReviews.reduce((acc, r) => acc + Number(r.rating || 0), 0);
      avgRating = (sum / creatorReviews.length).toFixed(1);
    }
    
    await sql`
      UPDATE creator_profiles SET 
        rating = ${avgRating},
        reviews_count = ${creatorReviews.length},
        completed_projects_count = ${completedRooms.length}
      WHERE profile_id = ${profileId}
    `;
  }

  console.log('\n==================================================');
  console.log('🎉 SEEDING DATABASE SELESAI DENGAN SUKSES 100%!');
  console.log('Semua akun, profil, layanan, portofolio, dan brief siap digunakan.');
  console.log('==================================================');
  await sql.end();
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Gagal menjalankan seeder:', err);
  process.exit(1);
});
