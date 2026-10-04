import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projects, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { MOCK_FEED_PROJECTS } from "@/data/mockFeedProjects";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  const db = getDb();
  if (!db) {
    let list = MOCK_FEED_PROJECTS;
    if (creatorId) {
      list = list.filter(p => p.creatorId === creatorId || p.creator?.id === creatorId);
    }
    return NextResponse.json({
      projects: list.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description || p.caption || "",
        creatorHandle: p.socialHandle || p.creator?.handle || "@creator",
        viewsCount: p.viewsCount,
        mediaUrl: p.mediaUrl || p.coverImage,
        mediaType: p.mediaType,
        createdAt: p.createdAt || p.postedDate || new Date().toISOString(),
        creatorId: p.creatorId || p.creator?.id || "mock-creator",
        creatorName: p.creator?.name || "Kreator",
        creatorAvatar: p.creator?.avatar || "/creatorin/avatar.png",
      }))
    });
  }

  try {
    let q = db
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
      .orderBy(desc(projects.createdAt));

    const rows = await q;
    const filtered = creatorId ? rows.filter((r) => r.creatorId === creatorId) : rows;

    return NextResponse.json({ projects: filtered });
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
  const { title, description, mediaUrl, mediaType = "shader", externalLink } = body;

  if (!title) {
    return NextResponse.json({ error: "Judul proyek wajib diisi." }, { status: 400 });
  }

  try {
    const handle = `@${user.fullName.toLowerCase().replace(/\s+/g, "")}`;
    const [newProject] = await db
      .insert(projects)
      .values({
        creatorId: user.id,
        title,
        description,
        creatorHandle: handle,
        mediaUrl,
        mediaType,
        externalLink,
      })
      .returning();

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
