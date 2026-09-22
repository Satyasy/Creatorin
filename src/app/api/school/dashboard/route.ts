import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, schoolProfiles, projects, collaborationRooms } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    // 1. Check if user is a school partner
    const schoolData = await db
      .select({
        profileId: schoolProfiles.profileId,
        schoolName: schoolProfiles.schoolName,
        picName: schoolProfiles.picName,
        picContact: schoolProfiles.picContact,
        isVerified: schoolProfiles.isVerified,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        location: profiles.location,
      })
      .from(schoolProfiles)
      .innerJoin(profiles, eq(schoolProfiles.profileId, profiles.id))
      .where(eq(schoolProfiles.profileId, user.id))
      .limit(1);

    // If not a school profile by foreign key, fallback to check user profile role or return mockable empty structure
    const school = schoolData[0] || {
      profileId: user.id,
      schoolName: "SMK Mitra Creatorin",
      picName: "Pembina Ekstrakurikuler",
      picContact: "+62 812-3456-7890",
      isVerified: true,
      fullName: user.fullName || "SMK Mitra Creatorin",
      avatarUrl: null,
      location: "Jakarta, Indonesia",
    };

    // 2. Find all students matching this school name
    const students = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl,
        location: profiles.location,
        slug: creatorProfiles.slug,
        headline: creatorProfiles.headline,
        careerScore: creatorProfiles.careerScore,
        completedProjectsCount: creatorProfiles.completedProjectsCount,
        rating: creatorProfiles.rating,
        reviewsCount: creatorProfiles.reviewsCount,
        skills: creatorProfiles.skills,
        schoolName: creatorProfiles.schoolName,
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
      .where(eq(creatorProfiles.schoolName, school.schoolName))
      .orderBy(desc(creatorProfiles.careerScore));

    // Calculate aggregated stats
    const totalStudents = students.length;
    const totalCompletedProjects = students.reduce((acc, s) => acc + (s.completedProjectsCount || 0), 0);
    const avgRating =
      totalStudents > 0
        ? (students.reduce((acc, s) => acc + parseFloat(String(s.rating || 5)), 0) / totalStudents).toFixed(1)
        : "5.0";

    return NextResponse.json({
      school,
      students,
      stats: {
        totalStudents,
        totalCompletedProjects,
        avgRating,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
