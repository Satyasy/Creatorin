import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, revisions, notifications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ roomId: string }> }) {
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

    if (room.businessId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Hanya UMKM klien proyek ini yang dapat meminta revisi." }, { status: 403 });
    }

    const body = await req.json();
    const { feedback } = body;

    if (!feedback || !feedback.trim()) {
      return NextResponse.json({ error: "Catatan revisi wajib diisi." }, { status: 400 });
    }

    // Find latest submission
    const [latestSub] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, roomId))
      .orderBy(desc(submissions.version))
      .limit(1);

    if (!latestSub) {
      return NextResponse.json({ error: "Belum ada draf hasil karya untuk direvisi." }, { status: 400 });
    }

    // Insert revision
    const [newRevision] = await db
      .insert(revisions)
      .values({
        roomId,
        submissionId: latestSub.id,
        feedback: feedback.trim(),
      })
      .returning();

    // Update submission status
    await db
      .update(submissions)
      .set({ status: "revision_requested" })
      .where(eq(submissions.id, latestSub.id));

    // Update room status
    await db
      .update(collaborationRooms)
      .set({ status: "revision_requested" })
      .where(eq(collaborationRooms.id, roomId));

    // Notify Creator
    await db.insert(notifications).values({
      userId: room.creatorId,
      type: "collaboration",
      title: "Catatan revisi diterima",
      body: `UMKM mengajukan revisi untuk "${room.title}": "${feedback.slice(0, 60)}..."`,
      linkUrl: `/chat`,
    });

    return NextResponse.json({ success: true, revision: newRevision });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
