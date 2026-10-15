import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projects, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const creatorId = searchParams.get("creatorId");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const q = db
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
      .leftJoin(profiles, eq(projects.creatorId, profiles.id))
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
  if (!user) return NextResponse.json({ error: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  if (user.role !== "creator" && user.role !== "admin") {
    return NextResponse.json({ error: "Hanya kreator dapat mengunggah karya." }, { status: 403 });
  }

  try {
    let title = "";
    let description = "";
    let category = "Karya Kreatif";
    let externalLink = "";
    let mediaUrl = "";
    let mediaType = "image";
    let savedFilePath: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      title = String(form.get("title") || "").trim();
      description = String(form.get("description") || "").trim();
      category = String(form.get("category") || "Karya Kreatif").trim();
      externalLink = String(form.get("externalLink") || "").trim();
      mediaUrl = String(form.get("mediaUrl") || "").trim();
      const rawMediaType = String(form.get("mediaType") || "").trim();
      if (rawMediaType) mediaType = rawMediaType;

      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json({ error: "Ukuran file karya maksimal 25 MB." }, { status: 400 });
        }
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/gif",
          "video/mp4",
          "video/webm",
          "video/quicktime",
        ];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json(
            { error: "Format file tidak didukung. Gunakan JPG, PNG, WebP, GIF, MP4, atau WebM." },
            { status: 400 }
          );
        }

        const sharedUploadsDir = "/var/www/creatorin/shared/uploads";
        const uploadBaseDir = fs.existsSync(sharedUploadsDir)
          ? sharedUploadsDir
          : path.join(process.cwd(), "public", "uploads");
        const uploadDir = path.join(uploadBaseDir, "projects");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const rawExt = path.extname(file.name || "").replace(".", "") || file.type.split("/")[1] || "png";
        const ext = rawExt.toLowerCase() === "jpeg" ? "jpg" : rawExt.toLowerCase();
        const uniqueFileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.promises.writeFile(filePath, buffer);

        savedFilePath = filePath;
        mediaUrl = `/uploads/projects/${uniqueFileName}`;
        mediaType = file.type.startsWith("video/") ? "video" : "image";
      }
    } else {
      const body = await req.json();
      title = String(body.title || "").trim();
      description = String(body.description || "").trim();
      category = String(body.category || "Karya Kreatif").trim();
      externalLink = String(body.externalLink || "").trim();
      mediaUrl = String(body.mediaUrl || "").trim();
      if (body.mediaType) mediaType = body.mediaType;
    }

    if (!title) {
      return NextResponse.json({ error: "Judul karya wajib diisi." }, { status: 400 });
    }

    if (!mediaUrl) {
      return NextResponse.json({ error: "File atau URL media karya wajib disertakan." }, { status: 400 });
    }

    const handle = `@${(user.fullName || "kreator").toLowerCase().replace(/\s+/g, "")}`;

    try {
      const [newProject] = await db
        .insert(projects)
        .values({
          creatorId: user.id,
          title,
          description: description || null,
          category,
          creatorHandle: handle,
          mediaUrl,
          mediaType,
          externalLink: externalLink || null,
        })
        .returning();

      return NextResponse.json({ success: true, project: newProject }, { status: 201 });
    } catch (insertError) {
      if (savedFilePath) {
        try {
          await fs.promises.unlink(savedFilePath);
        } catch {}
      }
      throw insertError;
    }
  } catch (err: any) {
    console.error("POST /api/projects error:", err);
    return NextResponse.json({ error: err.message || "Gagal mengunggah karya." }, { status: 500 });
  }
}
