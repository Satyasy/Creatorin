import { getDb } from '@/lib/db';
import { projectBriefs, profiles, businessProfiles, briefApplications } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import type { ProjectListing } from '@/types';

export interface BriefServerData {
  brief: ProjectListing;
  raw: {
    id: string;
    title: string;
    category: string;
    description: string | null;
    budget: string | null;
    deadline: string | null;
    companyName: string | null;
    businessLocation: string | null;
    businessAvatar: string | null;
    expectedOutput: string | null;
    createdAt: Date;
    applicationsCount: number;
  };
}

export async function getBriefServerData(id: string): Promise<BriefServerData | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const briefRows = await db
      .select({
        id: projectBriefs.id,
        businessId: projectBriefs.businessId,
        title: projectBriefs.title,
        category: projectBriefs.category,
        description: projectBriefs.description,
        expectedOutput: projectBriefs.expectedOutput,
        budget: projectBriefs.budget,
        deadline: projectBriefs.deadline,
        status: projectBriefs.status,
        createdAt: projectBriefs.createdAt,
        companyName: businessProfiles.companyName,
        businessCategory: businessProfiles.businessCategory,
        businessAvatar: profiles.avatarUrl,
        businessLocation: profiles.location,
      })
      .from(projectBriefs)
      .innerJoin(profiles, eq(projectBriefs.businessId, profiles.id))
      .leftJoin(businessProfiles, eq(profiles.id, businessProfiles.profileId))
      .where(eq(projectBriefs.id, id))
      .limit(1);

    if (!briefRows.length) return null;

    const row = briefRows[0];

    const [appCountResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(briefApplications)
      .where(eq(briefApplications.briefId, id));

    const applicationsCount = appCountResult?.count || 0;

    const brief: ProjectListing = {
      id: row.id,
      title: row.title,
      clientName: row.companyName || '',
      clientAvatar: row.businessAvatar || '',
      clientLocation: row.businessLocation || '',
      category: row.category || '',
      budgetMin: Number(String(row.budget || '').replace(/\D/g, '')) || 0,
      budgetMax: Number(String(row.budget || '').replace(/\D/g, '')) || 0,
      formattedBudget: row.budget || '',
      deadline: row.deadline || '',
      description: row.description || '',
      deliverables: row.expectedOutput ? [row.expectedOutput] : [],
      requiredSkills: [],
      proposalsCount: applicationsCount,
      postedTimeAgo: '',
    };

    return {
      brief,
      raw: {
        id: row.id,
        title: row.title,
        category: row.category,
        description: row.description,
        budget: row.budget,
        deadline: row.deadline,
        companyName: row.companyName,
        businessLocation: row.businessLocation,
        businessAvatar: row.businessAvatar,
        expectedOutput: row.expectedOutput,
        createdAt: row.createdAt,
        applicationsCount,
      },
    };
  } catch (error) {
    console.error('Error fetching brief server data:', error);
    return null;
  }
}
