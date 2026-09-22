import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, projects, services, reviews } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    const studentData = await db
      .select({
        id: profiles.id,
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
        skills: creatorProfiles.skills,
        schoolName: creatorProfiles.schoolName,
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
      .where(eq(profiles.id, id))
      .limit(1);

    if (studentData.length === 0) {
      return NextResponse.json({ error: "Student creator not found" }, { status: 404 });
    }

    const student = studentData[0];

    const [studentProjects, studentServices, studentReviews] = await Promise.all([
      db.select().from(projects).where(eq(projects.creatorId, id)).orderBy(desc(projects.createdAt)),
      db.select().from(services).where(eq(services.creatorId, id)).orderBy(desc(services.createdAt)),
      db.select().from(reviews).where(eq(reviews.creatorId, id)).orderBy(desc(reviews.createdAt)),
    ]);

    return NextResponse.json({
      student,
      projects: studentProjects,
      services: studentServices,
      reviews: studentReviews,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
