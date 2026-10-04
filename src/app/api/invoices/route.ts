import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, profiles, conversations } from "@/lib/db/schema";
import { and, eq, or, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const list = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        title: invoices.title,
        scopeDescription: invoices.scopeDescription,
        totalAmount: invoices.totalAmount,
        deadlineDays: invoices.deadlineDays,
        revisionRules: invoices.revisionRules,
        status: invoices.status,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        creatorId: invoices.creatorId,
        businessId: invoices.businessId,
        creatorName: profiles.fullName,
      })
      .from(invoices)
      .innerJoin(profiles, eq(invoices.creatorId, profiles.id))
      .where(or(eq(invoices.creatorId, user.id), eq(invoices.businessId, user.id)))
      .orderBy(desc(invoices.createdAt));

    return NextResponse.json({ invoices: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { businessId, conversationId, title, scopeDescription, totalAmount, deadlineDays = 3, revisionRules } = body;

  if (user.role !== 'creator' || !businessId || !title || !scopeDescription || !Number.isSafeInteger(Number(totalAmount)) || Number(totalAmount) <= 0 || !Number.isInteger(Number(deadlineDays)) || Number(deadlineDays) < 1) {
    return NextResponse.json({ error: "Data invoice belum lengkap." }, { status: 400 });
  }

  try {
    const [business] = await db.select({ id: profiles.id }).from(profiles).where(and(eq(profiles.id, businessId), eq(profiles.role, 'business'))).limit(1);
    if (!business) return NextResponse.json({ error: 'Akun UMKM tidak ditemukan.' }, { status: 404 });
    if (conversationId) {
      const [conversation] = await db.select({ id: conversations.id }).from(conversations).where(and(
        eq(conversations.id, conversationId),
        or(
          and(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, businessId)),
          and(eq(conversations.participant1Id, businessId), eq(conversations.participant2Id, user.id))
        )
      )).limit(1);
      if (!conversation) return NextResponse.json({ error: 'Percakapan tidak valid.' }, { status: 403 });
    }
    const invoiceNumber = `INV-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const [invoice] = await db
      .insert(invoices)
      .values({
        invoiceNumber,
        creatorId: user.id,
        businessId,
        conversationId,
        title,
        scopeDescription,
        totalAmount: Number(totalAmount),
        deadlineDays: Number(deadlineDays),
        revisionRules: revisionRules || "Maksimal 2 kali revisi minor.",
        status: "unpaid",
      })
      .returning();

    return NextResponse.json({ success: true, invoice }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
