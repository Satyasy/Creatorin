import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getDb } from "@/lib/db";
import { projectBriefs, profiles, businessProfiles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const businessId = new URL(req.url).searchParams.get("businessId");
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

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

    return NextResponse.json({ briefs: businessId ? briefs.filter((brief) => brief.businessId === businessId) : briefs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "business") return NextResponse.json({ error: "Hanya UMKM dapat membuat brief." }, { status: 403 });

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
