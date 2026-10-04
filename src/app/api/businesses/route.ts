import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { businessProfiles, collaborationRooms, invoices, profiles, projectBriefs } from '@/lib/db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const db = getDb();
  if (!db) return NextResponse.json({ error: 'Database not connected' }, { status: 503 });
  const id = new URL(request.url).searchParams.get('id');
  try {
    const businesses = await db.select({
      id: profiles.id, name: profiles.fullName, logo: profiles.avatarUrl,
      location: profiles.location, brandName: businessProfiles.companyName,
      category: businessProfiles.businessCategory, bio: businessProfiles.description,
      website: businessProfiles.website, createdAt: businessProfiles.createdAt,
    }).from(businessProfiles).innerJoin(profiles, eq(businessProfiles.profileId, profiles.id));
    const list = id ? businesses.filter((business) => business.id === id) : businesses;
    if (id && !list.length) return NextResponse.json({ error: 'Profil UMKM tidak ditemukan.' }, { status: 404 });
    if (!id) return NextResponse.json({ businesses: list });
    const [briefs, completed, paid] = await Promise.all([
      db.select().from(projectBriefs).where(eq(projectBriefs.businessId, id!)).orderBy(desc(projectBriefs.createdAt)),
      db.select({ count: sql<number>`count(*)::int` }).from(collaborationRooms).where(and(eq(collaborationRooms.businessId, id!), eq(collaborationRooms.status, 'completed'))),
      db.select({ total: sql<number>`coalesce(sum(${invoices.totalAmount}), 0)::int` }).from(invoices).where(and(eq(invoices.businessId, id!), eq(invoices.status, 'paid'))),
    ]);
    return NextResponse.json({
      business: list[0],
      briefs,
      stats: {
        activeBriefs: briefs.filter((brief) => brief.status === 'open').length,
        completedProjects: completed[0]?.count || 0,
        totalPaid: paid[0]?.total || 0,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal memuat UMKM.' }, { status: 500 });
  }
}
