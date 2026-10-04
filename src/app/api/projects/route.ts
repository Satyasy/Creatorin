import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projects, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    let q = db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        category: projects.category,
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

  if (user.role !== "creator") return NextResponse.json({ error: "Hanya kreator dapat mengunggah karya." }, { status: 403 });

  try {
    const form = await req.formData();
    const title = String(form.get("title") || "").trim();
    const description = String(form.get("description") || "").trim();
    const category = String(form.get("category") || "Karya Kreatif").trim();
    const file = form.get("file");
    if (!title || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: "Judul dan file karya wajib diisi." }, { status: 400 });
    }
    if (file.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm"].includes(file.type)) {
      return NextResponse.json({ error: "Gunakan JPG, PNG, WebP, MP4, atau WebM maksimal 20 MB." }, { status: 400 });
    }
    const supabase = await createClient();
    const extension = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("project-media").upload(path, file, { contentType: file.type });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
    const { data: publicFile } = supabase.storage.from("project-media").getPublicUrl(path);
    const handle = `@${user.fullName.toLowerCase().replace(/\s+/g, "")}`;
    let newProject;
    try {
      [newProject] = await db
      .insert(projects)
      .values({
        creatorId: user.id,
        title,
        description,
        category,
        creatorHandle: handle,
        mediaUrl: publicFile.publicUrl,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      })
      .returning();
    } catch (error) {
      await supabase.storage.from("project-media").remove([path]);
      throw error;
    }

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
