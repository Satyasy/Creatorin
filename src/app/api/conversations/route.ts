import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { conversations, profiles } from "@/lib/db/schema";
import { eq, or, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const list = await db
      .select({
        id: conversations.id,
        participant1Id: conversations.participant1Id,
        participant2Id: conversations.participant2Id,
        lastMessage: conversations.lastMessage,
        lastMessageTime: conversations.lastMessageTime,
        updatedAt: conversations.updatedAt,
      })
      .from(conversations)
      .where(or(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, user.id)))
      .orderBy(desc(conversations.updatedAt));

    // Fetch partner details for each conversation
    const result = await Promise.all(
      list.map(async (c) => {
        const partnerId = c.participant1Id === user.id ? c.participant2Id : c.participant1Id;
        const [partner] = await db.select().from(profiles).where(eq(profiles.id, partnerId)).limit(1);
        return {
          ...c,
          partner: partner || { id: partnerId, fullName: "Akun tidak tersedia", avatarUrl: "" },
        };
      })
    );

    return NextResponse.json({ conversations: result });
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
  const { recipientId } = body;

  if (!recipientId || recipientId === user.id) {
    return NextResponse.json({ error: "recipientId wajib disertakan." }, { status: 400 });
  }

  try {
    const [recipient] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.id, recipientId)).limit(1);
    if (!recipient) return NextResponse.json({ error: "Penerima tidak ditemukan." }, { status: 404 });
    // Check if conversation already exists
    const [existing] = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, recipientId)),
          and(eq(conversations.participant1Id, recipientId), eq(conversations.participant2Id, user.id))
        )
      )
      .limit(1);

    if (existing) {
      return NextResponse.json({ conversation: existing });
    }

    const [newConv] = await db
      .insert(conversations)
      .values({
        participant1Id: user.id,
        participant2Id: recipientId,
        lastMessage: "Percakapan baru dimulai",
      })
      .returning();

    return NextResponse.json({ conversation: newConv }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
