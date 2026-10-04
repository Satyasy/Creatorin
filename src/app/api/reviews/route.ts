import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { reviews, creatorProfiles, collaborationRooms } from "@/lib/db/schema";
import { and, eq, desc, sql } from "drizzle-orm";

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
  const { creatorId, roomId, projectTitle, rating, comment } = body;

  if (!creatorId || !roomId || !projectTitle || !comment || !Number.isFinite(Number(rating)) || Number(rating) < 1 || Number(rating) > 5 || user.role !== 'business') {
    return NextResponse.json({ error: "Data review belum lengkap." }, { status: 400 });
  }

  try {
    const [room] = await db.select().from(collaborationRooms).where(and(
      eq(collaborationRooms.id, roomId), eq(collaborationRooms.businessId, user.id),
      eq(collaborationRooms.creatorId, creatorId), eq(collaborationRooms.status, 'completed')
    )).limit(1);
    if (!room) return NextResponse.json({ error: 'Kolaborasi belum selesai atau tidak dapat diulas.' }, { status: 403 });
    const [existing] = await db.select({ id: reviews.id }).from(reviews).where(eq(reviews.roomId, roomId)).limit(1);
    if (existing) return NextResponse.json({ error: 'Kolaborasi ini sudah diulas.' }, { status: 409 });
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

    const [summary] = await db.select({ count: sql<number>`count(*)::int`, average: sql<string>`round(avg(${reviews.rating})::numeric, 1)` }).from(reviews).where(eq(reviews.creatorId, creatorId));
    await db
      .update(creatorProfiles)
      .set({
        reviewsCount: summary.count,
        rating: summary.average,
      })
      .where(eq(creatorProfiles.profileId, creatorId));

    return NextResponse.json({ success: true, review: newReview }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
