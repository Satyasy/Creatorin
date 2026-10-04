import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projectBriefs, profiles, businessProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { MOCK_ALL_UMKM } from "@/data/mockUmkm";

export async function GET(req: NextRequest) {
  const db = getDb();
  if (!db) {
    const fallbackListings = MOCK_ALL_UMKM.flatMap((u) => u.activeBriefsList || []);
    const mockBriefs = fallbackListings.map((b) => ({
      id: b.id,
      title: b.title,
      category: b.category,
      description: b.description,
      expectedOutput: b.deliverables?.[0] || "Output sesuai kesepakatan",
      budget: b.formattedBudget,
      deadline: b.deadline,
      status: "open",
      createdAt: new Date().toISOString(),
      businessId: "mock-biz-id",
      businessName: b.clientName,
      businessAvatar: b.clientAvatar,
    }));
    return NextResponse.json({ briefs: mockBriefs });
  }

  try {
    const briefs = await db
      .select({
        id: projectBriefs.id,
        title: projectBriefs.title,
        category: projectBriefs.category,
        description: projectBriefs.description,
        expectedOutput: projectBriefs.expectedOutput,
        budget: projectBriefs.budget,
        deadline: projectBriefs.deadline,
        status: projectBriefs.status,
        createdAt: projectBriefs.createdAt,
        businessId: projectBriefs.businessId,
        businessName: profiles.fullName,
        businessAvatar: profiles.avatarUrl,
      })
      .from(projectBriefs)
      .innerJoin(profiles, eq(projectBriefs.businessId, profiles.id))
      .orderBy(desc(projectBriefs.createdAt));

    return NextResponse.json({ briefs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

  const body = await req.json();
  const { title, category, description, expectedOutput, budget, deadline } = body;

  if (!title || !description || !budget) {
    return NextResponse.json({ error: "Judul, deskripsi, dan budget wajib diisi." }, { status: 400 });
  }

  try {
    const [newBrief] = await db
      .insert(projectBriefs)
      .values({
        businessId: user.id,
        title,
        category: category || "Digital Marketing",
        description,
        expectedOutput,
        budget,
        deadline,
        status: "open",
      })
      .returning();

    return NextResponse.json({ success: true, brief: newBrief }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
