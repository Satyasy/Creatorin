import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, invoices, creatorWallets, walletTransactions, submissions, creatorProfiles, notifications } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [room] = await db.select().from(collaborationRooms).where(eq(collaborationRooms.id, roomId)).limit(1);
    if (!room) {
      return NextResponse.json({ error: "Collaboration Room tidak ditemukan" }, { status: 404 });
    }
    if (room.status === "completed") {
      return NextResponse.json({ error: "Proyek sudah selesai" }, { status: 400 });
    }
    if (user.id !== room.businessId) return NextResponse.json({ error: "Hanya UMKM pemilik proyek yang dapat menyetujui hasil." }, { status: 403 });

    // 1. Get invoice amount
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, room.invoiceId)).limit(1);
    const grossAmount = invoice ? invoice.totalAmount : 0;
    const platformFee = Math.round(grossAmount * 0.075);
    const payoutAmount = grossAmount - platformFee;

    // 2. Mark room completed
    await db
      .update(collaborationRooms)
      .set({ status: "completed", approvedAt: new Date() })
      .where(eq(collaborationRooms.id, roomId));

    // 3. Mark latest submission approved
    await db
      .update(submissions)
      .set({ status: "approved" })
      .where(eq(submissions.roomId, roomId));

    // 4. Credit creator wallet
    if (payoutAmount > 0) {
      await db
        .insert(creatorWallets)
        .values({
          creatorId: room.creatorId,
          balance: payoutAmount,
          points: Math.floor(payoutAmount / 10000),
        })
        .onConflictDoUpdate({
          target: creatorWallets.creatorId,
          set: {
            balance: sql`${creatorWallets.balance} + ${payoutAmount}`,
            points: sql`${creatorWallets.points} + ${Math.floor(payoutAmount / 10000)}`,
            updatedAt: new Date(),
          },
        });

      // Log transaction
      const [wallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, room.creatorId)).limit(1);
      if (wallet) {
        await db.insert(walletTransactions).values({
          walletId: wallet.id,
          type: "credit_payment",
          amount: payoutAmount,
          description: `Pembayaran proyek selesai: ${room.title}`,
          status: "completed",
        });
      }
    }

    const [creator] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.profileId, room.creatorId)).limit(1);
    if (creator) {
      const completed = creator.completedProjectsCount + 1;
      const ratingScore = Math.round(Number(creator.rating) * 16);
      const careerScore = Math.min(100, ratingScore + Math.min(20, completed));
      await db.update(creatorProfiles).set({ completedProjectsCount: completed, careerScore }).where(eq(creatorProfiles.profileId, room.creatorId));
    }

    await db.insert(notifications).values({ userId: room.creatorId, type: 'approval', title: 'Hasil disetujui', body: `${Math.floor(payoutAmount / 1000)} koin telah masuk ke dompet Anda.`, linkUrl: '/wallet' });

    return NextResponse.json({
      success: true,
      message: `Proyek disetujui. ${Math.floor(payoutAmount / 1000)} koin masuk ke dompet creator setelah fee platform 7,5%.`,
      settlement: { grossAmount, platformFee, payoutAmount },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
