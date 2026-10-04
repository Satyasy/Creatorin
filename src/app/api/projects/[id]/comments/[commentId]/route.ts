import { NextRequest, NextResponse } from "next/server";
import { and, eq, gte } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projectComments } from "@/lib/db/schema";

type Context = { params: Promise<{ id: string; commentId: string }> };

export async function PUT(request: NextRequest, { params }: Context) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, commentId } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length > 2000) return NextResponse.json({ error: "Komentar harus berisi 1–2000 karakter" }, { status: 400 });
  try {
    const editableSince = new Date(Date.now() - 10 * 60 * 1000);
    const [comment] = await db.update(projectComments).set({ content }).where(and(
      eq(projectComments.id, commentId),
      eq(projectComments.projectId, id),
      eq(projectComments.userId, user.id),
      gte(projectComments.createdAt, editableSince)
    )).returning();
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ comment });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memperbarui komentar" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id, commentId } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  try {
    const editableSince = new Date(Date.now() - 10 * 60 * 1000);
    const [comment] = await db.delete(projectComments).where(and(
      eq(projectComments.id, commentId),
      eq(projectComments.projectId, id),
      eq(projectComments.userId, user.id),
      gte(projectComments.createdAt, editableSince)
    )).returning();
    if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menghapus komentar" }, { status: 500 });
  }
}
