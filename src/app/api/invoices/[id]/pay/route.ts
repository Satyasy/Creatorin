import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, collaborationRooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

    return NextResponse.json({
      success: true,
      message: "Pembayaran berhasil. Collaboration Room otomatis dibuat.",
      room,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
