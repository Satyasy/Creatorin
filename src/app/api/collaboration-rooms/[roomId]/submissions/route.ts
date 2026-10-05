import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, notifications } from "@/lib/db/schema";
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

    if (room.creatorId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Hanya kreator proyek ini yang dapat mengunggah hasil karya." }, { status: 403 });
    }

    const body = await req.json();
    const { title, notes, fileUrls = [] } = body;

    if (!title && !notes && fileUrls.length === 0) {
      return NextResponse.json({ error: "Judul, catatan, atau tautan file wajib disertakan." }, { status: 400 });
    }

    // Determine latest version
    const [latestSub] = await db
      .select({ version: submissions.version })
      .from(submissions)
      .where(eq(submissions.roomId, roomId))
      .orderBy(desc(submissions.version))
      .limit(1);

    const nextVersion = (latestSub?.version || 0) + 1;

    const [newSubmission] = await db
      .insert(submissions)
      .values({
        roomId,
        version: nextVersion,
        notes: title ? `${title}: ${notes || ''}`.trim() : notes,
        fileUrls: Array.isArray(fileUrls) ? fileUrls : [fileUrls],
        status: "pending",
      })
      .returning();

    // Update room status to review_pending
    await db
      .update(collaborationRooms)
      .set({ status: "review_pending" })
      .where(eq(collaborationRooms.id, roomId));

    // Notify UMKM
    await db.insert(notifications).values({
      userId: room.businessId,
      type: "collaboration",
      title: "Draft baru diunggah",
      body: `Kreator telah mengunggah hasil karya versi ${nextVersion} untuk "${room.title}".`,
      linkUrl: `/chat`,
    });

    return NextResponse.json({ success: true, submission: newSubmission });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
