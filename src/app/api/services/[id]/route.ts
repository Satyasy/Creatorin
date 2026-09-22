import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { services, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [service] = await db
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
      .where(eq(services.id, id))
      .limit(1);

    if (!service) {
      return NextResponse.json({ error: "Layanan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ service });
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
  const { title, category, description, price, estimatedDays, isActive } = body;

  try {
    const [updated] = await db
      .update(services)
      .set({
        title: title || undefined,
        category: category || undefined,
        description: description || undefined,
        price: price || undefined,
        estimatedDays: estimatedDays || undefined,
        isActive: typeof isActive === "boolean" ? isActive : undefined,
      })
      .where(eq(services.id, id))
      .returning();

    return NextResponse.json({ success: true, service: updated });
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
    await db.delete(services).where(eq(services.id, id));
    return NextResponse.json({ success: true, message: "Layanan berhasil dihapus" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
