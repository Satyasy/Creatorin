import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, invoices, creatorWallets, walletTransactions, notifications } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

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
      return NextResponse.json({ error: "Hanya UMKM klien proyek ini yang dapat menyetujui hasil akhir." }, { status: 403 });
    }

    if (room.status === "completed") {
      return NextResponse.json({ error: "Proyek ini sudah disetujui dan selesai." }, { status: 400 });
    }

    // Fetch related invoice
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, room.invoiceId))
      .limit(1);

    const escrowCoins = invoice?.totalAmount || 0;

    // Run transaction: update room, update submissions, credit creator wallet
    await db.transaction(async (tx) => {
      // 1. Update room status
      await tx
        .update(collaborationRooms)
        .set({ status: "completed", approvedAt: new Date() })
        .where(eq(collaborationRooms.id, roomId));

      // 2. Update latest submission
      const [latestSub] = await tx
        .select({ id: submissions.id })
        .from(submissions)
        .where(eq(submissions.roomId, roomId))
        .orderBy(desc(submissions.version))
        .limit(1);

      if (latestSub) {
        await tx
          .update(submissions)
          .set({ status: "approved" })
          .where(eq(submissions.id, latestSub.id));
      }

      // 3. Ensure creator wallet exists and credit escrow coins
      let [creatorWallet] = await tx
        .select()
        .from(creatorWallets)
        .where(eq(creatorWallets.creatorId, room.creatorId))
        .limit(1);

      if (!creatorWallet) {
        const [created] = await tx
          .insert(creatorWallets)
          .values({
            creatorId: room.creatorId,
            balance: escrowCoins,
            points: 50,
          })
          .returning();
        creatorWallet = created;
      } else {
        await tx
          .update(creatorWallets)
          .set({
            balance: sql`${creatorWallets.balance} + ${escrowCoins}`,
            points: sql`${creatorWallets.points} + 50`,
            updatedAt: new Date(),
          })
          .where(eq(creatorWallets.id, creatorWallet.id));
      }

      // 4. Record wallet transaction
      await tx.insert(walletTransactions).values({
        walletId: creatorWallet.id,
        type: "credit_payment",
        amount: escrowCoins,
        description: `Pencairan escrow proyek "${room.title}" selesai disetujui UMKM`,
        status: "completed",
      });

      // 5. Notify Creator
      await tx.insert(notifications).values({
        userId: room.creatorId,
        type: "collaboration",
        title: "Proyek disetujui! Saldo koin dicairkan",
        body: `Selamat! UMKM telah menyetujui proyek "${room.title}". Saldo 🪙 ${escrowCoins.toLocaleString('id-ID')} Koin telah masuk ke dompet Anda.`,
        linkUrl: `/contracts`,
      });
    });

    return NextResponse.json({
      success: true,
      message: "Proyek berhasil disetujui. Dana escrow koin telah dicairkan ke saldo Kreator.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
