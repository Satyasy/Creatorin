import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  let details: any = null;

  if (db) {
    if (user.role === "creator") {
      const [c] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.profileId, user.id)).limit(1);
      details = c;
    } else if (user.role === "business") {
      const [b] = await db.select().from(businessProfiles).where(eq(businessProfiles.profileId, user.id)).limit(1);
      details = b;
    }
  }

  return NextResponse.json({
    user,
    details,
  });
}
