import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { projectBriefs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");

    let query = db.select().from(projectBriefs);
    if (status) {
      query = query.where(eq(projectBriefs.status, status)) as typeof query;
    }

    const rows = await query.orderBy(sql`${projectBriefs.createdAt} desc`).limit(50);
    return NextResponse.json({ success: true, briefs: rows });
  } catch (error) {
    console.error("Admin briefs error:", error);
    return NextResponse.json({ error: "Gagal memuat brief proyek." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });

    const body = await req.json();
    const { briefId, status } = body;

    if (!briefId || !status) return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });

    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database offline" }, { status: 503 });

    const [updated] = await db
      .update(projectBriefs)
      .set({ status })
      .where(eq(projectBriefs.id, briefId))
      .returning();

    return NextResponse.json({ success: true, brief: updated });
  } catch (error) {
    console.error("Admin brief update error:", error);
    return NextResponse.json({ error: "Gagal memperbarui status brief." }, { status: 500 });
  }
}
