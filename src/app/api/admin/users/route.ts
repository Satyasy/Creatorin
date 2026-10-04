import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles, schools } from "@/lib/db/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const searchParams = req.nextUrl.searchParams;
    const role = searchParams.get("role");
    const search = searchParams.get("search")?.trim();
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
    const offset = Number(searchParams.get("offset")) || 0;

    let query = db.select().from(profiles);

    const conditions = [];
    if (role && ["admin", "creator", "business", "school"].includes(role)) {
      conditions.push(eq(profiles.role, role as "admin" | "creator" | "business" | "school"));
    }
    if (search) {
      conditions.push(
        or(
          ilike(profiles.fullName, `%${search}%`),
          ilike(profiles.email, `%${search}%`)
        )
      );
    }

    let finalQuery;
    if (conditions.length === 1) {
      finalQuery = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      finalQuery = query.where(sql`${conditions[0]} and ${conditions[1]}`);
    } else {
      finalQuery = query;
    }

    const rows = await finalQuery
      .orderBy(sql`${profiles.createdAt} desc`)
      .limit(limit)
      .offset(offset);

    // Hitung total count
    const [countResult] = await db.select({ total: sql<number>`count(*)::int` }).from(profiles);

    return NextResponse.json({
      success: true,
      users: rows.map(u => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        avatarUrl: u.avatarUrl,
        phone: u.phone,
        location: u.location,
        createdAt: u.createdAt,
      })),
      total: countResult?.total || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error("Admin users list error:", error);
    return NextResponse.json({ error: "Gagal mengambil daftar pengguna." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const body = await req.json();
    const { userId, role, fullName } = body;

    if (!userId) return NextResponse.json({ error: "User ID diperlukan." }, { status: 400 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (role && ["admin", "creator", "business", "school"].includes(role)) {
      updateData.role = role;
    }
    if (fullName) {
      updateData.fullName = fullName;
    }

    const [updated] = await db
      .update(profiles)
      .set(updateData)
      .where(eq(profiles.id, userId))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Profil pengguna berhasil diperbarui.",
      user: {
        id: updated.id,
        fullName: updated.fullName,
        email: updated.email,
        role: updated.role,
      },
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pengguna." }, { status: 500 });
  }
}
