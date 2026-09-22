import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projectBriefs, briefApplications, profiles, creatorProfiles, businessProfiles } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    // 1. Get the brief details
    const briefRows = await db
      .select({
        id: projectBriefs.id,
        businessId: projectBriefs.businessId,
        title: projectBriefs.title,
        category: projectBriefs.category,
        description: projectBriefs.description,
        expectedOutput: projectBriefs.expectedOutput,
        budget: projectBriefs.budget,
        deadline: projectBriefs.deadline,
        status: projectBriefs.status,
        createdAt: projectBriefs.createdAt,
        companyName: businessProfiles.companyName,
        businessCategory: businessProfiles.businessCategory,
        businessAvatar: profiles.avatarUrl,
        businessLocation: profiles.location,
      })
      .from(projectBriefs)
      .innerJoin(profiles, eq(projectBriefs.businessId, profiles.id))
      .leftJoin(businessProfiles, eq(profiles.id, businessProfiles.profileId))
      .where(eq(projectBriefs.id, id))
      .limit(1);

    if (!briefRows || briefRows.length === 0) {
      return NextResponse.json({ error: "Brief not found" }, { status: 404 });
    }

    const brief = briefRows[0];

    // 2. If the user is the owner (Business), load applications with creator profiles
    let applications: any[] = [];
    let myApplication = null;

    if (user && user.id === brief.businessId) {
      const apps = await db
        .select({
          id: briefApplications.id,
          briefId: briefApplications.briefId,
          creatorId: briefApplications.creatorId,
          pitch: briefApplications.pitch,
          proposedPrice: briefApplications.proposedPrice,
          status: briefApplications.status,
          createdAt: briefApplications.createdAt,
          creatorName: profiles.fullName,
          creatorAvatar: profiles.avatarUrl,
          creatorLocation: profiles.location,
          creatorSlug: creatorProfiles.slug,
          creatorHeadline: creatorProfiles.headline,
          creatorRating: creatorProfiles.rating,
          creatorSkills: creatorProfiles.skills,
        })
        .from(briefApplications)
        .innerJoin(profiles, eq(briefApplications.creatorId, profiles.id))
        .leftJoin(creatorProfiles, eq(profiles.id, creatorProfiles.profileId))
        .where(eq(briefApplications.briefId, id))
        .orderBy(desc(briefApplications.createdAt));

      applications = apps;
    } else if (user) {
      // Check if this user (as creator) has applied
      const myApp = await db
        .select()
        .from(briefApplications)
        .where(and(eq(briefApplications.briefId, id), eq(briefApplications.creatorId, user.id)))
        .limit(1);

      if (myApp.length > 0) {
        myApplication = myApp[0];
      }
    }

    return NextResponse.json({
      brief,
      applications: applications.length > 0 ? applications : undefined,
      applicationsCount: applications.length,
      myApplication,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(
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
    const existing = await db
      .select()
      .from(projectBriefs)
      .where(and(eq(projectBriefs.id, id), eq(projectBriefs.businessId, user.id)))
      .limit(1);

    if (!existing || existing.length === 0) {
      return NextResponse.json({ error: "Brief not found or permission denied" }, { status: 404 });
    }

    const body = await req.json();
    const { title, category, description, expectedOutput, budget, deadline, status } = body;

    const [updated] = await db
      .update(projectBriefs)
      .set({
        ...(title && { title }),
        ...(category && { category }),
        ...(description && { description }),
        ...(expectedOutput !== undefined && { expectedOutput }),
        ...(budget && { budget }),
        ...(deadline !== undefined && { deadline }),
        ...(status && { status }),
      })
      .where(eq(projectBriefs.id, id))
      .returning();

    return NextResponse.json({ brief: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
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
    const [deleted] = await db
      .delete(projectBriefs)
      .where(and(eq(projectBriefs.id, id), eq(projectBriefs.businessId, user.id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Brief not found or permission denied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Brief deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
