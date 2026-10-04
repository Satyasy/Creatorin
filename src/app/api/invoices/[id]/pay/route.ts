import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, collaborationRooms, creatorWallets, walletTransactions, notifications } from "@/lib/db/schema";
import { and, eq, gte, sql } from "drizzle-orm";

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

    const room = await db.transaction(async tx => {
      const [wallet] = await tx.update(creatorWallets)
        .set({ balance: sql`${creatorWallets.balance} - ${invoice.totalAmount}`, updatedAt: new Date() })
        .where(and(eq(creatorWallets.creatorId, user.id), gte(creatorWallets.balance, invoice.totalAmount)))
        .returning();
      if (!wallet) throw new Error('Saldo koin tidak cukup.');
      const [paid] = await tx.update(invoices).set({ status: 'paid', paidAt: new Date() })
        .where(and(eq(invoices.id, invoiceId), eq(invoices.status, 'unpaid'))).returning();
      if (!paid) throw new Error('Invoice sudah diproses.');
      await tx.insert(walletTransactions).values({ walletId: wallet.id, type: 'escrow_hold', amount: -invoice.totalAmount, description: `Koin ditahan untuk invoice ${invoice.invoiceNumber}`, status: 'completed' });
      const deadlineDate = new Date();
      deadlineDate.setDate(deadlineDate.getDate() + invoice.deadlineDays);
      const [created] = await tx.insert(collaborationRooms).values({
        invoiceId: invoice.id, creatorId: invoice.creatorId, businessId: invoice.businessId,
        title: invoice.title, briefSummary: invoice.scopeDescription,
        deadline: deadlineDate, status: 'in_progress',
      }).returning();
      await tx.insert(notifications).values({ userId: invoice.creatorId, type: 'invoice', title: 'Invoice dibayar', body: `Koin untuk "${invoice.title}" sudah masuk escrow.`, linkUrl: '/contracts' });
      return created;
    });

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
