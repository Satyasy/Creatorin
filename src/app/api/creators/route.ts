import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { MOCK_CREATORS } from "@/data/mockCreators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();
  const location = searchParams.get("location")?.toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  const db = getDb();
  if (!db) {
    let list = MOCK_CREATORS;
    if (search) {
      list = list.filter(c => c.name.toLowerCase().includes(search) || c.skills.some(s => s.toLowerCase().includes(search)));
    }
    if (category) {
      list = list.filter(c => c.category?.toLowerCase() === category || c.skills.some(s => s.toLowerCase().includes(category)));
    }
    return NextResponse.json({
      creators: list.slice(0, limit).map(c => ({
        id: c.id,
        fullName: c.name,
        avatarUrl: c.avatar,
        location: c.location,
        slug: c.username || c.id,
        headline: c.roleTitle,
        bio: c.bio,
        careerScore: c.careerScore?.overall || 90,
        completedProjectsCount: c.careerScore?.completedProjects || 10,
        rating: c.rating || 5.0,
        reviewsCount: c.reviewCount || 12,
        followersCount: c.followersCount || 1000,
        startingPrice: c.formattedRate,
        skills: c.skills,
        isPro: c.proBadge,
      }))
    });
  }

  try {
    const rows = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        location: profiles.location,
        phone: profiles.phone,
        slug: creatorProfiles.slug,
        headline: creatorProfiles.headline,
        bio: creatorProfiles.bio,
        careerScore: creatorProfiles.careerScore,
        completedProjectsCount: creatorProfiles.completedProjectsCount,
        rating: creatorProfiles.rating,
        reviewsCount: creatorProfiles.reviewsCount,
        followersCount: creatorProfiles.followersCount,
        schoolName: creatorProfiles.schoolName,
        startingPrice: creatorProfiles.startingPrice,
        skills: creatorProfiles.skills,
        languages: creatorProfiles.languages,
        isPro: creatorProfiles.isPro,
        isPromoted: creatorProfiles.isPromoted,
        responseTime: creatorProfiles.responseTime,
        onTimeRate: creatorProfiles.onTimeRate,
        createdAt: creatorProfiles.createdAt,
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
      .orderBy(desc(creatorProfiles.careerScore))
      .limit(limit);

    let filtered = rows;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.fullName.toLowerCase().includes(search) ||
          c.headline?.toLowerCase().includes(search) ||
          c.bio?.toLowerCase().includes(search) ||
          c.skills?.some((s: string) => s.toLowerCase().includes(search))
      );
    }

    if (category) {
      filtered = filtered.filter(
        (c) =>
          c.skills?.some((s: string) => s.toLowerCase().includes(category)) ||
          c.headline?.toLowerCase().includes(category)
      );
    }

    if (location) {
      filtered = filtered.filter((c) => c.location?.toLowerCase().includes(location));
    }

    return NextResponse.json({ creators: filtered, total: filtered.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
