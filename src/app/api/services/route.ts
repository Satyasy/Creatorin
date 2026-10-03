import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { services, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, desc, ilike, and } from "drizzle-orm";
import { MOCK_CREATORS } from "@/data/mockCreators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const creatorId = searchParams.get("creatorId");
  const search = searchParams.get("search");

  const db = getDb();
  if (!db) {
    let allServices = MOCK_CREATORS.flatMap((c) =>
      (c.services || []).map((s, idx) => ({
        id: s.id,
        title: s.title,
        category: s.tag || s.category || c.category || "Desain",
        description: s.description || "Layanan kreatif profesional oleh " + c.name,
        price: s.formattedPrice || "Rp" + s.price.toLocaleString("id-ID"),
        priceNumeric: s.price,
        estimatedDays: parseInt(s.deliveryDays?.replace(/[^0-9]/g, "") || "3"),
        shapeIdx: idx,
        imageUrl: s.coverImage || c.avatar,
        isActive: true,
        createdAt: new Date().toISOString(),
        creatorId: c.id,
        creatorName: c.name,
        creatorAvatar: c.avatar,
        creatorSlug: c.username || c.id,
      }))
    );
    if (category) {
      allServices = allServices.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }
    if (creatorId) {
      allServices = allServices.filter(s => s.creatorId === creatorId);
    }
    if (search) {
      allServices = allServices.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.creatorName.toLowerCase().includes(search.toLowerCase()));
    }
    return NextResponse.json({ services: allServices });
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

    return NextResponse.json({ success: true, service: newService }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
