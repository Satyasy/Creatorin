import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { notifications } from "@/lib/db/schema";
import { and, eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const list = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, user.id))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    return NextResponse.json({ notifications: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { id } = body;

  try {
    if (id) {
      await db.update(notifications).set({ isRead: true }).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
    } else {
      // Mark all as read
      await db.update(notifications).set({ isRead: true }).where(eq(notifications.userId, user.id));
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const body = await req.json();
    const { userId, type, title, body: contentBody, linkUrl } = body;

    if (!userId || !title || !contentBody) {
      return NextResponse.json({ error: "Data notifikasi tidak lengkap" }, { status: 400 });
    }

    const [created] = await db
      .insert(notifications)
      .values({
        userId,
        type: type || "system",
        title,
        body: contentBody,
        linkUrl: linkUrl || null,
        isRead: false,
      })
      .returning();

    return NextResponse.json({ success: true, notification: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
