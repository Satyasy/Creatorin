import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { collaborationRooms, projectBriefs, briefApplications, messages, conversations, creatorWallets, profiles, creatorProfiles } from "@/lib/db/schema";
import { eq, or, and, desc, count, sql } from "drizzle-orm";
import { getCache, setCache } from "@/lib/redis";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cacheKey = `feed:${user.id}:${user.role}`;
  const cached = await getCache<any>(cacheKey);
  if (cached) {
    return NextResponse.json({ ...cached, _source: "redis" });
  }

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  try {
    if (user.role === "creator") {
      // 1. Active collaboration rooms
      const activeRooms = await db
        .select({
          id: collaborationRooms.id,
          title: collaborationRooms.title,
          deadline: collaborationRooms.deadline,
          status: collaborationRooms.status,
          businessId: collaborationRooms.businessId,
          businessName: profiles.fullName,
        })
        .from(collaborationRooms)
        .innerJoin(profiles, eq(collaborationRooms.businessId, profiles.id))
        .where(
          and(
            eq(collaborationRooms.creatorId, user.id),
            or(eq(collaborationRooms.status, "in_progress"), eq(collaborationRooms.status, "revision_requested"))
          )
        )
        .limit(5);

      // 2. Open briefs available to apply
      const openBriefs = await db
        .select()
        .from(projectBriefs)
        .where(eq(projectBriefs.status, "open"))
        .orderBy(desc(projectBriefs.createdAt))
        .limit(6);

      // 3. Wallet summary
      let [wallet] = await db
        .select()
        .from(creatorWallets)
        .where(eq(creatorWallets.creatorId, user.id))
        .limit(1);

      const data = {
        role: "creator",
        user,
        feed: {
          activeRooms,
          openBriefs,
          wallet: {
            balance: wallet?.balance || 0,
            points: wallet?.points || 0,
          },
          quickStats: {
            activeProjectsCount: activeRooms.length,
          },
        },
      };
      await setCache(cacheKey, data, 60);
      return NextResponse.json(data);
    } else {
      // Business role
      // 1. My open briefs with applicants count
      const myBriefs = await db
        .select()
        .from(projectBriefs)
        .where(eq(projectBriefs.businessId, user.id))
        .orderBy(desc(projectBriefs.createdAt))
        .limit(5);

      // 2. Running projects in collaboration room
      const runningProjects = await db
        .select({
          id: collaborationRooms.id,
          title: collaborationRooms.title,
          status: collaborationRooms.status,
          deadline: collaborationRooms.deadline,
          creatorName: profiles.fullName,
        })
        .from(collaborationRooms)
        .innerJoin(profiles, eq(collaborationRooms.creatorId, profiles.id))
        .where(
          and(
            eq(collaborationRooms.businessId, user.id),
            or(eq(collaborationRooms.status, "in_progress"), eq(collaborationRooms.status, "review_pending"))
          )
        )
        .limit(5);

      // 3. Recommended creators
      const recommendedCreators = await db
        .select({
          id: profiles.id,
          name: profiles.fullName,
          avatarUrl: profiles.avatarUrl,
          slug: creatorProfiles.slug,
          headline: creatorProfiles.headline,
          rating: creatorProfiles.rating,
          careerScore: creatorProfiles.careerScore,
        })
        .from(creatorProfiles)
        .innerJoin(profiles, eq(creatorProfiles.profileId, profiles.id))
        .orderBy(desc(creatorProfiles.careerScore))
        .limit(4);

      const data = {
        role: "business",
        user,
        feed: {
          myBriefs,
          runningProjects,
          recommendedCreators,
          quickStats: {
            openBriefsCount: myBriefs.length,
            runningProjectsCount: runningProjects.length,
          },
        },
      };
      await setCache(cacheKey, data, 60);
      return NextResponse.json(data);
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
