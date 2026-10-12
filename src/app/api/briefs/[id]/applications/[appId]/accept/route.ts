import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { briefApplications, projectBriefs, conversations, messages, notifications } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; appId: string }> }
) {
  const { id: briefId, appId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    // 1. Verify brief ownership
    const [brief] = await db.select().from(projectBriefs).where(eq(projectBriefs.id, briefId)).limit(1);
    if (!brief) {
      return NextResponse.json({ error: "Brief tidak ditemukan" }, { status: 404 });
    }
    if (brief.businessId !== user.id) {
      return NextResponse.json({ error: "Hanya pemilik brief yang dapat menerima pelamar." }, { status: 403 });
    }

    // 2. Verify application
    const [application] = await db.select().from(briefApplications).where(eq(briefApplications.id, appId)).limit(1);
    if (!application) {
      return NextResponse.json({ error: "Lamaran tidak ditemukan" }, { status: 404 });
    }

    // 3. Update application status to accepted and brief to in_progress
    await db
      .update(briefApplications)
      .set({ status: "accepted" })
      .where(eq(briefApplications.id, appId));

    await db
      .update(projectBriefs)
      .set({ status: "in_progress" })
      .where(eq(projectBriefs.id, briefId));

    // 4. Automatically find or create conversation thread between Business & Creator
    let [conv] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, application.creatorId)),
          and(eq(conversations.participant1Id, application.creatorId), eq(conversations.participant2Id, user.id))
        )
      )
      .limit(1);

    if (!conv) {
      [conv] = await db
        .insert(conversations)
        .values({
          participant1Id: user.id,
          participant2Id: application.creatorId,
          lastMessage: `Lamaran untuk brief "${brief.title}" telah diterima. Silakan diskusikan kesepakatan akhir.`,
        })
        .returning();
    }

    // 5. Send initial context message in chat thread
    await db.insert(messages).values({
      conversationId: conv.id,
      senderId: user.id,
      content: `Selamat! Lamaran Anda untuk brief "${brief.title}" (Tawaran: ${application.proposedPrice || brief.budget}) telah kami terima. Mari kita diskusikan rincian teknis pengerjaan sebelum invoice diterbitkan.`,
      isRead: false,
    });

    // 6. Send notification to Creator
    await db.insert(notifications).values({
      userId: application.creatorId,
      type: "application",
      title: "Lamaran Diterima!",
      body: `Klien ${user.fullName} menerima lamaran Anda untuk brief: ${brief.title}. Ruang obrolan telah dibuka.`,
      linkUrl: `/chat?conversationId=${conv.id}`,
    });

    return NextResponse.json({
      success: true,
      message: "Pelamar berhasil diterima. Percakapan chat otomatis diinisialisasi.",
      conversationId: conv.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
