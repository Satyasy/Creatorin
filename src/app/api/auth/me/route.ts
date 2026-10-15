import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCache, setCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json({ user: null, details: null }, { status: 200 });
  }

  const cacheKey = `user:me:${user.id}`;
  const cached = await getCache<{ user: any; details: any }>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, _source: "redis" });
  }

  const db = getDb();
  let details: any = null;

  if (db) {
    if (user.role === "creator" || user.role === "admin") {
      const [c] = await db.select().from(creatorProfiles).where(eq(creatorProfiles.profileId, user.id)).limit(1);
      details = c;
    } else if (user.role === "business") {
      const [b] = await db.select().from(businessProfiles).where(eq(businessProfiles.profileId, user.id)).limit(1);
      details = b;
    }
  }

  const responseData = {
    user,
    details,
  };

  await setCache(cacheKey, responseData, 120);

  return NextResponse.json(responseData);
}
