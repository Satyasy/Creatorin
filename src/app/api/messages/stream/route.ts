import { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { createRedisSubscriber } from "@/lib/redis";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const conversationId = searchParams.get("conversationId");
  if (!conversationId) {
    return new Response("Missing conversationId", { status: 400 });
  }

  const db = getDb();
  if (!db) {
    return new Response("Database not connected", { status: 503 });
  }

  // Verify conversation access
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
    return new Response("Forbidden", { status: 403 });
  }

  const subscriber = createRedisSubscriber();
  let cleanup: (() => void) | null = null;

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connect handshake
      controller.enqueue(new TextEncoder().encode(`event: ping\ndata: {"status":"connected"}\n\n`));

      if (subscriber) {
        try {
          if (subscriber.status !== "ready") {
            await subscriber.connect().catch(() => {});
          }
          await subscriber.subscribe(`chat:${conversationId}`);

          subscriber.on("message", (channel, rawMsg) => {
            if (channel === `chat:${conversationId}`) {
              try {
                controller.enqueue(new TextEncoder().encode(`event: message\ndata: ${rawMsg}\n\n`));
              } catch {
                // Stream closed by client
              }
            }
          });
        } catch (e) {
          console.warn("[SSE] Redis subscribe notice:", e);
        }
      }

      // Heartbeat interval to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(`event: ping\ndata: {"time":${Date.now()}}\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 15000);

      cleanup = () => {
        clearInterval(heartbeat);
        if (subscriber) {
          subscriber.unsubscribe(`chat:${conversationId}`).catch(() => {});
          subscriber.quit().catch(() => {});
        }
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
