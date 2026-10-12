import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { creatorProfiles, profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getAuthenticatedUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Harap masuk akun untuk mengikuti kreator." },
      { status: 401 }
    );
  }

  const db = getDb();
  if (!db) {
    return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  }

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    // Look up creator
    const creatorList = isUuid
      ? await db
          .select({ profileId: creatorProfiles.profileId, followersCount: creatorProfiles.followersCount })
          .from(creatorProfiles)
          .where(eq(creatorProfiles.profileId, id))
          .limit(1)
      : await db
          .select({ profileId: creatorProfiles.profileId, followersCount: creatorProfiles.followersCount })
          .from(creatorProfiles)
          .where(eq(creatorProfiles.slug, id))
          .limit(1);

    if (!creatorList || creatorList.length === 0) {
      return NextResponse.json({ error: "Kreator tidak ditemukan" }, { status: 404 });
    }

    const creator = creatorList[0];
    const body = await req.json().catch(() => ({}));
    const shouldFollow = typeof body.follow === "boolean" ? body.follow : true;

    const currentCount = parseInt(creator.followersCount || "0", 10) || 0;
    const newCount = shouldFollow
      ? currentCount + 1
      : Math.max(0, currentCount - 1);

    await db
      .update(creatorProfiles)
      .set({ followersCount: String(newCount) })
      .where(eq(creatorProfiles.profileId, creator.profileId));

    return NextResponse.json({
      success: true,
      isFollowing: shouldFollow,
      followersCount: newCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memperbarui status follow." },
      { status: 500 }
    );
  }
}
