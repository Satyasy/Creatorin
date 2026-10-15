import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { businessProfiles, collaborationRooms, invoices, profiles, projectBriefs } from '@/lib/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  const id = new URL(request.url).searchParams.get('id');
  try {
    if (id) {
      const rows = await db.select({
        id: profiles.id,
        name: profiles.fullName,
        logo: profiles.avatarUrl,
        coverUrl: profiles.coverUrl,
        coverBanner: profiles.coverUrl,
        location: profiles.location,
        brandName: sql<string>`coalesce(${businessProfiles.companyName}, ${profiles.fullName})`,
        category: sql<string>`coalesce(${businessProfiles.businessCategory}, 'Retail / Brand')`,
        bio: sql<string>`coalesce(${businessProfiles.description}, '')`,
        website: businessProfiles.website,
        createdAt: sql<Date>`coalesce(${businessProfiles.createdAt}, ${profiles.createdAt})`,
      }).from(profiles)
      .leftJoin(businessProfiles, eq(profiles.id, businessProfiles.profileId))
      .where(and(eq(profiles.id, id), eq(profiles.role, 'business')))
      .limit(1);

      if (!rows.length) {
        return NextResponse.json({ error: 'Profil UMKM tidak ditemukan.' }, { status: 404 });
      }

      const [briefs, completed, paid] = await Promise.all([
        db.select().from(projectBriefs).where(eq(projectBriefs.businessId, id)).orderBy(desc(projectBriefs.createdAt)),
        db.select({ count: sql<number>`count(*)::int` }).from(collaborationRooms).where(and(eq(collaborationRooms.businessId, id), eq(collaborationRooms.status, 'completed'))),
        db.select({ total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)::int` }).from(invoices).where(and(eq(invoices.businessId, id), eq(invoices.status, 'paid'))),
      ]);

      return NextResponse.json({
        business: rows[0],
        briefs,
        stats: {
          activeBriefs: briefs.filter((brief) => brief.status === 'open').length,
          completedProjects: completed[0]?.count || 0,
          totalPaid: paid[0]?.total || 0,
        },
      });
    }

    const businesses = await db.select({
      id: profiles.id,
      name: profiles.fullName,
      logo: profiles.avatarUrl,
      coverUrl: profiles.coverUrl,
      coverBanner: profiles.coverUrl,
      location: profiles.location,
      brandName: sql<string>`coalesce(${businessProfiles.companyName}, ${profiles.fullName})`,
      category: sql<string>`coalesce(${businessProfiles.businessCategory}, 'Retail / Brand')`,
      bio: sql<string>`coalesce(${businessProfiles.description}, '')`,
      website: businessProfiles.website,
      createdAt: sql<Date>`coalesce(${businessProfiles.createdAt}, ${profiles.createdAt})`,
    }).from(profiles)
    .leftJoin(businessProfiles, eq(profiles.id, businessProfiles.profileId))
    .where(eq(profiles.role, 'business'));

    return NextResponse.json({ businesses });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal memuat UMKM.' }, { status: 500 });
  }
}
