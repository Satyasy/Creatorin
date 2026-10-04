import { NextRequest, NextResponse } from 'next/server';
import { and, desc, eq } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { getDb } from '@/lib/db';
import { briefApplications, businessProfiles, profiles, projectBriefs } from '@/lib/db/schema';
import { MOCK_PROJECTS } from '@/data/mockProjects';

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ contracts: demoContracts(), demo: true });
  if (user.role !== 'creator') return NextResponse.json({ error: 'Creator only' }, { status: 403 });

  const db = getDb();
  if (!db) return NextResponse.json({ contracts: demoContracts(), demo: true });

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

function demoContracts() {
  return MOCK_PROJECTS.slice(0, 4).map((brief, index) => ({
    id: `demo-contract-${brief.id}`,
    briefId: brief.id,
    status: index === 0 ? 'accepted' : 'pending',
    proposedPrice: index === 0 ? 'Rp2.000.000' : brief.formattedBudget,
    appliedAt: undefined,
    title: brief.title,
    category: brief.category,
    description: brief.description,
    budget: brief.formattedBudget,
    deadline: brief.deadline,
    businessName: brief.clientName,
    businessAvatar: brief.clientAvatar,
    businessLocation: brief.clientLocation,
  }));
}
