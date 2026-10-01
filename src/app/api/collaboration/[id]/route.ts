import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, submissions, profiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    const [room] = await db
      .select({
        id: collaborationRooms.id,
        invoiceId: collaborationRooms.invoiceId,
        title: collaborationRooms.title,
        briefSummary: collaborationRooms.briefSummary,
        deadline: collaborationRooms.deadline,
        status: collaborationRooms.status,
        approvedAt: collaborationRooms.approvedAt,
        createdAt: collaborationRooms.createdAt,
        creatorId: collaborationRooms.creatorId,
        businessId: collaborationRooms.businessId,
        creatorName: profiles.fullName,
      })
      .from(collaborationRooms)
      .innerJoin(profiles, eq(collaborationRooms.creatorId, profiles.id))
      .where(eq(collaborationRooms.id, id))
      .limit(1);

    if (!room) {
      return NextResponse.json({ error: "Collaboration Room tidak ditemukan" }, { status: 404 });
    }

    const roomSubmissions = await db
      .select()
      .from(submissions)
      .where(eq(submissions.roomId, id))
      .orderBy(desc(submissions.version));

    return NextResponse.json({
      room,
      submissions: roomSubmissions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
