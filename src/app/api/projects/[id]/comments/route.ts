import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, projectComments, projects } from "@/lib/db/schema";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  try {
    const comments = await db.select({
      id: projectComments.id,
      userId: projectComments.userId,
      name: profiles.fullName,
      avatar: profiles.avatarUrl,
      text: projectComments.content,
      createdAt: projectComments.createdAt,
    }).from(projectComments).innerJoin(profiles, eq(projectComments.userId, profiles.id))
      .where(eq(projectComments.projectId, id)).orderBy(desc(projectComments.createdAt));
    return NextResponse.json({ comments });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal memuat komentar" }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getAuthenticatedUser(request);
  if (!user) return NextResponse.json({ error: "Masuk untuk berkomentar" }, { status: 401 });
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  const body = await request.json();
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content || content.length > 2000) return NextResponse.json({ error: "Komentar harus berisi 1–2000 karakter" }, { status: 400 });
  try {
    const [project] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1);
    if (!project) return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    const [comment] = await db.insert(projectComments).values({ projectId: id, userId: user.id, content }).returning();
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal mengirim komentar" }, { status: 500 });
  }
}
