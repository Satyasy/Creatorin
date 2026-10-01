import { getDb } from "../index";
import { profiles, creatorProfiles, services, projects, reviews } from "../schema";
import { eq, desc } from "drizzle-orm";

export const fallbackCreators = {
  "maya-angelina": {
    name: "Maya Angelina",
    avatar: "/creatorin/maya-angelina.png",
    headline: "Beauty & Lifestyle TikTok Content Creator",
    projects: "142+",
    rating: "4.9",
    reviews: "98",
    followers: "4.827",
    score: "95%",
    location: "Jakarta Barat",
    school: "SMK Telkom Sidoarjo",
    bio: "We are Kreativa Studio, a forward-thinking digital design studio delivering meticulous experiences that connect with people.",
    skills: ["app ui", "branding", "dashboard", "design systems", "development", "front end development", "icons", "illustration", "mobile", "product design", "strategy", "ui", "ux", "web design", "website ui", "wordpress"],
    languages: ["English", "Indonesia", "Jawa"],
  },
  "qaesyaar-aqeel": {
    name: "Qaesyaar Aqeel",
    avatar: "/creatorin/avatar.png",
    headline: "Brand Identity & Digital Content Creator",
    projects: "88+",
    rating: "5.0",
    reviews: "88",
    followers: "3.240",
    score: "95%",
    location: "Bandung, Jawa Barat",
    school: "Institut Teknologi Bandung",
    bio: "Passionate brand designer with 6+ years transforming Indonesian local businesses into iconic digital brands.",
    skills: ["Brand Identity", "Packaging", "Social Media Feed", "Logo Design", "Typography", "Art Direction"],
    languages: ["Indonesia", "English", "Sunda"],
  },
  "sobakhul-munir-siroj": {
    name: "Sobakhul Munir Siroj",
    avatar: "/creatorin/avatar.png",
    headline: "TikTok UGC & Product Review Creator",
    projects: "64+",
    rating: "4.9",
    reviews: "52",
    followers: "2.913",
    score: "93%",
    location: "Jakarta Selatan",
    school: "Creatorin Academy",
    bio: "Helping D2C and consumer brands convert eyeballs into customers through authentic high-retention UGC hooks.",
    skills: ["TikTok UGC", "Scriptwriting", "Video Editing", "CapCut", "Product Staging", "Voice Over"],
    languages: ["Indonesia", "English"],
  },
} as const;

export async function getCreatorBySlug(slug: string) {
  const db = getDb();
  const fallback = fallbackCreators[slug as keyof typeof fallbackCreators] || fallbackCreators["maya-angelina"];

  if (!db) {
    return { creator: fallback, isLiveDb: false };
  }

  try {
    const rows = await db
      .select({
        id: profiles.id,
        name: profiles.fullName,
        avatar: profiles.avatarUrl,
        location: profiles.location,
        slug: creatorProfiles.slug,
        headline: creatorProfiles.headline,
        bio: creatorProfiles.bio,
        careerScore: creatorProfiles.careerScore,
        completedProjects: creatorProfiles.completedProjectsCount,
        rating: creatorProfiles.rating,
        reviewsCount: creatorProfiles.reviewsCount,
        followers: creatorProfiles.followersCount,
        school: creatorProfiles.schoolName,
        skills: creatorProfiles.skills,
        languages: creatorProfiles.languages,
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
      .where(eq(creatorProfiles.slug, slug))
      .limit(1);

    if (rows.length === 0) {
      return { creator: fallback, isLiveDb: false };
    }

    const row = rows[0];
    return {
      creator: {
        name: row.name,
        avatar: row.avatar || "/creatorin/avatar.png",
        headline: row.headline,
        projects: `${row.completedProjects}+`,
        rating: String(row.rating),
        reviews: String(row.reviewsCount),
        followers: row.followers,
        score: `${row.careerScore}%`,
        location: row.location || "Indonesia",
        school: row.school || "Creatorin Academy",
        bio: row.bio || fallback.bio,
        skills: row.skills && row.skills.length > 0 ? row.skills : fallback.skills,
        languages: row.languages && row.languages.length > 0 ? row.languages : fallback.languages,
      },
      isLiveDb: true,
    };
  } catch (error) {
    console.warn(`Error fetching creator profile ${slug}, falling back:`, error);
    return { creator: fallback, isLiveDb: false };
  }
}
