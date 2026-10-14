import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCache, setCache, deleteCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const db = getDb();

  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  if (slug) {
    const cacheKey = `profile:slug:${slug}`;
    const cached = await getCache<{ creator: any }>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached, _source: "redis" });
    }

    const [creator] = await db
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
      })
      .from(creatorProfiles)
      .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
      .where(eq(creatorProfiles.slug, slug))
      .limit(1);

    if (!creator) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await setCache(cacheKey, { creator }, 300);
    return NextResponse.json({ creator });
  }

  // Otherwise return authenticated user's profile
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const body = await req.json();
  const { fullName, phone, location, avatarUrl, headline, bio, skills, startingPrice } = body;

  try {
    if (fullName !== undefined || phone !== undefined || location !== undefined || avatarUrl !== undefined) {
      await db
        .update(profiles)
        .set({
          fullName: fullName !== undefined ? fullName : undefined,
          phone: phone !== undefined ? phone : undefined,
          location: location !== undefined ? location : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id));
    }

    if (user.role === "creator" && (headline !== undefined || bio !== undefined || skills !== undefined || startingPrice !== undefined)) {
      await db
        .insert(creatorProfiles)
        .values({
          profileId: user.id,
          slug: `creator-${user.id.slice(0, 8)}`,
          headline: headline || "Kreator Konten",
          bio,
          skills: skills || [],
          startingPrice: startingPrice || "",
        })
        .onConflictDoUpdate({
          target: creatorProfiles.profileId,
          set: {
            headline: headline !== undefined ? headline : undefined,
            bio: bio !== undefined ? bio : undefined,
            skills: skills !== undefined ? skills : undefined,
            startingPrice: startingPrice !== undefined ? startingPrice : undefined,
          },
        });
    }

    if (user.role === "business" && bio !== undefined) {
      await db
        .insert(businessProfiles)
        .values({
          profileId: user.id,
          companyName: user.fullName || "Perusahaan",
          businessCategory: "Umum",
          description: bio,
        })
        .onConflictDoUpdate({
          target: businessProfiles.profileId,
          set: { description: bio },
        });
    }

    // Invalidate cached profiles, creator listings, and user session details
    await Promise.all([
      deleteCache("profile:slug:*"),
      deleteCache("creators:*"),
      deleteCache(`user:me:${user.id}`),
    ]);

    return NextResponse.json({ success: true, message: "Profil berhasil diperbarui." });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
