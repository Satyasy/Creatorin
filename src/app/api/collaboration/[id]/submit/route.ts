import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { submissions, collaborationRooms, notifications, profiles } from "@/lib/db/schema";
import { sendCriticalEmail } from '@/lib/email';
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { notes, fileUrls = [] } = body;

  try {
    const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, roomId)).limit(1);
    if (!room) return NextResponse.json({ error: 'Collaboration Room tidak ditemukan' }, { status: 404 });
    if (user.id !== room.creatorId) return NextResponse.json({ error: 'Hanya Creator proyek yang dapat mengunggah hasil.' }, { status: 403 });
    const existing = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, roomId))
      .orderBy(desc(submissions.version))
      .limit(1);

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    const [sub] = await db
      .insert(submissions)
      .values({
        roomId,
        version: nextVersion,
        notes: notes || "",
        fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
        status: "pending",
      })
      .returning();

    // Update room status to review_pending
    await db
      .update(collaborationRooms)
      .set({ status: "review_pending" })
      .where(eq(collaborationRooms.id, roomId));

    await db.insert(notifications).values({ userId: room.businessId, type: 'submission', title: 'Hasil baru siap ditinjau', body: `Creator mengirim versi ${nextVersion} untuk "${room.title}".`, linkUrl: '/contracts' });
    const [business] = await db.select({ email: profiles.email }).from(profiles).where(eq(profiles.id, room.businessId)).limit(1);
    await sendCriticalEmail(business?.email, 'Hasil proyek siap ditinjau', `Creator mengirim versi ${nextVersion} untuk ${room.title}. Buka daftar Contracts untuk meninjau status proyek.`);

    return NextResponse.json({ success: true, submission: sub }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengirim hasil proyek.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
