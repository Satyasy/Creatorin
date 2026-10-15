import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, revisions, invoices, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [room] = await db
      .select()
      .from(collaborationRooms)
      .where(eq(collaborationRooms.id, roomId))
      .limit(1);

    if (!room) {
      return NextResponse.json({ error: "Collaboration room tidak ditemukan" }, { status: 404 });
    }

    // Access check: only participants or admin can access
    if (room.creatorId !== user.id && room.businessId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch related invoice
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, room.invoiceId))
      .limit(1);

    // Fetch submissions
    const submissionList = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, room.id))
      .orderBy(desc(submissions.version));

    // Fetch revisions
    const revisionList = await db
      .select()
      .from(revisions)
      .where(eq(revisions.roomId, room.id))
      .orderBy(desc(revisions.requestedAt));

    // Fetch creator and business profiles
    const [creatorProfile] = await db
      .select({ id: profiles.id, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.id, room.creatorId))
      .limit(1);

    const [businessProfile] = await db
      .select({ id: profiles.id, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.id, room.businessId))
      .limit(1);

    return NextResponse.json({
      room,
      invoice,
      submissions: submissionList,
      revisions: revisionList,
      creator: creatorProfile,
      business: businessProfile,
      myRole: room.creatorId === user.id ? "creator" : "umkm",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
