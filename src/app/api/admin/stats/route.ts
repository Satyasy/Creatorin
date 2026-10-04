import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, projectBriefs, invoices, schools, services, projects } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { verifyAdminRequest } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await verifyAdminRequest(req);
    if (!admin) {
      return NextResponse.json({ error: "Akses ditolak. Diperlukan sesi Admin." }, { status: 403 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database offline" }, { status: 503 });
    }

    // 1. User stats by role
    const userRoleCounts = await db
      .select({
        role: profiles.role,
        count: sql<number>`count(*)::int`,
      })
      .from(profiles)
      .groupBy(profiles.role);

    const userStats = {
      total: 0,
      admin: 0,
      creator: 0,
      business: 0,
      school: 0,
    };

    userRoleCounts.forEach((row) => {
      userStats.total += row.count;
      if (row.role in userStats) {
        userStats[row.role as keyof typeof userStats] = row.count;
      }
    });

    // 2. Project briefs stats
    const [briefStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        open: sql<number>`count(case when status = 'open' then 1 end)::int`,
        inProgress: sql<number>`count(case when status = 'in_progress' then 1 end)::int`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)::int`,
      })
      .from(projectBriefs);

    // 3. Financial & Invoices stats
    const [invoiceStats] = await db
      .select({
        totalCount: sql<number>`count(*)::int`,
        paidCount: sql<number>`count(case when status = 'paid' then 1 end)::int`,
        unpaidCount: sql<number>`count(case when status = 'unpaid' then 1 end)::int`,
        totalVolume: sql<string>`coalesce(sum(total_amount), 0)::text`,
        paidVolume: sql<string>`coalesce(sum(case when status = 'paid' then total_amount else 0 end), 0)::text`,
      })
      .from(invoices);

    // 4. Schools stats
    const [schoolStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        verified: sql<number>`count(case when is_verified = true then 1 end)::int`,
        pending: sql<number>`count(case when is_verified = false then 1 end)::int`,
      })
      .from(schools);

    // 5. Total Services & Portfolios
    const [serviceStats] = await db.select({ total: sql<number>`count(*)::int` }).from(services);
    const [projectCount] = await db.select({ total: sql<number>`count(*)::int` }).from(projects);

    // 6. Recent users
    const recentUsers = await db
      .select({
        id: profiles.id,
        fullName: profiles.fullName,
        email: profiles.email,
        role: profiles.role,
        avatarUrl: profiles.avatarUrl,
        createdAt: profiles.createdAt,
      })
      .from(profiles)
      .orderBy(sql`${profiles.createdAt} desc`)
      .limit(6);

    return NextResponse.json({
      success: true,
      data: {
        users: userStats,
        briefs: briefStats || { total: 0, open: 0, inProgress: 0, completed: 0 },
        invoices: {
          totalCount: invoiceStats?.totalCount || 0,
          paidCount: invoiceStats?.paidCount || 0,
          unpaidCount: invoiceStats?.unpaidCount || 0,
          totalVolume: Number(invoiceStats?.totalVolume || 0),
          paidVolume: Number(invoiceStats?.paidVolume || 0),
        },
        schools: schoolStats || { total: 0, verified: 0, pending: 0 },
        services: serviceStats?.total || 0,
        portfolioProjects: projectCount?.total || 0,
        recentUsers,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Gagal mengambil data statistik admin." }, { status: 500 });
  }
}
