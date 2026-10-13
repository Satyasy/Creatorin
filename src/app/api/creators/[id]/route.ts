import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, services, projects, reviews, collaborationRooms } from "@/lib/db/schema";
import { eq, or, desc, and } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    // 1. Fetch Creator Profile (by UUID or slug)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const creatorQuery = db
      .select({
        id: profiles.id,
        role: profiles.role,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        phone: profiles.phone,
        location: profiles.location,
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
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id));

    const strippedId = id.replace(/^creator-/, '');
    const creatorList = isUuid
      ? await creatorQuery.where(eq(profiles.id, id)).limit(1)
      : await creatorQuery
          .where(or(eq(creatorProfiles.slug, id), eq(creatorProfiles.slug, strippedId)))
          .limit(1);

    if (!creatorList || creatorList.length === 0) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const creator = creatorList[0];

    // 2. Parallel fetch services, projects, reviews, and completed rooms
    const [creatorServices, creatorProjects, creatorReviews, completedRooms] = await Promise.all([
      db
        .select()
        .from(services)
        .where(and(eq(services.creatorId, creator.id), eq(services.isActive, true)))
        .orderBy(desc(services.createdAt)),
      db
        .select()
        .from(projects)
        .where(eq(projects.creatorId, creator.id))
        .orderBy(desc(projects.createdAt)),
      db
        .select()
        .from(reviews)
        .where(eq(reviews.creatorId, creator.id))
        .orderBy(desc(reviews.createdAt)),
      db
        .select({ id: collaborationRooms.id })
        .from(collaborationRooms)
        .where(and(eq(collaborationRooms.creatorId, creator.id), eq(collaborationRooms.status, "completed"))),
    ]);

    return NextResponse.json({
      creator: {
        ...creator,
        completedProjectsCount: Math.max(creator.completedProjectsCount, completedRooms.length),
        schoolBadge: creator.schoolName
          ? {
              schoolName: creator.schoolName,
              verified: true,
            }
          : null,
      },
      services: creatorServices,
      projects: creatorProjects,
      reviews: creatorReviews,
      stats: {
        totalServices: creatorServices.length,
        totalProjects: creatorProjects.length,
        totalReviews: creatorReviews.length,
        completedCollaborations: completedRooms.length,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
