import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { bookmarks } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const targetType = searchParams.get("targetType");

  try {
    const query = db
      .select({
        id: bookmarks.id,
        targetType: bookmarks.targetType,
        targetId: bookmarks.targetId,
        createdAt: bookmarks.createdAt,
      })
      .from(bookmarks);

    const conditions = [eq(bookmarks.userId, user.id)];
    if (targetType) {
      conditions.push(eq(bookmarks.targetType, targetType));
    }

    const userBookmarks = await query
      .where(and(...conditions))
      .orderBy(desc(bookmarks.createdAt));

    return NextResponse.json({ bookmarks: userBookmarks });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Gagal memuat bookmark" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    const body = await req.json();
    const { targetType, targetId } = body;

    if (!targetType || !targetId) {
      return NextResponse.json(
        { error: "targetType dan targetId wajib disertakan" },
        { status: 400 }
      );
    }

    // Check if bookmark already exists
    const [existing] = await db
      .select({ id: bookmarks.id })
      .from(bookmarks)
      .where(
        and(
          eq(bookmarks.userId, user.id),
          eq(bookmarks.targetType, String(targetType)),
          eq(bookmarks.targetId, String(targetId))
        )
      )
      .limit(1);

    if (existing) {
      // Toggle delete
      await db
        .delete(bookmarks)
        .where(eq(bookmarks.id, existing.id));

      return NextResponse.json({
        success: true,
        bookmarked: false,
        targetType,
        targetId,
        message: "Bookmark berhasil dihapus",
      });
    }

    // Insert new bookmark
    const [inserted] = await db
      .insert(bookmarks)
      .values({
        userId: user.id,
        targetType: String(targetType),
        targetId: String(targetId),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        bookmarked: true,
        targetType,
        targetId,
        bookmark: inserted,
        message: "Bookmark berhasil disimpan",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Gagal memproses bookmark" },
      { status: 500 }
    );
  }
}
