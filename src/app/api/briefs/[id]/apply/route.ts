import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { briefApplications } from "@/lib/db/schema";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: briefId } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { pitch, proposedPrice } = body;

  try {
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
