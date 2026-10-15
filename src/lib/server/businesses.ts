import { getDb } from '@/lib/db';
import { businessProfiles, collaborationRooms, invoices, profiles, projectBriefs } from '@/lib/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { toBusiness } from '@/services/businessService';
import type { UMKMProfile } from '@/types';

export interface BusinessServerData {
  business: UMKMProfile;
  raw: {
    id: string;
    name: string;
    brandName: string;
    logo: string | null;
    coverUrl: string | null;
    coverBanner?: string | null;
    location: string | null;
    category: string;
    bio: string | null;
    website: string | null;
    createdAt: Date;
  };
}

export async function getBusinessServerData(id: string): Promise<BusinessServerData | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const businesses = await db
      .select({
        id: profiles.id,
        name: profiles.fullName,
        logo: profiles.avatarUrl,
        coverUrl: profiles.coverUrl,
        coverBanner: profiles.coverUrl,
        location: profiles.location,
        brandName: businessProfiles.companyName,
        category: businessProfiles.businessCategory,
        bio: businessProfiles.description,
        website: businessProfiles.website,
        createdAt: businessProfiles.createdAt,
      })
      .from(businessProfiles)
      .innerJoin(profiles, eq(businessProfiles.profileId, profiles.id))
      .where(eq(profiles.id, id))
      .limit(1);

    if (!businesses.length) {
      return null;
    }

    const raw = businesses[0];

    const [briefs, completed, paid] = await Promise.all([
      db
        .select()
        .from(projectBriefs)
        .where(eq(projectBriefs.businessId, id))
        .orderBy(desc(projectBriefs.createdAt)),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(collaborationRooms)
        .where(and(eq(collaborationRooms.businessId, id), eq(collaborationRooms.status, 'completed'))),
      db
        .select({ total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)::int` })
        .from(invoices)
        .where(and(eq(invoices.businessId, id), eq(invoices.status, 'paid'))),
    ]);

    const stats = {
      activeBriefs: briefs.filter((brief) => brief.status === 'open').length,
      completedProjects: completed[0]?.count || 0,
      totalPaid: paid[0]?.total || 0,
    };

    const business = toBusiness(raw, briefs, stats);

    return {
      business,
      raw,
    };
  } catch (error) {
    console.error('Error fetching business server data:', error);
    return null;
  }
}
