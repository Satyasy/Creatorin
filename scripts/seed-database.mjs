import postgres from 'postgres';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Muat konfigurasi environment
const envFiles = [
  '.env.local',
  '.env.production',
  '.env',
  path.resolve('/var/www/creatorin/shared/.env.production'),
  path.resolve(process.cwd(), '../shared/.env.production'),
  path.resolve(process.cwd(), 'shared/.env.production')
];
for (const file of envFiles) {
  const fullPath = path.isAbsolute(file) ? file : path.resolve(process.cwd(), file);
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
    fullName: 'Budi Pratama (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08180000005',
    creatorProfile: {
      slug: 'budi-pratama',
      headline: 'Siswa Vokasi Fotografi Komersial & Food Styling',
      bio: 'Fotografi katalog produk e-commerce dan foto editorial studio untuk menu restoran dan produk UMKM binaan sekolah.',
      careerScore: 90,
      rating: 4.8,
      startingPrice: 'Rp 200.000',
      skills: ['Foto Produk', 'Video Sinematik', 'Komersial', 'Color Grading'],
      schoolName: 'SMK Negeri 1 Surabaya',
      schoolStatus: 'approved',
      major: 'Desain Komunikasi Visual',
      classGrade: 'XII DKV 2',
      isPro: false
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
  {
    email: 'rian.pratama@creatorin.my.id',
    fullName: 'Rian Pratama (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08210000011',
    creatorProfile: {
      slug: 'rian-pratama',
      headline: 'Siswa Vokasi UI/UX & Web Development',
      bio: 'Siswa SMK Negeri 1 Surabaya konsentrasi Rekayasa Perangkat Lunak. Sedang mengajukan verifikasi ke pihak sekolah.',
      careerScore: 80,
      rating: 0,
      startingPrice: 'Rp 150.000',
      skills: ['UI Mockups', 'Web Design', 'Figma', 'Frontend'],
      schoolName: 'SMK Negeri 1 Surabaya',
      schoolStatus: 'pending',
      major: 'Rekayasa Perangkat Lunak',
      classGrade: 'XI RPL 1',
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
  },

  // --------------------------------------------------------------------------
  // Tambahan Sekolah Mitra Vokasi
  // --------------------------------------------------------------------------
  {
    email: 'school.telkom@creatorin.my.id',
    fullName: 'SMK Telkom Sidoarjo',
    role: 'school',
    avatarUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=300&auto=format&fit=crop&q=80',
    location: 'Sidoarjo, Jawa Timur',
    phone: '08140000002',
    schoolInfo: {
      name: 'SMK Telkom Sidoarjo',
      slug: 'smk-telkom-sidoarjo',
      tagline: 'Pelopor Vokasi Teknologi Informasi & Desain Grafis Modern',
      description: 'Sekolah kejuruan terakreditasi A berbasis kurikulum industri digital dengan teaching factory unggulan di bidang UI/UX dan multimedia.',
      city: 'Sidoarjo',
      address: 'Jl. Raya Pecantingan, Sekardangan, Sidoarjo',
      website: 'https://smktelkom-sda.sch.id',
      picName: 'Rahmat Triyono, S.Kom., M.T.',
      picContact: '081298765432',
      isVerified: true
    }
  },
  {
    email: 'school.rus@creatorin.my.id',
    fullName: 'SMK Raden Umar Said (RUS) Kudus',
    role: 'school',
    avatarUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&auto=format&fit=crop&q=80',
    location: 'Kudus, Jawa Tengah',
    phone: '08140000003',
    schoolInfo: {
      name: 'SMK Raden Umar Said Kudus',
      slug: 'smk-raden-umar-said',
      tagline: 'Pusat Keunggulan Animasi 3D & Industri Kreatif Bertaraf Global',
      description: 'Sekolah vokasi animasi terdepan di Asia Tenggara dengan studio animasi berstandar Hollywood dan kolaborasi industri internasional.',
      city: 'Kudus',
      address: 'Jl. Sukun Raya No. 9, Besito, Gebog, Kudus',
      website: 'https://smkrus.sch.id',
      picName: 'Fariduddin, S.Pd., M.Sn.',
      picContact: '081322334455',
      isVerified: true
    }
  },

  // --------------------------------------------------------------------------
  // Siswa SMK Telkom Sidoarjo, SMK RUS Kudus & SMKN 1 Surabaya
  // --------------------------------------------------------------------------
  {
    email: 'citra.kirana@creatorin.my.id',
    fullName: 'Citra Kirana (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    location: 'Sidoarjo',
    phone: '08210000012',
    creatorProfile: {
      slug: 'citra-kirana',
      headline: 'Siswa Vokasi UI/UX & Digital Packaging',
      bio: 'Siswa berprestasi SMK Telkom Sidoarjo peminatan UI/UX design dan kemasan digital ramah lingkungan.',
      careerScore: 91,
      rating: 4.9,
      startingPrice: 'Rp 200.000',
      skills: ['UI/UX Design', 'Packaging', 'Mobile App', 'Wireframing'],
      schoolName: 'SMK Telkom Sidoarjo',
      schoolStatus: 'approved',
      major: 'Rekayasa Perangkat Lunak & Desain',
      classGrade: 'XII RPL 1',
      isPro: false
    }
  },
  {
    email: 'fajar.nugraha@creatorin.my.id',
    fullName: 'Fajar Nugraha (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    location: 'Sidoarjo',
    phone: '08210000013',
    creatorProfile: {
      slug: 'fajar-nugraha',
      headline: 'Siswa Vokasi Web Frontend & Dashboard UI',
      bio: 'Siswa SMK Telkom Sidoarjo. Mengajukan approval akun ke pihak sekolah untuk program magang industri teaching factory.',
      careerScore: 82,
      rating: 0,
      startingPrice: 'Rp 150.000',
      skills: ['Frontend', 'Tailwind', 'React', 'Next.js'],
      schoolName: 'SMK Telkom Sidoarjo',
      schoolStatus: 'pending',
      major: 'Rekayasa Perangkat Lunak',
      classGrade: 'XI RPL 2',
      isPro: false
    }
  },
  {
    email: 'gilang.ramadhan@creatorin.my.id',
    fullName: 'Gilang Ramadhan (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    location: 'Kudus',
    phone: '08210000014',
    creatorProfile: {
      slug: 'gilang-ramadhan',
      headline: 'Siswa Vokasi 3D Character Artist & VFX',
      bio: 'Siswa SMK Raden Umar Said Kudus. Berpengalaman mengerjakan aset 3D rigging, render photoreal, dan efek visual komersial.',
      careerScore: 95,
      rating: 5.0,
      startingPrice: 'Rp 400.000',
      skills: ['3D Modeling', 'Character Rigging', 'Blender', 'Maya', 'VFX'],
      schoolName: 'SMK Raden Umar Said Kudus',
      schoolStatus: 'approved',
      major: 'Animasi 3D & Game Art',
      classGrade: 'XII ANM 1',
      isPro: false
    }
  },
  {
    email: 'nabila.syakieb@creatorin.my.id',
    fullName: 'Nabila Syakieb (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&auto=format&fit=crop&q=80',
    location: 'Kudus',
    phone: '08210000015',
    creatorProfile: {
      slug: 'nabila-syakieb',
      headline: 'Siswa Vokasi 2D Concept Artist & Background Design',
      bio: 'Siswa SMK Raden Umar Said Kudus peminatan ilustrasi latar belakang dan concept design. Menunggu approval sekolah.',
      careerScore: 85,
      rating: 0,
      startingPrice: 'Rp 150.000',
      skills: ['Concept Art', 'Background Art', 'Digital Painting'],
      schoolName: 'SMK Raden Umar Said Kudus',
      schoolStatus: 'pending',
      major: 'Animasi 2D',
      classGrade: 'XI ANM 3',
      isPro: false
    }
  },
  {
    email: 'siti.nurhaliza@creatorin.my.id',
    fullName: 'Siti Nurhaliza (Siswa SMK)',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya',
    phone: '08210000016',
    creatorProfile: {
      slug: 'siti-nurhaliza',
      headline: 'Siswa Vokasi Ilustrasi Vektor & Tipografi',
      bio: 'Pengajuan akun ke SMK Negeri 1 Surabaya telah diverifikasi dengan catatan perbaikan portofolio.',
      careerScore: 76,
      rating: 0,
      startingPrice: 'Rp 100.000',
      skills: ['Vector Art', 'Tipografi', 'Desain Stiker'],
      schoolName: 'SMK Negeri 1 Surabaya',
      schoolStatus: 'rejected',
      major: 'Desain Komunikasi Visual',
      classGrade: 'X DKV 3',
      isPro: false
    }
  },

  // --------------------------------------------------------------------------
  // Kreator Independen Tambahan
  // --------------------------------------------------------------------------
  {
    email: 'farhan.maulana@creatorin.my.id',
    fullName: 'Farhan Maulana',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    location: 'Bandung',
    phone: '08128880001',
    creatorProfile: {
      slug: 'farhan-maulana',
      headline: 'Senior UI/UX Designer & Design System Specialist',
      bio: 'Mendesain antarmuka web & aplikasi mobile responsif dengan fokus utama pada metrik konversi dan kemudahan pakai untuk UMKM.',
      careerScore: 97,
      rating: 4.9,
      startingPrice: 'Rp 600.000',
      skills: ['UI/UX Design', 'Design System', 'Figma', 'Prototyping', 'User Research'],
      isPro: true
    }
  },
  {
    email: 'mega.utami@creatorin.my.id',
    fullName: 'Mega Utami',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    location: 'Yogyakarta',
    phone: '08128880002',
    creatorProfile: {
      slug: 'mega-utami',
      headline: 'Content Creator & UGC Video Specialist F&B',
      bio: 'Spesialis video review kuliner dan produk UMKM lokal dengan gaya storytelling autentik dan engagement tinggi.',
      careerScore: 94,
      rating: 5.0,
      startingPrice: 'Rp 300.000',
      skills: ['Video TikTok', 'Reels Instagram', 'Food Vlogging', 'Storytelling'],
      isPro: true
    }
  },
  {
    email: 'andi.wijaya@creatorin.my.id',
    fullName: 'Andi Wijaya',
    role: 'creator',
    avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&auto=format&fit=crop&q=80',
    location: 'Semarang',
    phone: '08128880003',
    creatorProfile: {
      slug: 'andi-wijaya',
      headline: 'Junior Graphic Designer & Social Media Specialist',
      bio: 'Kreator baru di Creatorin. Siap membantu UMKM membuat aset visual media sosial dengan tarif terjangkau.',
      careerScore: 78,
      rating: 0,
      startingPrice: 'Rp 100.000',
      skills: ['Canva', 'Photoshop', 'Feed Instagram', 'Poster'],
      isPro: false
    }
  },

  // --------------------------------------------------------------------------
  // UMKM Tambahan
  // --------------------------------------------------------------------------
  {
    email: 'dapur.sambal@creatorin.my.id',
    fullName: 'Dapur Sambal Bu Rudy',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    location: 'Surabaya, Jawa Timur',
    phone: '08139990002',
    businessProfile: {
      companyName: 'Dapur Sambal Bu Rudy',
      category: 'Kuliner Nusantara',
      description: 'UMKM kuliner khas Jawa Timur produsen aneka sambal botol kemasan siap saji dan lauk kering oleh-oleh nusantara.',
      website: 'https://dapursambal.id'
    }
  },
  {
    email: 'kriya.kayu@creatorin.my.id',
    fullName: 'Kriya Kayu Jati Perhutani',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=300&auto=format&fit=crop&q=80',
    location: 'Jepara, Jawa Tengah',
    phone: '08139990003',
    businessProfile: {
      companyName: 'Kriya Kayu Jati Perhutani',
      category: 'Kriya & Dekorasi Rumah',
      description: 'Pengrajin mebel dan perkakas dapur kayu jati solid ramah lingkungan dengan sertifikasi ekspor SVLK.',
      website: 'https://kriyakayujepara.id'
    }
  },
  {
    email: 'susu.bromo@creatorin.my.id',
    fullName: 'Susu Segar Lereng Bromo',
    role: 'business',
    avatarUrl: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=300&auto=format&fit=crop&q=80',
    location: 'Pasuruan, Jawa Timur',
    phone: '08139990004',
    businessProfile: {
      companyName: 'Susu Segar Lereng Bromo',
      category: 'Peternakan & Minuman Organik',
      description: 'Koperasi peternak sapi perah lereng Gunung Bromo yang memproduksi susu pasteurisasi murni dan yogurt segar.',
      website: 'https://susubromo.id'
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
  },
  {
    creatorSlug: 'citra-kirana',
    title: 'Desain Label Botol & Jar Sambal Siap Cetak',
    category: 'Packaging',
    description: 'Desain stiker label kemasan jar kaca atau botol plastik dengan spesifikasi ukuran presisi, barcode, info nilai gizi, dan visual menggugah selera.',
    price: 'Rp200.000',
    priceNumeric: 200000,
    estimatedDays: '3 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'citra-kirana',
    title: 'UI/UX Prototipe Aplikasi Mobile Toko Online UMKM',
    category: 'UI/UX',
    description: 'Desain tampilan antarmuka mobile app interaktif di Figma mulai dari alur browsing produk, keranjang, hingga halaman checkout.',
    price: 'Rp350.000',
    priceNumeric: 350000,
    estimatedDays: '4 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'gilang-ramadhan',
    title: 'Visualisasi 3D Furnitur & Perabot Kayu Realistis',
    category: '3D Visual',
    description: 'Pembuatan model 3D mebel, kursi, meja, atau perkakas dekorasi rumah dengan tekstur serat kayu alami dan pencahayaan studio ultra high-res.',
    price: 'Rp450.000',
    priceNumeric: 450000,
    estimatedDays: '4 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'gilang-ramadhan',
    title: 'Animasi Karakter 3D Rigged & Turntable Showcase',
    category: '3D Visual',
    description: 'Modeling karakter 3D lengkap dengan skeleton rigging dan animasi rotasi 360 derajat untuk game art, maskot, atau iklan komersial.',
    price: 'Rp600.000',
    priceNumeric: 600000,
    estimatedDays: '5 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'farhan-maulana',
    title: 'Desain Website E-Commerce Responsif & Sistem Desain',
    category: 'UI/UX',
    description: 'Perancangan lengkap website toko online UMKM di Figma dengan sistem desain modular, komponen token, dan prototipe interaktif siap handoff ke developer.',
    price: 'Rp850.000',
    priceNumeric: 850000,
    estimatedDays: '5 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'mega-utami',
    title: 'Video UGC Review Kuliner & Unboxing Produk Makanan',
    category: 'Video Tiktok',
    description: 'Video review autentik dengan visual estetik, ekspresi natural, pencahayaan jernih, dan storytelling persuasif yang meningkatkan kepercayaan pembeli.',
    price: 'Rp350.000',
    priceNumeric: 350000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80'
  },
  {
    creatorSlug: 'andi-wijaya',
    title: 'Desain Banner Promosi Media Sosial & Marketplace',
    category: 'Banner',
    description: 'Paket 3 banner promosi diskon, peluncuran produk baru, atau seasonal sale untuk toko online dan Instagram Story.',
    price: 'Rp100.000',
    priceNumeric: 100000,
    estimatedDays: '2 Hari Kerja',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80'
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
    category: 'Karya Siswa SMK',
    description: 'Pemotretan cangkir dan vas gerabah dengan pencahayaan softbox dramatis menonjolkan tekstur tanah liat karya teaching factory.',
    mediaUrl: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
    viewsCount: '890',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'budi-pratama',
    title: 'Katalog Menu Minuman Kopi Es Karamel & Latte',
    category: 'Karya Siswa SMK',
    description: 'Foto close-up tetesan embun dan gradasi susu kopi dengan depth of field sempit untuk kolaborasi kafe lokal.',
    mediaUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.340',
    isFeaturedSchool: true
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
  },
  {
    creatorSlug: 'alya-putri',
    title: 'Animasi Karakter 2D Maskot Wisata Bahari Nusantara',
    category: 'Karya Siswa SMK',
    description: 'Desain karakter animasi 2D lumba-lumba ramah lingkungan untuk materi edukasi konservasi laut terumbu karang.',
    mediaUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.780',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'rian-pratama',
    title: 'Dashboard Analitik Penjualan Toko Online Ramah Pengguna',
    category: 'Karya Siswa SMK',
    description: 'Rancangan UI/UX dashboard e-commerce dengan sistem komponen rapi di Figma dan prototype interaktif.',
    mediaUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.420',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'citra-kirana',
    title: 'Desain Kemasan Jar Sambal Kemasan Ramah Lingkungan',
    category: 'Karya Siswa SMK',
    description: 'Eksplorasi kemasan jar kaca dengan segel ramah lingkungan dan warna earthy warm untuk produk sambal tradisional nusantara.',
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.930',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'citra-kirana',
    title: 'Redesain Aplikasi Mobile Pasar Vokasi Edukasi',
    category: 'Karya Siswa SMK',
    description: 'Prototipe Figma antarmuka aplikasi belanja produk karya siswa kejuruan dengan alur transaksi ringkas.',
    mediaUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&auto=format&fit=crop&q=80',
    viewsCount: '1.450',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'gilang-ramadhan',
    title: '3D Render Set Meja & Kursi Jati Solid Minimalis',
    category: 'Karya Siswa SMK',
    description: 'Model 3D photorealistic mebel kayu jati karya teaching factory studio animasi dengan material PBR detail tinggi.',
    mediaUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.840',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'gilang-ramadhan',
    title: 'Karakter 3D Animasi Pendekar Nusantara "Gatotkaca"',
    category: 'Karya Siswa SMK',
    description: 'Karya 3D sculpting dan texturing karakter mitologi Jawa kontemporer yang dibuat di studio animasi sekolah binaan Djarum Foundation.',
    mediaUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80',
    viewsCount: '3.620',
    isFeaturedSchool: true
  },
  {
    creatorSlug: 'farhan-maulana',
    title: 'Sistem Desain Antarmuka E-Commerce Kuliner Tradisional',
    category: 'UI/UX Design',
    description: 'Dokumentasi sistem desain terstruktur mencakup token warna, tipografi, dan puluhan komponen antarmuka responsif.',
    mediaUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80',
    viewsCount: '2.190',
    isFeaturedSchool: false
  },
  {
    creatorSlug: 'mega-utami',
    title: 'Kampanye Video Reels Resep Masakan & Review Sambal',
    category: 'UGC & Video',
    description: 'Konten video memasak cepat (quick cooking video) menggunakan bumbu siap saji UMKM yang ditonton 200rb kali di Instagram.',
    mediaUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    viewsCount: '4.890',
    isFeaturedSchool: false
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
  },
  {
    businessEmail: 'dapur.sambal@creatorin.my.id',
    title: 'Desain Etiket Botol Sambal Ijo Cumi & Sambal Terasi',
    category: 'Desain Kemasan',
    description: 'Dibutuhkan desainer untuk merancang etiket stiker botol sambal nusantara varian baru. Harus memuat informasi expired date, nomor P-IRT, dan ilustrasi cabe segar.',
    expectedOutput: 'File PDF/AI siap cetak sesuai ukuran keliling botol 150ml, mock up 3D.',
    budget: 'Rp800.000',
    deadline: '5 Hari',
    status: 'open'
  },
  {
    businessEmail: 'kriya.kayu@creatorin.my.id',
    title: 'Visualisasi 3D Katalog Set Meja Makan Kayu Jati Jepara',
    category: '3D Visual',
    description: 'Kami ingin memvisualisasikan koleksi meja makan kayu jati terbaru dalam suasana ruang makan modern Skandinavia untuk katalog promosi ekspor.',
    expectedOutput: '5 gambar render resolusi 4K dari berbagai sudut ruang makan.',
    budget: 'Rp1.800.000',
    deadline: '7 Hari',
    status: 'open'
  },
  {
    businessEmail: 'susu.bromo@creatorin.my.id',
    title: 'Pembuatan 3 Video Edukasi TikTok Peternakan Sapi Perah',
    category: 'Video Kreatif',
    description: 'Mencari kreator konten video untuk mendokumentasikan proses pemerahan susu higienis di lereng Bromo dengan gaya vlogging santai dan informatif.',
    expectedOutput: '3 video vertikal durasi 30-45 detik beserta teks penjelasan dan backsound ceria.',
    budget: 'Rp1.000.000',
    deadline: '6 Hari',
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
    creatorSlug: 'creator-pro',
    businessEmail: 'umkm@creatorin.my.id',
    reviewerName: 'Kopi Lereng Nusantara',
    reviewerRole: 'Pemilik Brand UMKM F&B',
    reviewerAvatar: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Video Komersial Peluncuran Kopi Arabika Specialty',
    rating: 5.0,
    amount: 1750000,
    comment: 'Video promosi cinematik dengan motion graphic yang sangat memukau. Kualitas visualnya meningkatkan citra brand kopi kami secara signifikan!',
    completedDate: '14 Okt 2026',
  },
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
  {
    creatorSlug: 'citra-kirana',
    businessEmail: 'dapur.sambal@creatorin.my.id',
    reviewerName: 'Dapur Sambal Bu Rudy',
    reviewerRole: 'Owner & Operasional',
    reviewerAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Desain Kemasan Jar Sambal Bawang & Kemasan Karton Box',
    rating: 5.0,
    amount: 750000,
    comment: 'Siswa SMK Telkom Sidoarjo ini komunikasinya sangat profesional! Hasil label jar sambal kami langsung dicetak percetakan tanpa revisi ukuran sama sekali.',
    completedDate: '11 Okt 2026',
  },
  {
    creatorSlug: 'gilang-ramadhan',
    businessEmail: 'kriya.kayu@creatorin.my.id',
    reviewerName: 'Kriya Kayu Jati Perhutani',
    reviewerRole: 'Direktur Produksi',
    reviewerAvatar: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Visualisasi 3D Photoreal Set Meja Kursi Jati Minimalis',
    rating: 5.0,
    amount: 1400000,
    comment: 'Luar biasa! Serat kayu jati dan pencahayaannya terlihat begitu nyata seperti foto asli di showroom. Standar siswa SMK RUS Kudus memang sekelas studio profesional.',
    completedDate: '9 Okt 2026',
  },
  {
    creatorSlug: 'farhan-maulana',
    businessEmail: 'dapur.sambal@creatorin.my.id',
    reviewerName: 'Dapur Sambal Bu Rudy',
    reviewerRole: 'Digital Marketing Lead',
    reviewerAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Desain UI/UX Website Toko Online & Sistem Checkout Sambal',
    rating: 5.0,
    amount: 2500000,
    comment: 'Farhan merancang alur belanja yang sangat simpel dan mudah dimengerti bahkan oleh pelanggan lansia kami. Penjualan website melonjak signifikan.',
    completedDate: '7 Okt 2026',
  },
  {
    creatorSlug: 'mega-utami',
    businessEmail: 'susu.bromo@creatorin.my.id',
    reviewerName: 'Susu Segar Lereng Bromo',
    reviewerRole: 'Manajer Pemasaran',
    reviewerAvatar: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Video UGC Edukasi Manfaat Susu Pasteurisasi Alami',
    rating: 5.0,
    amount: 850000,
    comment: 'Storytelling Mega sangat hidup dan hangat! Video unggahannya di TikTok mendapatkan respons luar biasa dan membawa banyak pesanan susu botol baru.',
    completedDate: '4 Okt 2026',
  },
  {
    creatorSlug: 'budi-pratama',
    businessEmail: 'dapur.sambal@creatorin.my.id',
    reviewerName: 'Dapur Sambal Bu Rudy',
    reviewerRole: 'Owner & Operasional',
    reviewerAvatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&auto=format&fit=crop&q=80',
    projectTitle: 'Foto Katalog Produk Studio Varian Sambal Nusantara',
    rating: 4.8,
    amount: 600000,
    comment: 'Komposisi pencahayaan dan styling cabe uleg di samping jar sambal sangat menggugah selera. Kualitas foto sangat jernih untuk banner marketplace.',
    completedDate: '2 Okt 2026',
  }
];

// ==============================================================================
// EKSEKUSI SEEDING DATABASE
// ==============================================================================
async function main() {
  const forceSeed = process.env.FORCE_SEED === 'true';
  console.log('🚀 Memulai sinkronisasi data komprehensif ke database...\n');
  if (forceSeed) {
    console.log('⚠️ Mode FORCE_SEED aktif: Profil dan data lama akan ditimpa.');
  } else {
    console.log('🛡️ Mode Proteksi Data aktif: Profil yang sudah ada, avatar, banner, dan transaksi tidak akan ditimpa/dihapus.');
  }

  const userMap = new Map(); // email -> userId
  const creatorSlugMap = new Map(); // slug -> profileId

  // 1. Seed Profil Pengguna & Peran
  for (const acc of ACCOUNTS) {
    console.log(`👤 Menyinkronkan akun: ${acc.email} (${acc.role})...`);
    const [existing] = await sql`SELECT id, avatar_url, full_name, cover_url FROM profiles WHERE LOWER(email) = LOWER(${acc.email}) LIMIT 1`;
    let userId;

    if (existing) {
      userId = existing.id;
      if (forceSeed) {
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
        // Safe update: Never overwrite user-customized name, password, avatar, or banner!
        await sql`
          UPDATE profiles SET 
            role = COALESCE(role, ${acc.role}), 
            avatar_url = COALESCE(avatar_url, ${acc.avatarUrl}), 
            location = COALESCE(location, ${acc.location}), 
            phone = COALESCE(phone, ${acc.phone}), 
            updated_at = NOW() 
          WHERE id = ${userId}
        `;
      }
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
        if (forceSeed) {
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
        }
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
        if (forceSeed) {
          await sql`
            UPDATE business_profiles SET 
              company_name = ${bp.companyName},
              business_category = ${bp.category},
              description = ${bp.description},
              website = ${bp.website}
            WHERE profile_id = ${userId}
          `;
        }
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
    }
  }

  // 1b. Hubungkan Siswa Vokasi (Approved, Pending, Rejected) & Penilaian Sekolah
  // --- A. SMK NEGERI 1 SURABAYA ---
  const [smkRecord] = await sql`SELECT id FROM schools WHERE slug = 'smk-negeri-1-surabaya' LIMIT 1`;
  if (smkRecord) {
    const schoolId = smkRecord.id;
    console.log(`\n🏫 Menyinkronkan Relasi Siswa & Penilaian SMK Negeri 1 Surabaya (${schoolId})...`);
    await sql`DELETE FROM student_school_relations WHERE school_id = ${schoolId}`;
    await sql`DELETE FROM school_assessments WHERE school_id = ${schoolId}`;

    const rahmatId = userMap.get('rahmat.hidayat@creatorin.my.id');
    const budiId = userMap.get('budi.pratama@creatorin.my.id');
    const alyaId = userMap.get('alya.putri@creatorin.my.id');
    const rianId = userMap.get('rian.pratama@creatorin.my.id');
    const sitiId = userMap.get('siti.nurhaliza@creatorin.my.id');

    // Siswa 1: Rahmat Hidayat (Approved, Featured)
    if (rahmatId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${rahmatId}, ${schoolId}, 'approved', true, '2026', 'Desain Komunikasi Visual', 'XII DKV 1', NOW(), NOW(), NOW())
      `;
      const assId = crypto.randomUUID();
      await sql`
        INSERT INTO school_assessments 
          (id, student_id, school_id, status, final_score, notes, updated_at, created_at)
        VALUES 
          (${assId}, ${rahmatId}, ${schoolId}, 'completed', 90.0, 'Portofolio siap industri dengan pemahaman teknis dan etos kerja prima.', NOW(), NOW())
      `;
      const rubricItems = [
        { criterion: 'Kemampuan Teknis', score: 92, weight: 40 },
        { criterion: 'Tanggung Jawab', score: 88, weight: 20 },
        { criterion: 'Komunikasi', score: 90, weight: 20 },
        { criterion: 'Kedisiplinan', score: 90, weight: 20 },
      ];
      for (const rub of rubricItems) {
        await sql`
          INSERT INTO assessment_items 
            (id, assessment_id, criterion, score, weight)
          VALUES 
            (${crypto.randomUUID()}, ${assId}, ${rub.criterion}, ${rub.score}, ${rub.weight})
        `;
      }
    }

    // Siswa 2: Budi Pratama (Approved, Featured)
    if (budiId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${budiId}, ${schoolId}, 'approved', true, '2025', 'Desain Komunikasi Visual', 'XII DKV 2', NOW(), NOW(), NOW())
      `;
      const assId2 = crypto.randomUUID();
      await sql`
        INSERT INTO school_assessments 
          (id, student_id, school_id, status, final_score, notes, updated_at, created_at)
        VALUES 
          (${assId2}, ${budiId}, ${schoolId}, 'draft', 82.5, 'Karya fotografi komersial sangat baik, perlu pendampingan komunikasi revisi.', NOW(), NOW())
      `;
      const rubricItems2 = [
        { criterion: 'Kemampuan Teknis', score: 85, weight: 40 },
        { criterion: 'Tanggung Jawab', score: 80, weight: 20 },
        { criterion: 'Komunikasi', score: 80, weight: 20 },
        { criterion: 'Kedisiplinan', score: 85, weight: 20 },
      ];
      for (const rub of rubricItems2) {
        await sql`
          INSERT INTO assessment_items 
            (id, assessment_id, criterion, score, weight)
          VALUES 
            (${crypto.randomUUID()}, ${assId2}, ${rub.criterion}, ${rub.score}, ${rub.weight})
        `;
      }
    }

    // Siswa 3: Alya Putri (Pending)
    if (alyaId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${alyaId}, ${schoolId}, 'pending', false, '2026', 'Animasi & Multimedia', 'XI ANM 2', NOW(), null, NOW())
      `;
    }

    // Siswa 4: Rian Pratama (Pending)
    if (rianId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${rianId}, ${schoolId}, 'pending', false, '2026', 'Rekayasa Perangkat Lunak', 'XI RPL 1', NOW(), null, NOW())
      `;
    }

    // Siswa 5: Siti Nurhaliza (Rejected)
    if (sitiId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${sitiId}, ${schoolId}, 'rejected', false, '2027', 'Desain Komunikasi Visual', 'X DKV 3', NOW(), null, NOW())
      `;
    }

    console.log(`✅ Berhasil menyisipkan 5 relasi siswa SMKN 1 Surabaya (2 Approved, 2 Pending, 1 Rejected).`);
  }

  // --- B. SMK TELKOM SIDOARJO ---
  const [telkomRecord] = await sql`SELECT id FROM schools WHERE slug = 'smk-telkom-sidoarjo' LIMIT 1`;
  if (telkomRecord) {
    const schoolId = telkomRecord.id;
    console.log(`\n🏫 Menyinkronkan Relasi Siswa & Penilaian SMK Telkom Sidoarjo (${schoolId})...`);
    await sql`DELETE FROM student_school_relations WHERE school_id = ${schoolId}`;
    await sql`DELETE FROM school_assessments WHERE school_id = ${schoolId}`;

    const citraId = userMap.get('citra.kirana@creatorin.my.id');
    const fajarId = userMap.get('fajar.nugraha@creatorin.my.id');

    // Siswa: Citra Kirana (Approved, Featured)
    if (citraId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${citraId}, ${schoolId}, 'approved', true, '2026', 'Rekayasa Perangkat Lunak & Desain', 'XII RPL 1', NOW(), NOW(), NOW())
      `;
      const assId = crypto.randomUUID();
      await sql`
        INSERT INTO school_assessments 
          (id, student_id, school_id, status, final_score, notes, updated_at, created_at)
        VALUES 
          (${assId}, ${citraId}, ${schoolId}, 'completed', 91.0, 'Portofolio UI/UX sangat matang dengan riset pengguna yang solid dan prototipe presisi.', NOW(), NOW())
      `;
      const rubricItems = [
        { criterion: 'Kemampuan Teknis', score: 93, weight: 40 },
        { criterion: 'Tanggung Jawab', score: 90, weight: 20 },
        { criterion: 'Komunikasi', score: 90, weight: 20 },
        { criterion: 'Kedisiplinan', score: 91, weight: 20 },
      ];
      for (const rub of rubricItems) {
        await sql`
          INSERT INTO assessment_items 
            (id, assessment_id, criterion, score, weight)
          VALUES 
            (${crypto.randomUUID()}, ${assId}, ${rub.criterion}, ${rub.score}, ${rub.weight})
        `;
      }
    }

    // Siswa: Fajar Nugraha (Pending)
    if (fajarId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${fajarId}, ${schoolId}, 'pending', false, '2026', 'Rekayasa Perangkat Lunak', 'XI RPL 2', NOW(), null, NOW())
      `;
    }

    console.log(`✅ Berhasil menyisipkan 2 relasi siswa SMK Telkom Sidoarjo (1 Approved, 1 Pending).`);
  }

  // --- C. SMK RADEN UMAR SAID (RUS) KUDUS ---
  const [rusRecord] = await sql`SELECT id FROM schools WHERE slug = 'smk-raden-umar-said' LIMIT 1`;
  if (rusRecord) {
    const schoolId = rusRecord.id;
    console.log(`\n🏫 Menyinkronkan Relasi Siswa & Penilaian SMK RUS Kudus (${schoolId})...`);
    await sql`DELETE FROM student_school_relations WHERE school_id = ${schoolId}`;
    await sql`DELETE FROM school_assessments WHERE school_id = ${schoolId}`;

    const gilangId = userMap.get('gilang.ramadhan@creatorin.my.id');
    const nabilaId = userMap.get('nabila.syakieb@creatorin.my.id');

    // Siswa: Gilang Ramadhan (Approved, Featured)
    if (gilangId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${gilangId}, ${schoolId}, 'approved', true, '2026', 'Animasi 3D & Game Art', 'XII ANM 1', NOW(), NOW(), NOW())
      `;
      const assId = crypto.randomUUID();
      await sql`
        INSERT INTO school_assessments 
          (id, student_id, school_id, status, final_score, notes, updated_at, created_at)
        VALUES 
          (${assId}, ${gilangId}, ${schoolId}, 'completed', 95.0, 'Kualitas aset 3D rigging dan tekstur fotorealistik sebanding standar studio internasional.', NOW(), NOW())
      `;
      const rubricItems = [
        { criterion: 'Kemampuan Teknis', score: 96, weight: 40 },
        { criterion: 'Tanggung Jawab', score: 94, weight: 20 },
        { criterion: 'Komunikasi', score: 95, weight: 20 },
        { criterion: 'Kedisiplinan', score: 95, weight: 20 },
      ];
      for (const rub of rubricItems) {
        await sql`
          INSERT INTO assessment_items 
            (id, assessment_id, criterion, score, weight)
          VALUES 
            (${crypto.randomUUID()}, ${assId}, ${rub.criterion}, ${rub.score}, ${rub.weight})
        `;
      }
    }

    // Siswa: Nabila Syakieb (Pending)
    if (nabilaId) {
      await sql`
        INSERT INTO student_school_relations 
          (id, student_id, school_id, school_status, is_featured, graduation_year, major, class_grade, request_date, approved_at, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${nabilaId}, ${schoolId}, 'pending', false, '2026', 'Animasi 2D', 'XI ANM 3', NOW(), null, NOW())
      `;
    }

    console.log(`✅ Berhasil menyisipkan 2 relasi siswa SMK RUS Kudus (1 Approved, 1 Pending).`);
  }

  // 2. Seed Services (Katalog Layanan Jasa)
  console.log('\n🎨 Menyinkronkan Layanan Kreatif (Services)...');
  const [{ count: currentServicesCount }] = await sql`SELECT COUNT(*)::int as count FROM services`;
  if (!forceSeed && currentServicesCount > 0) {
    console.log(`🛡️ Layanan sudah ada (${currentServicesCount} data). Melewati penghapusan/seeding services demi proteksi data.`);
  } else {
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
  }

  // 3. Seed Projects (Showcase Karya Portofolio)
  console.log('\n📁 Menyinkronkan Portofolio Karya (Projects)...');
  const [{ count: currentProjectsCount }] = await sql`SELECT COUNT(*)::int as count FROM projects`;
  if (!forceSeed && currentProjectsCount > 0) {
    console.log(`🛡️ Portofolio proyek sudah ada (${currentProjectsCount} data). Melewati penghapusan/seeding projects demi proteksi data.`);
  } else {
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
  }

  // 4. Seed Project Briefs (Peluang Kerja dari UMKM)
  console.log('\n💼 Menyinkronkan Lowongan Brief UMKM...');
  const briefMap = new Map(); // title -> briefId
  const [{ count: currentBriefsCount }] = await sql`SELECT COUNT(*)::int as count FROM project_briefs`;
  if (!forceSeed && currentBriefsCount > 0) {
    console.log(`🛡️ Lowongan brief sudah ada (${currentBriefsCount} data). Melewati penghapusan/seeding briefs demi proteksi data.`);
  } else {
    await sql`DELETE FROM brief_applications`;
    await sql`DELETE FROM project_briefs`;

    for (const brf of BRIEFS_DATA) {
      const businessId = userMap.get(brf.businessEmail.toLowerCase());
      if (!businessId) continue;

      const briefId = crypto.randomUUID();
      await sql`
        INSERT INTO project_briefs 
          (id, business_id, title, category, description, expected_output, budget, deadline, status, created_at)
        VALUES 
          (${briefId}, ${businessId}, ${brf.title}, ${brf.category}, ${brf.description}, ${brf.expectedOutput}, ${brf.budget}, ${brf.deadline}, ${brf.status}, NOW())
      `;
      briefMap.set(brf.title, briefId);
    }
    console.log(`✅ Berhasil menyisipkan ${BRIEFS_DATA.length} brief lowongan UMKM.`);

    // 4b. Seed Brief Applications (Lamaran Kreator)
    console.log('\n📝 Menyinkronkan Lamaran Kreatif (Brief Applications)...');
    const APPLICATIONS_DATA = [
      {
        briefTitle: 'Desain Ulang Kemasan Standing Pouch Kopi Specialty 250gr',
        creatorEmail: 'qaesyaar.aqeel@creatorin.my.id',
        pitch: 'Halo tim Kopi Lereng! Saya memiliki pengalaman 4 tahun mendesain kemasan F&B siap cetak dengan dieline standar pabrik rotogravure. Saya siap buatkan 3 opsi konsep modern bernuansa heritage.',
        proposedPrice: 'Rp 850.000',
        status: 'accepted'
      },
      {
        briefTitle: 'Desain Ulang Kemasan Standing Pouch Kopi Specialty 250gr',
        creatorEmail: 'rahmat.hidayat@creatorin.my.id',
        pitch: 'Saya siswa SMK DKV peraih medali emas LKS Packaging Design. Portofolio saya fokus pada kemasan kopi dan produk lokal dengan ilustrasi vektor presisi.',
        proposedPrice: 'Rp 500.000',
        status: 'pending'
      },
      {
        briefTitle: 'Pembuatan 3 Video Edukasi TikTok Peternakan Sapi Perah',
        creatorEmail: 'creator@creatorin.my.id',
        pitch: 'Siap memproduksi 3 video vertikal 4K berorientasi viral hook dengan motion infographic yang menjelaskan nutrisi susu murni segar.',
        proposedPrice: 'Rp 1.500.000',
        status: 'accepted'
      },
      {
        briefTitle: 'Kampanye Konten Video UGC Reels Serum Wajah Alami',
        creatorEmail: 'sarah.amelia@creatorin.my.id',
        pitch: 'Spesialis video UGC beauty & skincare dengan engagement tinggi. Kamera Sony A7IV + lighting studio siap menghasilkan visual aesthetic.',
        proposedPrice: 'Rp 900.000',
        status: 'pending'
      },
      {
        briefTitle: 'Sesi Foto Katalog Studio Varian Sambal Kemasan Jar',
        creatorEmail: 'budi.pratama@creatorin.my.id',
        pitch: 'Studio foto komersial lengkap di Surabaya. Menyediakan garnish cabe segar, kayu jati, dan piring gerabah untuk nuansa otentik.',
        proposedPrice: 'Rp 650.000',
        status: 'pending'
      }
    ];

    for (const app of APPLICATIONS_DATA) {
      const briefId = briefMap.get(app.briefTitle);
      const creatorId = userMap.get(app.creatorEmail.toLowerCase());
      if (briefId && creatorId) {
        await sql`
          INSERT INTO brief_applications 
            (id, brief_id, creator_id, pitch, proposed_price, status, created_at)
          VALUES 
            (${crypto.randomUUID()}, ${briefId}, ${creatorId}, ${app.pitch}, ${app.proposedPrice}, ${app.status}, NOW())
        `;
      }
    }
    console.log(`✅ Berhasil menyisipkan ${APPLICATIONS_DATA.length} lamaran brief aktif.`);
  }

  // 5. Seed Reviews, Invoices, Collaboration Rooms, Submissions & Revisions
  console.log('\n⭐ Menyinkronkan Kolaborasi, Ruangan Kerja, Submisi & Ulasan (Reviews)...');
  const [{ count: currentInvoicesCount }] = await sql`SELECT COUNT(*)::int as count FROM invoices`;
  if (!forceSeed && currentInvoicesCount > 0) {
    console.log(`🛡️ Kolaborasi & invoice sudah ada (${currentInvoicesCount} data). Melewati penghapusan/seeding kolaborasi demi proteksi data.`);
  } else {
    await sql`DELETE FROM revisions`;
    await sql`DELETE FROM submissions`;
    await sql`DELETE FROM reviews`;
    await sql`DELETE FROM collaboration_rooms`;
    await sql`DELETE FROM invoices`;
    await sql`DELETE FROM wallet_transactions`;

    for (const rev of REVIEWS_DATA) {
      const creatorId = creatorSlugMap.get(rev.creatorSlug);
      const businessId = userMap.get(rev.businessEmail.toLowerCase());
      if (!creatorId || !businessId) continue;

      const invoiceId = crypto.randomUUID();
      const roomId = crypto.randomUUID();
      const reviewId = crypto.randomUUID();
      const submissionId = crypto.randomUUID();
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

      // 3. Submisi Hasil Karya Selesai
      await sql`
        INSERT INTO submissions 
          (id, room_id, version, notes, file_urls, status, submitted_at)
        VALUES 
          (${submissionId}, ${roomId}, 1, ${'Draf final siap rilis untuk: ' + rev.projectTitle}, ${['https://images.unsplash.com/photo-1541167760496-1628856ab772?w=1200&auto=format&fit=crop&q=80']}, 'approved', NOW())
      `;

      // 4. Review Riil
      await sql`
        INSERT INTO reviews 
          (id, creator_id, reviewer_id, room_id, reviewer_name, reviewer_role, reviewer_avatar, project_title, rating, comment, completed_date, created_at)
        VALUES 
          (${reviewId}, ${creatorId}, ${businessId}, ${roomId}, ${rev.reviewerName}, ${rev.reviewerRole}, ${rev.reviewerAvatar}, ${rev.projectTitle}, ${rev.rating}, ${rev.comment}, ${rev.completedDate}, NOW())
      `;

      // 5. Transaksi Dompet (Kredit ke dompet kreator)
      const [wal] = await sql`SELECT id FROM creator_wallets WHERE creator_id = ${creatorId} LIMIT 1`;
      if (wal) {
        await sql`
          INSERT INTO wallet_transactions 
            (id, wallet_id, type, amount, status, description, created_at)
          VALUES 
            (${crypto.randomUUID()}, ${wal.id}, 'project_payment', ${rev.amount || 750000}, 'completed', ${'Pembayaran selesai proyek: ' + rev.projectTitle}, NOW())
        `;
      }
    }

    // 5b. Tambahkan 1 Ruangan Kolaborasi Aktif (In Progress dengan Revisi Aktif)
    const creatorProId = userMap.get('creator@creatorin.my.id');
    const umkmId = userMap.get('umkm@creatorin.my.id');
    if (creatorProId && umkmId) {
      const activeInvId = crypto.randomUUID();
      const activeRoomId = crypto.randomUUID();
      const activeSubId = crypto.randomUUID();
      const activeInvNum = `INV-ACTV-${Date.now().toString().slice(-5)}`;

      await sql`
        INSERT INTO invoices 
          (id, invoice_number, creator_id, business_id, title, scope_description, total_amount, deadline_days, revision_rules, status, paid_at, created_at)
        VALUES 
          (${activeInvId}, ${activeInvNum}, ${creatorProId}, ${umkmId}, 'Kampanye Video Reels Menu Spesial Musim Hujan', 'Produksi 2 konten video reels vertikal 9:16 untuk peluncuran menu varian kopi rempah.', 1500000, 5, 'Maksimal 2 kali revisi minor.', 'paid', NOW(), NOW())
      `;

      await sql`
        INSERT INTO collaboration_rooms 
          (id, invoice_id, creator_id, business_id, title, brief_summary, status, deadline, created_at)
        VALUES 
          (${activeRoomId}, ${activeInvId}, ${creatorProId}, ${umkmId}, 'Kampanye Video Reels Menu Spesial Musim Hujan', 'Produksi 2 konten video reels vertikal 9:16 untuk peluncuran menu varian kopi rempah.', 'revision_requested', NOW() + INTERVAL '3 days', NOW())
      `;

      await sql`
        INSERT INTO submissions 
          (id, room_id, version, notes, file_urls, status, submitted_at)
        VALUES 
          (${activeSubId}, ${activeRoomId}, 1, 'Mohon dicek draf video reels varian Kopi Jahe Gula Aren (Hook awal & transisi produk).', ${['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&auto=format&fit=crop&q=80']}, 'revision_requested', NOW() - INTERVAL '1 day')
      `;

      await sql`
        INSERT INTO revisions 
          (id, room_id, submission_id, feedback, requested_at)
        VALUES 
          (${crypto.randomUUID()}, ${activeRoomId}, ${activeSubId}, 'Visual dan grading warnanya mantap mas! Hanya tolong perbesar teks promo diskon di 3 detik terakhir agar lebih eye-catching.', NOW())
      `;

      console.log(`✅ Berhasil menyisipkan 1 ruangan kolaborasi aktif (Status: revision_requested) untuk pengujian CRUD.`);
    }

    console.log(`✅ Berhasil menyisipkan total ${REVIEWS_DATA.length} ulasan riil, invoice, submisi, dan ruangan kolaborasi.`);
  }

  // 5c. Seed Percakapan & Pesan Chat Riil
  console.log('\n💬 Menyinkronkan Percakapan & Pesan (Chat)...');
  const [{ count: currentMessagesCount }] = await sql`SELECT COUNT(*)::int as count FROM messages`;
  const creatorProId = userMap.get('creator@creatorin.my.id');
  const umkmId = userMap.get('umkm@creatorin.my.id');

  if (!forceSeed && currentMessagesCount > 0) {
    console.log(`🛡️ Pesan chat sudah ada (${currentMessagesCount} data). Melewati penghapusan/seeding chat demi proteksi data.`);
  } else {
    await sql`DELETE FROM messages`;
    await sql`DELETE FROM conversations`;
    if (creatorProId && umkmId) {
      const convId = crypto.randomUUID();
      await sql`
        INSERT INTO conversations (id, participant_1_id, participant_2_id, last_message, last_message_time, updated_at)
        VALUES (${convId}, ${umkmId}, ${creatorProId}, 'Siap mas, saya update revisi teks promo sore ini.', NOW(), NOW())
      `;
      const chatMsgs = [
        { senderId: umkmId, content: 'Halo Creator Pro! Kami dari Kopi Lereng ingin buat konten video reels untuk varian menu kopi rempah terbaru.' },
        { senderId: creatorProId, content: 'Halo Kopi Lereng Nusantara! Menarik sekali konsepnya. Untuk durasi target sekitar 30-45 detik dengan tempo energik atau warm-cinematic?' },
        { senderId: umkmId, content: 'Lebih ke warm-cinematic mas, agar aroma dan suasana ngopi di lereng gunung terasa kental.' },
        { senderId: creatorProId, content: 'Siap mas, saya update revisi teks promo sore ini.' },
      ];
      for (const msg of chatMsgs) {
        await sql`
          INSERT INTO messages (id, conversation_id, sender_id, content, is_read, metadata, created_at)
          VALUES (${crypto.randomUUID()}, ${convId}, ${msg.senderId}, ${msg.content}, true, '{}', NOW())
        `;
      }
      console.log(`✅ Berhasil menyisipkan thread percakapan dengan ${chatMsgs.length} pesan riil.`);
    }
  }

  // 5d. Seed Notifikasi Riil
  console.log('\n🔔 Menyinkronkan Notifikasi Riil Pengguna...');
  const [{ count: currentNotifCount }] = await sql`SELECT COUNT(*)::int as count FROM notifications`;
  if (!forceSeed && currentNotifCount > 0) {
    console.log(`🛡️ Notifikasi sudah ada (${currentNotifCount} data). Melewati penghapusan/seeding notifikasi demi proteksi data.`);
  } else {
    await sql`DELETE FROM notifications`;
    if (creatorProId) {
      await sql`
        INSERT INTO notifications (id, user_id, type, title, body, link_url, is_read, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${creatorProId}, 'invoice', 'Pembayaran Diterima', 'Kopi Lereng Nusantara telah membayar invoice senilai Rp 1.500.000.', '/contracts', false, NOW()),
          (${crypto.randomUUID()}, ${creatorProId}, 'revision', 'Permintaan Revisi', 'Klien memberikan masukan revisi pada draf video reels varian kopi rempah.', '/contracts', false, NOW())
      `;
    }
    if (umkmId) {
      await sql`
        INSERT INTO notifications (id, user_id, type, title, body, link_url, is_read, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${umkmId}, 'submission', 'Draf Baru Tersedia', 'Kreator telah mengunggah draf karya untuk Kampanye Video Reels.', '/dashboard', false, NOW()),
          (${crypto.randomUUID()}, ${umkmId}, 'application', 'Pelamar Baru di Brief', 'Qaesyaar Aqeel mengajukan proposal untuk brief Desain Ulang Kemasan Kopi.', '/briefs', false, NOW())
      `;
    }
    console.log('✅ Berhasil menyisipkan notifikasi riil untuk Creator Pro & UMKM.');
  }

  // 5e. Seed Komentar Portofolio Proyek (Project Comments)
  console.log('\n💬 Menyinkronkan Komentar Portofolio (Project Comments)...');
  const [{ count: currentCommentsCount }] = await sql`SELECT COUNT(*)::int as count FROM project_comments`;
  if (!forceSeed && currentCommentsCount > 0) {
    console.log(`🛡️ Komentar portofolio sudah ada (${currentCommentsCount} data). Melewati penghapusan/seeding komentar demi proteksi data.`);
  } else {
    await sql`DELETE FROM project_comments`;
    const [firstProject] = await sql`SELECT id FROM projects LIMIT 1`;
    if (firstProject && umkmId && creatorProId) {
      await sql`
        INSERT INTO project_comments (id, project_id, user_id, content, created_at)
        VALUES 
          (${crypto.randomUUID()}, ${firstProject.id}, ${umkmId}, 'Karya visual yang sangat inspiratif dan komposisi warnanya berani!', NOW() - INTERVAL '2 hours'),
          (${crypto.randomUUID()}, ${firstProject.id}, ${creatorProId}, 'Terima kasih banyak atas apresiasi dan dukungannya!', NOW() - INTERVAL '1 hour')
      `;
      console.log('✅ Berhasil menyisipkan komentar portofolio.');
    }
  }

  console.log(`✅ Berhasil menyisipkan total ${REVIEWS_DATA.length} ulasan riil, invoice, submisi, dan ruangan kolaborasi.`);

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
