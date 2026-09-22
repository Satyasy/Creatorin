import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { submissions, collaborationRooms } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: roomId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { notes, fileUrls = [] } = body;

  try {
    const existing = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, roomId))
      .orderBy(desc(submissions.version))
      .limit(1);

    const nextVersion = existing.length > 0 ? existing[0].version + 1 : 1;

    const [sub] = await db
      .insert(submissions)
      .values({
        roomId,
        version: nextVersion,
        notes: notes || "",
        fileUrls: Array.isArray(fileUrls) ? fileUrls : [],
        status: "pending",
      })
      .returning();

    // Update room status to review_pending
    await db
      .update(collaborationRooms)
      .set({ status: "review_pending" })
      .where(eq(collaborationRooms.id, roomId));

    return NextResponse.json({ success: true, submission: sub }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
