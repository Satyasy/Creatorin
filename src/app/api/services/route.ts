import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { services, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const creatorId = searchParams.get("creatorId");
  const search = searchParams.get("search");

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    let query = db
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
      .innerJoin(profiles, eq(services.creatorId, profiles.id))
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
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "creator") return NextResponse.json({ error: "Hanya kreator dapat membuat layanan." }, { status: 403 });

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  const form = await req.formData();
  const title = String(form.get("title") || "").trim();
  const category = String(form.get("category") || "").trim();
  const description = String(form.get("description") || "").trim();
  const price = String(form.get("price") || "").trim();
  const estimatedDays = String(form.get("estimatedDays") || "").trim();
  const file = form.get("file");

  if (!title || !category || !price) {
    return NextResponse.json({ error: "Judul, kategori, dan harga wajib diisi." }, { status: 400 });
  }

  try {
    let imageUrl: string | undefined;
    let uploadedPath: string | undefined;
    const supabase = await createClient();
    if (file instanceof File && file.size > 0) {
      if (file.size > 20 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        return NextResponse.json({ error: "Gunakan JPG, PNG, atau WebP maksimal 20 MB." }, { status: 400 });
      }
      uploadedPath = `${user.id}/${crypto.randomUUID()}.${file.type === "image/jpeg" ? "jpg" : file.type.split("/")[1]}`;
      const { error } = await supabase.storage.from("project-media").upload(uploadedPath, file, { contentType: file.type });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      imageUrl = supabase.storage.from("project-media").getPublicUrl(uploadedPath).data.publicUrl;
    }
    const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
    let newService;
    try {
      [newService] = await db
      .insert(services)
      .values({
        creatorId: user.id,
        title,
        category,
        description: description || "",
        price,
        priceNumeric: numeric,
        estimatedDays,
        shapeIdx: 0,
        imageUrl,
        isActive: true,
      })
      .returning();
    } catch (error) {
      if (uploadedPath) await supabase.storage.from("project-media").remove([uploadedPath]);
      throw error;
    }

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
