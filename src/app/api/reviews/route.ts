import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { reviews, creatorProfiles } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    let q = db.select().from(reviews).orderBy(desc(reviews.createdAt));
    const rows = await q;
    const filtered = creatorId ? rows.filter((r) => r.creatorId === creatorId) : rows;

    return NextResponse.json({ reviews: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { creatorId, roomId, projectTitle, rating = 5.0, comment } = body;

  if (!creatorId || !projectTitle || !comment) {
    return NextResponse.json({ error: "Data review belum lengkap." }, { status: 400 });
  }

  try {
    const today = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "long", year: "numeric" }).format(new Date());

    const [newReview] = await db
      .insert(reviews)
      .values({
        creatorId,
        reviewerId: user.id,
        roomId,
        reviewerName: user.fullName,
        reviewerRole: user.role === "business" ? "Klien Bisnis / UMKM" : "Klien",
        reviewerAvatar: "/creatorin/avatar.png",
        projectTitle,
        rating: String(rating),
        comment,
        completedDate: today,
      })
      .returning();

    // Increment creator review count
    await db
      .update(creatorProfiles)
      .set({
        reviewsCount: sql`${creatorProfiles.reviewsCount} + 1`,
      })
      .where(eq(creatorProfiles.profileId, creatorId));

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
