import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set in .env or .env.local. Please provide your Supabase Postgres URL.");
  process.exit(1);
}

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function seed() {
  console.log("Starting Creatorin database seed...");

  const creator1Id = "11111111-1111-1111-1111-111111111111";
  const creator2Id = "22222222-2222-2222-2222-222222222222";
  const creator3Id = "33333333-3333-3333-3333-333333333333";
  const businessId = "44444444-4444-4444-4444-444444444444";

  // 1. Seed Profiles
  console.log("Seeding profiles...");
  await db.insert(schema.profiles).values([
    {
      id: creator1Id,
      role: "creator",
      fullName: "Maya Angelina",
      avatarUrl: "/creatorin/maya-angelina.png",
      phone: "+628123456789",
      location: "Jakarta Barat",
    },
    {
      id: creator2Id,
      role: "creator",
      fullName: "Qaesyaar Aqeel",
      avatarUrl: "/creatorin/avatar.png",
      phone: "+628198765432",
      location: "Bandung, Jawa Barat",
    },
    {
      id: creator3Id,
      role: "creator",
      fullName: "Sobakhul Munir Siroj",
      avatarUrl: "/creatorin/avatar.png",
      phone: "+628135792468",
      location: "Jakarta Selatan",
    },
    {
      id: businessId,
      role: "business",
      fullName: "GlowLab Skincare Indonesia",
      avatarUrl: "/creatorin/sarah-kurniawan.png",
      phone: "+628111222333",
      location: "Jakarta Pusat",
    },
  ]).onConflictDoNothing();

  // 2. Seed Creator Profiles
  console.log("Seeding creator profiles...");
  await db.insert(schema.creatorProfiles).values([
    {
      profileId: creator1Id,
      slug: "maya-angelina",
      headline: "Beauty & Lifestyle TikTok Content Creator",
      bio: "Kreator konten spesialis video UGC, review produk kecantikan & gaya hidup dengan engagement tinggi.",
      careerScore: 95,
      completedProjectsCount: 142,
      rating: "4.9",
      reviewsCount: 98,
      followersCount: "4.827",
      schoolName: "SMK Telkom Sidoarjo",
      startingPrice: "Mulai Rp850.000/proyek",
      skills: ["TikTok UGC", "Beauty Review", "Reels Video", "Skincare Testing", "Script Writing"],
      languages: ["Indonesia", "English", "Jawa"],
      isPro: true,
      isPromoted: true,
    },
    {
      profileId: creator2Id,
      slug: "qaesyaar-aqeel",
      headline: "Brand Identity & Digital Content Creator",
      bio: "Membantu UMKM dan brand lokal membangun identitas visual berkelas dunia dengan standar komersial tinggi.",
      careerScore: 95,
      completedProjectsCount: 88,
      rating: "5.0",
      reviewsCount: 88,
      followersCount: "3.240",
      schoolName: "Institut Teknologi Bandung",
      startingPrice: "Mulai Rp200.000/proyek",
      skills: ["Brand Identity", "Packaging", "Social Media Feed", "Logo Design", "Typography"],
      languages: ["Indonesia", "English", "Sunda"],
      isPro: true,
      isPromoted: true,
    },
    {
      profileId: creator3Id,
      slug: "sobakhul-munir-siroj",
      headline: "TikTok UGC & Product Review Creator",
      bio: "Fokus pada pembuatan video konversi tinggi untuk campaign TikTok, e-commerce, dan marketplace.",
      careerScore: 93,
      completedProjectsCount: 64,
      rating: "4.9",
      reviewsCount: 52,
      followersCount: "2.913",
      schoolName: "Creatorin Academy",
      startingPrice: "Mulai Rp1.500.000/proyek",
      skills: ["UI/UX Design", "Framer", "Design System", "Product Design", "Interactive Web"],
      languages: ["Indonesia", "English"],
      isPro: false,
      isPromoted: false,
    },
  ]).onConflictDoNothing();

  // 3. Seed Business Profile
  console.log("Seeding business profile...");
  await db.insert(schema.businessProfiles).values([
    {
      profileId: businessId,
      companyName: "GlowLab Skincare",
      businessCategory: "Beauty & Cosmetics",
      description: "Brand skincare lokal yang berfokus pada barrier restoring treatment berbasis riset dermatologi.",
      website: "https://glowlab.id",
    },
  ]).onConflictDoNothing();

  // 4. Seed Services
  console.log("Seeding services...");
  await db.insert(schema.services).values([
    {
      creatorId: creator3Id,
      title: "1x Video TikTok UGC & Review Viral",
      category: "TikTok UGC",
      description: "Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.",
      price: "Rp1.500.000",
      priceNumeric: 1500000,
      estimatedDays: "2 Hari Kerja",
      shapeIdx: 0,
      isActive: true,
    },
    {
      creatorId: creator2Id,
      title: "Desain Identitas Brand & Logo UMKM",
      category: "Brand Identity",
      description: "Paket lengkap logo, filosofi warna, dan panduan visual untuk brand berkembang.",
      price: "Rp100.000",
      priceNumeric: 100000,
      estimatedDays: "3 Hari Kerja",
      shapeIdx: 0,
      isActive: true,
    },
    {
      creatorId: creator2Id,
      title: "Desain Feed Instagram Aesthetic (9 Grid)",
      category: "Feed Instagram",
      description: "Template grid feed terstruktur untuk meningkatkan engagement dan citra brand di media sosial.",
      price: "Rp50.000",
      priceNumeric: 50000,
      estimatedDays: "2 Hari Kerja",
      shapeIdx: 1,
      isActive: true,
    },
    {
      creatorId: creator1Id,
      title: "1x Video Unboxing & First Impression",
      category: "Product Review",
      description: "Ulasan jujur dan estetik produk skincare/lifestyle langsung di hadapan kamera.",
      price: "Rp850.000",
      priceNumeric: 850000,
      estimatedDays: "2 Hari Kerja",
      shapeIdx: 2,
      isActive: true,
    },
  ]).onConflictDoNothing();

  // 5. Seed Projects
  console.log("Seeding projects...");
  await db.insert(schema.projects).values([
    {
      creatorId: creator1Id,
      title: "Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)",
      description: "Uji coba harian serum barrier kulit selama 14 hari dengan dokumentasi makro sebelum dan sesudah.",
      creatorHandle: "@mayaangelina.ugc",
      viewsCount: "710.0K",
      mediaType: "shader",
    },
    {
      creatorId: creator3Id,
      title: "Tips bertahan as Product Designer di 2026 ditengah gempuran AI bot :(",
      description: "Diskusi visual mengenai diferensiasi nilai craft desainer produk manusia.",
      creatorHandle: "@munirs.design",
      viewsCount: "185.4K",
      mediaType: "shader",
    },
  ]).onConflictDoNothing();

  // 6. Seed Reviews
  console.log("Seeding reviews...");
  await db.insert(schema.reviews).values([
    {
      creatorId: creator3Id,
      reviewerId: businessId,
      reviewerName: "Sarah Kurniawan",
      reviewerRole: "Founder, GlowLab Skincare",
      reviewerAvatar: "/creatorin/sarah-kurniawan.png",
      projectTitle: "Desain Landing Page & Mobile UI Kit Kosmetik",
      rating: "5.0",
      comment: "Kerja sama yang sangat memuaskan dari awal brief hingga serah terima. Mas Munir sangat responsif di room chat Creatorin, memahami kebutuhan visual brand kami tanpa perlu banyak revisi, dan deliverable Figma-nya terstruktur rapi.",
      completedDate: "12 September 2026",
    },
    {
      creatorId: creator2Id,
      reviewerId: businessId,
      reviewerName: "Budi Pratama",
      reviewerRole: "Marketing Lead, Kopi Karsa",
      reviewerAvatar: "/creatorin/budi-pratama.png",
      projectTitle: "Redesign Website Interaktif & Brand Guideline",
      rating: "5.0",
      comment: "Hasil pengerjaan website Framer-nya jauh melampaui ekspektasi. Interaksi animasinya sangat halus dan konversi campaign kopi kami naik drastis sejak peluncuran.",
      completedDate: "28 Agustus 2026",
    },
  ]).onConflictDoNothing();

  // 7. Seed Creator Wallet
  console.log("Seeding creator wallets...");
  await db.insert(schema.creatorWallets).values([
    {
      creatorId: creator1Id,
      balance: 4500000,
      points: 250,
    },
    {
      creatorId: creator2Id,
      balance: 6200000,
      points: 380,
    },
    {
      creatorId: creator3Id,
      balance: 3800000,
      points: 190,
    },
  ]).onConflictDoNothing();

  console.log("Seed completed successfully!");
  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
