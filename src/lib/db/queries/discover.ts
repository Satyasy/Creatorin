import { getDb } from "../index";
import { profiles, creatorProfiles, services, projects } from "../schema";
import { eq, desc } from "drizzle-orm";

// Incumbent mock data as fallback for zero-downtime Vercel preview
export const defaultServices = [
  { id: "1", title: "Desain Identitas Brand & Logo UMKM", category: "Brand Identity", price: "Rp100.000", time: "3 Hari Kerja", shape: 0 },
  { id: "2", title: "Desain Feed Instagram Aesthetic (9 Grid)", category: "Feed Instagram", price: "Rp50.000", time: "2 Hari Kerja", shape: 1 },
  { id: "3", title: "Packaging & Label Design Siap Cetak", category: "Kemasan", price: "Rp70.000", time: "3 Hari Kerja", shape: 2 },
  { id: "4", title: "Banner Promo E-Commerce & Marketplace", category: "Banner", price: "Rp120.000", time: "1 Hari Kerja", shape: 0 },
];

export const defaultMarketplaceServices = Array.from({ length: 16 }, (_, id) => ({
  id: String(id),
  title: "1x Video TikTok UGC & Review Viral",
  category: "TikTok UGC",
  creator: "Sobakhul Munir Siroj",
  description: "Pengerjaan profesional dengan jaminan kepatuhan brief dan revisi cepat.",
  estimate: "2 Hari Kerja",
  price: "Rp1.500.000",
}));

export const defaultProjects = Array.from({ length: 16 }, (_, id) => ({
  id: String(id),
  title: "Skincare Barrier Restoring Serum 14-Day Honest Review (TikTok UGC Viral)",
  creator: "@mayaangelina.ugc",
  views: "710.0K",
}));

export const defaultCreatorCards = [
  {
    slug: "qaesyaar-aqeel",
    name: "Qaesyaar Aqeel",
    avatar: "/creatorin/avatar.png",
    isPro: true,
    rating: "5",
    reviewsCount: 88,
    completedProjects: 88,
    isPromoted: true,
    startingPrice: "Mulai Rp200.000/proyek",
    location: "Bandung, Jawa Barat",
    careerScore: "95%",
    servicesCount: 10,
    skills: ["Brand Identity", "Product Photography", "Packaging", "Social Media Feed", "UI Mockups"],
    services: defaultServices,
  },
  {
    slug: "maya-angelina",
    name: "Maya Angelina",
    avatar: "/creatorin/maya-angelina.png",
    isPro: true,
    rating: "4.9",
    reviewsCount: 98,
    completedProjects: 142,
    isPromoted: true,
    startingPrice: "Mulai Rp850.000/proyek",
    location: "Jakarta Barat",
    careerScore: "95%",
    servicesCount: 8,
    skills: ["TikTok UGC", "Beauty Review", "Reels Video", "Skincare Testing", "Script Writing"],
    services: defaultServices,
  },
  {
    slug: "sobakhul-munir-siroj",
    name: "Sobakhul Munir Siroj",
    avatar: "/creatorin/avatar.png",
    isPro: false,
    rating: "4.9",
    reviewsCount: 52,
    completedProjects: 64,
    isPromoted: false,
    startingPrice: "Mulai Rp1.500.000/proyek",
    location: "Jakarta Selatan",
    careerScore: "93%",
    servicesCount: 6,
    skills: ["UI/UX Design", "Framer", "Design System", "Product Design", "Interactive Web"],
    services: defaultServices,
  },
];

export async function getDiscoverData() {
  const db = getDb();
  if (!db) {
    return {
      creators: defaultCreatorCards,
      marketplaceServices: defaultMarketplaceServices,
      projects: defaultProjects,
      isLiveDb: false,
    };
  }

  try {
    const [dbCreators, dbServices, dbProjects] = await Promise.all([
      db
        .select({
          id: profiles.id,
          name: profiles.fullName,
          avatar: profiles.avatarUrl,
          location: profiles.location,
          slug: creatorProfiles.slug,
          isPro: creatorProfiles.isPro,
          rating: creatorProfiles.rating,
          reviewsCount: creatorProfiles.reviewsCount,
          completedProjects: creatorProfiles.completedProjectsCount,
          isPromoted: creatorProfiles.isPromoted,
          startingPrice: creatorProfiles.startingPrice,
          careerScore: creatorProfiles.careerScore,
          skills: creatorProfiles.skills,
        })
        .from(profiles)
        .innerJoin(creatorProfiles, eq(profiles.id, creatorProfiles.profileId))
        .limit(10),

      db
        .select({
          id: services.id,
          title: services.title,
          category: services.category,
          description: services.description,
          price: services.price,
          estimate: services.estimatedDays,
          creatorName: profiles.fullName,
          creatorAvatar: profiles.avatarUrl,
          creatorSlug: creatorProfiles.slug,
        })
        .from(services)
        .innerJoin(profiles, eq(services.creatorId, profiles.id))
        .leftJoin(creatorProfiles, eq(profiles.id, creatorProfiles.profileId))
        .where(eq(services.isActive, true))
        .orderBy(desc(services.createdAt))
        .limit(20),

      db
        .select({
          id: projects.id,
          title: projects.title,
          creator: projects.creatorHandle,
          views: projects.viewsCount,
        })
        .from(projects)
        .orderBy(desc(projects.createdAt))
        .limit(20),
    ]);

    if (dbCreators.length === 0 && dbServices.length === 0) {
      return {
        creators: defaultCreatorCards,
        marketplaceServices: defaultMarketplaceServices,
        projects: defaultProjects,
        isLiveDb: false,
      };
    }

    return {
      creators: dbCreators.map((c) => ({
        slug: c.slug,
        name: c.name,
        avatar: c.avatar || "/creatorin/avatar.png",
        isPro: c.isPro,
        rating: String(c.rating),
        reviewsCount: c.reviewsCount,
        completedProjects: c.completedProjects,
        isPromoted: c.isPromoted,
        startingPrice: c.startingPrice,
        location: c.location || "Indonesia",
        careerScore: `${c.careerScore}%`,
        servicesCount: 4,
        skills: c.skills,
        services: defaultServices,
      })),
      marketplaceServices: dbServices.map((s, idx) => ({
        id: s.id || String(idx),
        title: s.title,
        category: s.category,
        creator: s.creatorName,
        creatorSlug: s.creatorSlug || "creator",
        description: s.description,
        estimate: s.estimate,
        price: s.price,
      })),
      projects: dbProjects.map((p, idx) => ({
        id: p.id || String(idx),
        title: p.title,
        creator: p.creator,
        views: p.views,
      })),
      isLiveDb: true,
    };
  } catch (error) {
    console.warn("Falling back to default discover dataset:", error);
    return {
      creators: defaultCreatorCards,
      marketplaceServices: defaultMarketplaceServices,
      projects: defaultProjects,
      isLiveDb: false,
    };
  }
}
