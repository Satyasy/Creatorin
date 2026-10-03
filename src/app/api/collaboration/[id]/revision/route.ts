import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, revisions, submissions, notifications, profiles } from "@/lib/db/schema";
import { sendCriticalEmail } from '@/lib/email';
import { eq, desc, count } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { feedback } = body;

  if (!feedback) {
    return NextResponse.json({ error: "Catatan feedback revisi wajib diisi." }, { status: 400 });
  }

  try {
    const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, roomId)).limit(1);
    if (!room) {
      return NextResponse.json({ error: "Collaboration Room tidak ditemukan" }, { status: 404 });
    }
    if (room.status === "completed") {
      return NextResponse.json({ error: "Proyek sudah selesai, revisi tidak dapat diajukan." }, { status: 400 });
    }
    if (user.id !== room.businessId) return NextResponse.json({ error: 'Hanya UMKM pemilik proyek yang dapat meminta revisi.' }, { status: 403 });

    // 1. Check current submission
    const [latestSub] = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, roomId))
      .orderBy(desc(submissions.version))
      .limit(1);

    if (!latestSub) {
      return NextResponse.json({ error: "Belum ada submission hasil kerja untuk direvisi." }, { status: 400 });
    }

    // 2. Check revision quota (Max 2 minor revisions as per default rules)
    const [revCount] = await db
      .select({ val: count() })
      .from(revisions)
      .where(eq(revisions.roomId, roomId));

    const currentRevisions = Number(revCount?.val || 0);
    if (currentRevisions >= 2) {
      return NextResponse.json({
        error: `Batas kuota revisi (2 kali) telah tercapai untuk proyek ini. Silakan diskusikan tambahan kuota dengan kreator.`,
      }, { status: 400 });
    }

    // 3. Create revision record
    const [newRev] = await db
      .insert(revisions)
      .values({
        roomId,
        submissionId: latestSub.id,
        feedback,
      })
      .returning();

    // 4. Update room and submission status
    await db
      .update(collaborationRooms)
      .set({ status: "revision_requested" })
      .where(eq(collaborationRooms.id, roomId));

    await db
      .update(submissions)
      .set({ status: "revision_requested" })
      .where(eq(submissions.id, latestSub.id));

    // 5. Send notification to creator
    await db.insert(notifications).values({
      userId: room.creatorId,
      type: "submission",
      title: "Permintaan Revisi Proyek",
      body: `Klien meminta revisi pada proyek "${room.title}": "${feedback.slice(0, 80)}..."`,
      linkUrl: '/contracts',
    });
    const [creator] = await db.select({ email: profiles.email }).from(profiles).where(eq(profiles.id, room.creatorId)).limit(1);
    await sendCriticalEmail(creator?.email, 'Permintaan revisi proyek', `UMKM meminta revisi untuk ${room.title}. Buka daftar Contracts untuk memantau status proyek.`);

    return NextResponse.json({
      success: true,
      message: `Permintaan revisi ke-${currentRevisions + 1} berhasil dikirim ke kreator.`,
      revision: newRev,
    }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal mengirim permintaan revisi.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
