import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, collaborationRooms, creatorWallets, walletTransactions, notifications, profiles } from "@/lib/db/schema";
import { sendCriticalEmail } from '@/lib/email';
import { eq, sql } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, invoiceId)).limit(1);
    if (!invoice) {
      return NextResponse.json({ error: "Invoice tidak ditemukan" }, { status: 404 });
    }
    if (invoice.status === "paid") {
      return NextResponse.json({ error: "Invoice sudah dibayar" }, { status: 400 });
    }
    if (user.id !== invoice.businessId) {
      return NextResponse.json({ error: "Hanya UMKM pemilik invoice yang dapat membayar." }, { status: 403 });
    }

    const [wallet] = await db.select().from(creatorWallets).where(eq(creatorWallets.creatorId, user.id)).limit(1);
    if (!wallet || wallet.balance < invoice.totalAmount) {
      return NextResponse.json({ error: "Saldo koin tidak cukup. Lakukan top up sebelum membayar invoice." }, { status: 400 });
    }

    await db.update(creatorWallets).set({ balance: sql`${creatorWallets.balance} - ${invoice.totalAmount}`, updatedAt: new Date() }).where(eq(creatorWallets.creatorId, user.id));
    await db.insert(walletTransactions).values({ walletId: wallet.id, type: "escrow_hold", amount: -invoice.totalAmount, description: `Koin ditahan untuk invoice ${invoice.invoiceNumber}`, status: "completed" });

    // 1. Mark invoice as paid
    await db
      .update(invoices)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(invoices.id, invoiceId));

    // 2. Automatically create Collaboration Room
    const deadlineDate = new Date();
    deadlineDate.setDate(deadlineDate.getDate() + invoice.deadlineDays);

    const [room] = await db
      .insert(collaborationRooms)
      .values({
        invoiceId: invoice.id,
        creatorId: invoice.creatorId,
        businessId: invoice.businessId,
        title: invoice.title,
        briefSummary: invoice.scopeDescription,
        deadline: deadlineDate,
        status: "in_progress",
      })
      .returning();

    await db.insert(notifications).values({ userId: invoice.creatorId, type: 'invoice', title: 'Invoice dibayar', body: `Koin untuk "${invoice.title}" sudah masuk escrow.`, linkUrl: '/contracts' });
    const [creator] = await db.select({ email: profiles.email }).from(profiles).where(eq(profiles.id, invoice.creatorId)).limit(1);
    await sendCriticalEmail(creator?.email, 'Invoice Creatorin sudah dibayar', `Koin untuk proyek ${invoice.title} sudah masuk escrow. Buka Contracts untuk memantau pekerjaan.`);

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil. Koin ditahan di escrow dan status proyek dapat dipantau di Contracts.",
      room,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses pembayaran.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
