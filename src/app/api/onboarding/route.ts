import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles, schoolProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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
    const profileRows = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    if (profileRows.length === 0) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const profile = profileRows[0];
    let roleData = null;
    let isComplete = false;

    if (profile.role === "creator") {
      const rows = await db.select().from(creatorProfiles).where(eq(creatorProfiles.profileId, user.id)).limit(1);
      roleData = rows[0] || null;
      isComplete = Boolean(roleData?.headline && roleData?.skills && (roleData.skills as string[]).length > 0);
    } else if (profile.role === "business") {
      const rows = await db.select().from(businessProfiles).where(eq(businessProfiles.profileId, user.id)).limit(1);
      roleData = rows[0] || null;
      isComplete = Boolean(roleData?.companyName && roleData?.businessCategory);
    } else if (profile.role === "school") {
      const rows = await db.select().from(schoolProfiles).where(eq(schoolProfiles.profileId, user.id)).limit(1);
      roleData = rows[0] || null;
      isComplete = Boolean(roleData?.schoolName && roleData?.picName);
    }

    return NextResponse.json({
      profile,
      roleData,
      isOnboardingComplete: isComplete,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      phone,
      location,
      avatarUrl,
      // Creator fields
      headline,
      bio,
      skills,
      startingPrice,
      schoolName,
      // Business fields
      companyName,
      businessCategory,
      description,
      website,
      // School fields
      picName,
      picContact,
    } = body;

    // 1. Update basic profile
    await db
      .update(profiles)
      .set({
        ...(fullName && { fullName }),
        ...(phone !== undefined && { phone }),
        ...(location !== undefined && { location }),
        ...(avatarUrl !== undefined && { avatarUrl }),
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id));

    // 2. Update role-specific table
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

    if (profile.role === "creator") {
      const slug = (fullName || profile.fullName).toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + user.id.slice(0, 4);
      await db
        .insert(creatorProfiles)
        .values({
          profileId: user.id,
          slug,
          headline: headline || "Creative Specialist",
          bio: bio || "",
          skills: skills || [],
          startingPrice: startingPrice || "Mulai Rp100.000",
          schoolName: schoolName || null,
        })
        .onConflictDoUpdate({
          target: creatorProfiles.profileId,
          set: {
            ...(headline && { headline }),
            ...(bio !== undefined && { bio }),
            ...(skills && { skills }),
            ...(startingPrice && { startingPrice }),
            ...(schoolName !== undefined && { schoolName }),
          },
        });
    } else if (profile.role === "business") {
      await db
        .insert(businessProfiles)
        .values({
          profileId: user.id,
          companyName: companyName || fullName || "UMKM Partner",
          businessCategory: businessCategory || "Retail / Brand",
          description: description || "",
          website: website || null,
        })
        .onConflictDoUpdate({
          target: businessProfiles.profileId,
          set: {
            ...(companyName && { companyName }),
            ...(businessCategory && { businessCategory }),
            ...(description !== undefined && { description }),
            ...(website !== undefined && { website }),
          },
        });
    } else if (profile.role === "school") {
      await db
        .insert(schoolProfiles)
        .values({
          profileId: user.id,
          schoolName: schoolName || fullName || "Sekolah Mitra",
          picName: picName || "Penanggung Jawab",
          picContact: picContact || phone || null,
        })
        .onConflictDoUpdate({
          target: schoolProfiles.profileId,
          set: {
            ...(schoolName && { schoolName }),
            ...(picName && { picName }),
            ...(picContact !== undefined && { picContact }),
          },
        });
    }

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
