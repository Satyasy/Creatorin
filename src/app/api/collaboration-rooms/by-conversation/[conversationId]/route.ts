import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, revisions, invoices, profiles, conversations } from "@/lib/db/schema";
import { eq, desc, and, or } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  if (!conversationId || !conversationId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return NextResponse.json({ room: null, invoice: null }, { status: 200 });
  }

  try {
    // 1. Verify user is participant in this conversation
    const [conv] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, user.id))
        )
      )
      .limit(1);

    if (!conv && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const partnerId = conv ? (conv.participant1Id === user.id ? conv.participant2Id : conv.participant1Id) : null;

    // 2. Find related invoice for this conversation
    let [invoice] = await db
      .select()
      .from(invoices)
      .where(eq(invoices.conversationId, conversationId))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    // 3. Find related collaboration room (either by invoiceId or participants)
    let room = null;
    if (invoice) {
      const [r] = await db
        .select()
        .from(collaborationRooms)
        .where(eq(collaborationRooms.invoiceId, invoice.id))
        .limit(1);
      room = r;
    }

    // Fallback: search room by participants if not linked directly
    if (!room && partnerId) {
      const [r] = await db
        .select()
        .from(collaborationRooms)
        .where(
          or(
            and(eq(collaborationRooms.creatorId, user.id), eq(collaborationRooms.businessId, partnerId)),
            and(eq(collaborationRooms.creatorId, partnerId), eq(collaborationRooms.businessId, user.id))
          )
        )
        .orderBy(desc(collaborationRooms.createdAt))
        .limit(1);
      room = r;

      if (room && !invoice) {
        const [inv] = await db
          .select()
          .from(invoices)
          .where(eq(invoices.id, room.invoiceId))
          .limit(1);
        invoice = inv;
      }
    }

    if (!room) {
      return NextResponse.json({ room: null, invoice: invoice || null }, { status: 200 });
    }

    // 4. Fetch submissions
    const submissionList = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, room.id))
      .orderBy(desc(submissions.version));

    // 5. Fetch revisions
    const revisionList = await db
      .select()
      .from(revisions)
      .where(eq(revisions.roomId, room.id))
      .orderBy(desc(revisions.requestedAt));

    // 6. Fetch profiles
    const [creatorProfile] = await db
      .select({ id: profiles.id, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.id, room.creatorId))
      .limit(1);

    const [businessProfile] = await db
      .select({ id: profiles.id, fullName: profiles.fullName, avatarUrl: profiles.avatarUrl })
      .from(profiles)
      .where(eq(profiles.id, room.businessId))
      .limit(1);

    return NextResponse.json({
      room,
      invoice: invoice || null,
      submissions: submissionList,
      revisions: revisionList,
      creator: creatorProfile,
      business: businessProfile,
      myRole: room.creatorId === user.id ? "creator" : "umkm",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
