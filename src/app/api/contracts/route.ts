import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { briefApplications, businessProfiles, profiles, projectBriefs } from '@/lib/db/schema';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.role !== 'creator') return NextResponse.json({ error: 'Creator only' }, { status: 403 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });

  try {
    const contracts = await db
      .select({
        id: briefApplications.id,
        briefId: briefApplications.briefId,
        status: briefApplications.status,
        proposedPrice: briefApplications.proposedPrice,
        pitch: briefApplications.pitch,
        appliedAt: briefApplications.createdAt,
        title: projectBriefs.title,
        category: projectBriefs.category,
        description: projectBriefs.description,
        budget: projectBriefs.budget,
        deadline: projectBriefs.deadline,
        briefStatus: projectBriefs.status,
        businessName: profiles.fullName,
        businessAvatar: profiles.avatarUrl,
        businessLocation: profiles.location,
        companyName: businessProfiles.companyName,
      })
      .from(briefApplications)
      .innerJoin(projectBriefs, eq(briefApplications.briefId, projectBriefs.id))
      .innerJoin(profiles, eq(projectBriefs.businessId, profiles.id))
      .leftJoin(businessProfiles, eq(projectBriefs.businessId, businessProfiles.profileId))
      .where(and(eq(briefApplications.creatorId, user.id)))
      .orderBy(desc(briefApplications.createdAt));

    return NextResponse.json({ contracts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memuat daftar lamaran.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
