"use server";

import { getDb } from "../db";
import { invoices, collaborationRooms, submissions, creatorWallets, walletTransactions, reviews } from "../db/schema";
import { createClient } from "../supabase/server";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createInvoice(params: {
  businessId: string;
  conversationId?: string;
  title: string;
  scopeDescription: string;
  totalAmount: number;
  deadlineDays?: number;
  revisionRules?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autentikasi diperlukan." };
  }

  const db = getDb();
  if (!db) return { error: "Database belum terhubung." };

  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  try {
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        creatorId: user.id,
        businessId: params.businessId,
        conversationId: params.conversationId,
        title: params.title,
        scopeDescription: params.scopeDescription,
        totalAmount: params.totalAmount,
        deadlineDays: params.deadlineDays || 3,
        revisionRules: params.revisionRules || "Maksimal 2 kali revisi minor.",
        status: "unpaid",
      })
      .returning();

    revalidatePath("/pesan");
    return { success: true, invoice };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat invoice";
    return { error: message };
  }
}

// Simulasi konfirmasi pembayaran invoice -> otomatis membuat Collaboration Room (Halaman 32 -> 35)
export async function confirmInvoicePayment(invoiceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autentikasi diperlukan." };
  }

  const db = getDb();
  if (!db) return { error: "Database belum terhubung." };

  try {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, invoiceId))
      .limit(1);

    if (!invoice) return { error: "Invoice tidak ditemukan." };
    if (invoice.status === "paid") return { error: "Invoice sudah dibayar." };

    // 1. Tandai invoice lunas
    await db
      .update(invoices)
      .set({ status: "paid", paidAt: new Date() })
      .where(eq(invoices.id, invoiceId));

    // 2. Otomatis buat Collaboration Room (Konsensus /grill-me)
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

    revalidatePath("/", "layout");
    return { success: true, room };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses pembayaran";
    return { error: message };
  }
}

// Klien menyetujui hasil kerja -> Collaboration Room selesai & dana masuk wallet Creator (Halaman 35 -> 38)
export async function approveSubmission(roomId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Autentikasi diperlukan." };
  }

  const db = getDb();
  if (!db) return { error: "Database belum terhubung." };

  try {
    const [room] = await db
      .select()
      .from(collaborationRooms)
      .where(eq(collaborationRooms.id, roomId))
      .limit(1);

    if (!room) return { error: "Ruang kolaborasi tidak ditemukan." };
    if (room.status === "completed") return { error: "Proyek sudah selesai disetujui." };

    // 1. Ambil nilai invoice
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.id, room.invoiceId))
      .limit(1);

    const payoutAmount = invoice ? invoice.totalAmount : 0;

    // 2. Update status room menjadi completed
    await db
      .update(collaborationRooms)
      .set({ status: "completed", approvedAt: new Date() })
      .where(eq(collaborationRooms.id, roomId));

    // 3. Kreditkan dana ke creator wallet
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
    }

    revalidatePath("/", "layout");
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memproses approval";
    return { error: message };
  }
}
