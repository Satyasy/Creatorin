import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { services, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const creatorId = searchParams.get("creatorId");
  const search = searchParams.get("search");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const query = db
      .select({
        id: services.id,
        title: services.title,
        category: services.category,
        description: services.description,
        price: services.price,
        priceNumeric: services.priceNumeric,
        estimatedDays: services.estimatedDays,
        shapeIdx: services.shapeIdx,
        imageUrl: services.imageUrl,
        isActive: services.isActive,
        createdAt: services.createdAt,
        creatorId: services.creatorId,
        creatorName: profiles.fullName,
        creatorAvatar: profiles.avatarUrl,
        creatorSlug: creatorProfiles.slug,
      })
      .from(services)
      .leftJoin(profiles, eq(services.creatorId, profiles.id))
      .leftJoin(creatorProfiles, eq(profiles.id, creatorProfiles.profileId))
      .where(eq(services.isActive, true))
      .orderBy(desc(services.createdAt));

    const rows = await query;
    let filtered = rows;

    if (category) {
      filtered = filtered.filter((r) => r.category.toLowerCase() === category.toLowerCase());
    }
    if (creatorId) {
      filtered = filtered.filter((r) => r.creatorId === creatorId);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((r) => r.title.toLowerCase().includes(s) || r.category.toLowerCase().includes(s));
    }

    return NextResponse.json({ services: filtered });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
  }
  if (user.role !== "creator" && user.role !== "admin") {
    return NextResponse.json({ error: "Hanya kreator dapat membuat layanan." }, { status: 403 });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    let title = "";
    let category = "";
    let description = "";
    let price = "";
    let estimatedDays = "3 Hari Kerja";
    let imageUrl: string | undefined = undefined;
    let savedFilePath: string | null = null;

    const contentType = req.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      title = String(form.get("title") || "").trim();
      category = String(form.get("category") || "").trim();
      description = String(form.get("description") || "").trim();
      price = String(form.get("price") || "").trim();
      const passedDays = String(form.get("estimatedDays") || "").trim();
      if (passedDays) estimatedDays = passedDays;
      const passedImageUrl = String(form.get("imageUrl") || "").trim();
      if (passedImageUrl) imageUrl = passedImageUrl;

      const file = form.get("file");
      if (file instanceof File && file.size > 0) {
        if (file.size > 25 * 1024 * 1024) {
          return NextResponse.json({ error: "Ukuran gambar cover maksimal 25 MB." }, { status: 400 });
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ error: "Format gambar tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 });
        }

        const sharedUploadsDir = "/var/www/creatorin/shared/uploads";
        const uploadBaseDir = fs.existsSync(sharedUploadsDir)
          ? sharedUploadsDir
          : path.join(process.cwd(), "public", "uploads");
        const uploadDir = path.join(uploadBaseDir, "services");
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
        imageUrl = `/uploads/services/${uniqueFileName}`;
      }
    } else {
      const body = await req.json();
      title = String(body.title || "").trim();
      category = String(body.category || "").trim();
      description = String(body.description || "").trim();
      price = String(body.price || "").trim();
      if (body.estimatedDays) estimatedDays = String(body.estimatedDays).trim();
      if (body.imageUrl) imageUrl = String(body.imageUrl).trim();
    }

    if (!title || !category || !price) {
      return NextResponse.json({ error: "Judul, kategori, dan harga wajib diisi." }, { status: 400 });
    }

    const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
    const formattedPrice = price.startsWith("Rp") ? price : `Rp${numeric.toLocaleString("id-ID")}`;

    try {
      const [newService] = await db
        .insert(services)
        .values({
          creatorId: user.id,
          title,
          category,
          description: description || "",
          price: formattedPrice,
          priceNumeric: numeric,
          estimatedDays,
          shapeIdx: 0,
          imageUrl: imageUrl || null,
          isActive: true,
        })
        .returning();

      return NextResponse.json({ success: true, service: newService }, { status: 201 });
    } catch (insertError) {
      if (savedFilePath) {
        try {
          await fs.promises.unlink(savedFilePath);
        } catch {}
      }
      throw insertError;
    }
  } catch (err: any) {
    console.error("POST /api/services error:", err);
    return NextResponse.json({ error: err.message || "Gagal membuat layanan." }, { status: 500 });
  }
}
