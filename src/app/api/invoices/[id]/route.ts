import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { invoices, profiles, creatorProfiles, businessProfiles, collaborationRooms } from "@/lib/db/schema";
import { eq, or, and } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    const invRows = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        creatorId: invoices.creatorId,
        businessId: invoices.businessId,
        conversationId: invoices.conversationId,
        title: invoices.title,
        scopeDescription: invoices.scopeDescription,
        totalAmount: invoices.totalAmount,
        deadlineDays: invoices.deadlineDays,
        revisionRules: invoices.revisionRules,
        status: invoices.status,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
      })
      .from(invoices)
      .where(
        and(
          eq(invoices.id, id),
          or(eq(invoices.creatorId, user.id), eq(invoices.businessId, user.id))
        )
      )
      .limit(1);

    if (!invRows || invRows.length === 0) {
      return NextResponse.json({ error: "Invoice not found or access denied" }, { status: 404 });
    }

    const invoice = invRows[0];

    // Fetch related creator & business profiles and collaboration room (if paid)
    const [creatorData, businessData, roomData] = await Promise.all([
      db
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
          slug: creatorProfiles.slug,
          headline: creatorProfiles.headline,
        })
        .from(profiles)
        .leftJoin(creatorProfiles, eq(profiles.id, creatorProfiles.profileId))
        .where(eq(profiles.id, invoice.creatorId))
        .limit(1),
      db
        .select({
          id: profiles.id,
          fullName: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
          companyName: businessProfiles.companyName,
          businessCategory: businessProfiles.businessCategory,
        })
        .from(profiles)
        .leftJoin(businessProfiles, eq(profiles.id, businessProfiles.profileId))
        .where(eq(profiles.id, invoice.businessId))
        .limit(1),
      db
        .select({
          id: collaborationRooms.id,
          status: collaborationRooms.status,
        })
        .from(collaborationRooms)
        .where(eq(collaborationRooms.invoiceId, invoice.id))
        .limit(1),
    ]);

    return NextResponse.json({
      invoice: {
        ...invoice,
        creator: creatorData[0] || null,
        business: businessData[0] || null,
        roomId: roomData[0]?.id || null,
        roomStatus: roomData[0]?.status || null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
