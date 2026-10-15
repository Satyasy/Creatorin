import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { messages, conversations, profiles } from "@/lib/db/schema";
import { eq, asc, and, or } from "drizzle-orm";
import { publishChatEvent } from "@/lib/redis";

async function canAccessConversation(db: NonNullable<ReturnType<typeof getDb>>, conversationId: string, userId: string) {
  const [room] = await db.select({ id: conversations.id }).from(conversations)
    .where(and(eq(conversations.id, conversationId), or(eq(conversations.participant1Id, userId), eq(conversations.participant2Id, userId))))
    .limit(1);
  return Boolean(room);
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return NextResponse.json({ error: "conversationId wajib disertakan." }, { status: 400 });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    if (!await canAccessConversation(db, conversationId, user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const list = await db
      .select({
        id: messages.id,
        conversationId: messages.conversationId,
        senderId: messages.senderId,
        content: messages.content,
        attachmentUrl: messages.attachmentUrl,
        serviceQuoteId: messages.serviceQuoteId,
        metadata: messages.metadata,
        isRead: messages.isRead,
        createdAt: messages.createdAt,
        senderName: profiles.fullName,
        senderAvatar: profiles.avatarUrl,
      })
      .from(messages)
      .innerJoin(profiles, eq(messages.senderId, profiles.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt));

    return NextResponse.json({ messages: list });
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
  const { conversationId, content, attachmentUrl, serviceQuoteId, metadata } = body;

  if (!conversationId || !content) {
    return NextResponse.json({ error: "conversationId dan content wajib diisi." }, { status: 400 });
  }

  try {
    if (!await canAccessConversation(db, conversationId, user.id)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: user.id,
        content,
        attachmentUrl,
        serviceQuoteId,
        metadata: metadata || {},
        isRead: false,
      })
      .returning();

    // Update conversation lastMessage
    await db
      .update(conversations)
      .set({
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    // Broadcast via Redis
    await publishChatEvent(`chat:${conversationId}`, {
      type: "NEW_MESSAGE",
      conversationId,
      message: msg,
    });

    return NextResponse.json({ success: true, message: msg }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
