import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const category = searchParams.get("category")?.toLowerCase();
  const location = searchParams.get("location")?.toLowerCase();
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

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
