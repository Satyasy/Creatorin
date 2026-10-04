import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { schools } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const rows = await db
      .select()
      .from(schools)
      .orderBy(sql`${schools.createdAt} desc`)
      .limit(50);

    return NextResponse.json({ success: true, schools: rows });
  } catch (error) {
    console.error("Admin schools error:", error);
    return NextResponse.json({ error: "Gagal memuat data sekolah." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const body = await req.json();
    const { schoolId, isVerified } = body;

    if (!schoolId || typeof isVerified !== "boolean") {
      return NextResponse.json({ error: "Parameter tidak valid." }, { status: 400 });
    }

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const [updated] = await db
      .update(schools)
      .set({ isVerified })
      .where(eq(schools.id, schoolId))
      .returning();

    return NextResponse.json({
      success: true,
      message: `Sekolah berhasil ${isVerified ? "diverifikasi" : "dibatalkan verifikasinya"}.`,
      school: updated,
    });
  } catch (error) {
    console.error("Admin school update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui verifikasi sekolah." }, { status: 500 });
  }
}
