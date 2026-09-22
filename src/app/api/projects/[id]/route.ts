import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projects, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [project] = await db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        creatorHandle: projects.creatorHandle,
        viewsCount: projects.viewsCount,
        mediaUrl: projects.mediaUrl,
        mediaType: projects.mediaType,
        externalLink: projects.externalLink,
        createdAt: projects.createdAt,
        creatorId: projects.creatorId,
        creatorName: profiles.fullName,
        creatorAvatar: profiles.avatarUrl,
      })
      .from(projects)
      .innerJoin(profiles, eq(projects.creatorId, profiles.id))
      .where(eq(projects.id, id))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Proyek tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { title, description, mediaUrl, mediaType, externalLink } = body;

  try {
    const [updated] = await db
      .update(projects)
      .set({
        title: title || undefined,
        description: description || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaType: mediaType || undefined,
        externalLink: externalLink || undefined,
      })
      .where(eq(projects.id, id))
      .returning();

    return NextResponse.json({ success: true, project: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    await db.delete(projects).where(eq(projects.id, id));
    return NextResponse.json({ success: true, message: "Proyek portofolio berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
