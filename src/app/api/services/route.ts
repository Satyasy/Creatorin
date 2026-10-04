import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { services, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import { getCache, setCache, deleteCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const creatorId = searchParams.get("creatorId");
  const search = searchParams.get("search");

  const cacheKey = `services:${category || "all"}:${creatorId || "all"}:${search || "all"}`;
  const cached = await getCache<{ services: any[] }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, _source: "redis" });
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

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

    const result = { services: filtered };
    await setCache(cacheKey, result, 180);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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

  const body = await req.json();
  const { title, category, description, price, estimatedDays, shapeIdx = 0, imageUrl } = body;

  if (!title || !category || !price) {
    return NextResponse.json({ error: "Judul, kategori, dan harga wajib diisi." }, { status: 400 });
  }

  try {
    const numeric = parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
    const [newService] = await db
      .insert(services)
      .values({
        creatorId: user.id,
        title,
        category,
        description: description || "",
        price,
        priceNumeric: numeric,
        estimatedDays: estimatedDays || "2 Hari Kerja",
        shapeIdx: Number(shapeIdx),
        imageUrl,
        isActive: true,
      })
      .returning();

    // Invalidate cached services lists
    await deleteCache("services:*");

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
