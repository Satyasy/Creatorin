import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { messages, conversations } from "@/lib/db/schema";
import { eq, and, or, ne } from "drizzle-orm";
import { publishChatEvent } from "@/lib/redis";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const { conversationId } = await req.json();
    if (!conversationId) {
      return NextResponse.json({ error: "conversationId wajib disertakan." }, { status: 400 });
    }

    // Verify user is a participant in this conversation
    const [conv] = await db
      .select({ id: conversations.id })
      .from(conversations)
      .where(
        and(
          eq(conversations.id, conversationId),
          or(eq(conversations.participant1Id, user.id), eq(conversations.participant2Id, user.id))
        )
      )
      .limit(1);

    if (!conv) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark all unread messages from OTHER participants as read
    const updated = await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, user.id),
          eq(messages.isRead, false)
        )
      )
      .returning({ id: messages.id });

    // Broadcast read event to Redis channel
    await publishChatEvent(`chat:${conversationId}`, {
      type: "MESSAGES_READ",
      conversationId,
      readBy: user.id,
      messageIds: updated.map((m) => m.id),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      updatedCount: updated.length,
      messageIds: updated.map((m) => m.id),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
