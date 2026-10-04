import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { briefApplications, projectBriefs } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: briefId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "creator") return NextResponse.json({ error: "Hanya kreator dapat melamar brief." }, { status: 403 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { pitch, proposedPrice } = body;
  if (!String(pitch || '').trim() || !String(proposedPrice || '').trim()) return NextResponse.json({ error: "Pesan dan tawaran harga wajib diisi." }, { status: 400 });

  try {
    const [brief] = await db.select({ status: projectBriefs.status }).from(projectBriefs).where(eq(projectBriefs.id, briefId)).limit(1);
    if (!brief || brief.status !== 'open') return NextResponse.json({ error: "Brief tidak tersedia untuk lamaran." }, { status: 404 });
    const [existing] = await db.select({ id: briefApplications.id }).from(briefApplications).where(and(eq(briefApplications.briefId, briefId), eq(briefApplications.creatorId, user.id))).limit(1);
    if (existing) return NextResponse.json({ error: "Anda sudah melamar brief ini." }, { status: 409 });
    const [application] = await db
      .insert(briefApplications)
      .values({
        briefId,
        creatorId: user.id,
        pitch: pitch || "",
        proposedPrice: proposedPrice || "",
        status: "pending",
      })
      .returning();

    return NextResponse.json({ success: true, application }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
