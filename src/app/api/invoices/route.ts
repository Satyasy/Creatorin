import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, profiles } from "@/lib/db/schema";
import { eq, or, desc } from "drizzle-orm";

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

  if (!businessId || !title || !scopeDescription || !totalAmount) {
    return NextResponse.json({ error: "Data invoice belum lengkap." }, { status: 400 });
  }

  try {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
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
