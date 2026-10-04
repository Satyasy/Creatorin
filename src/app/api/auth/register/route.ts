import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles, creatorWallets, schoolProfiles, schools } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role = "creator" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, dan nama lengkap wajib diisi." }, { status: 400 });
    }
    if (!['creator', 'business'].includes(role)) return NextResponse.json({ error: "Peran akun tidak valid." }, { status: 400 });
    const db = getDb();
    if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Ensure database rows exist (in case trigger is delayed)
    if (data.user) {
      const userId = data.user.id;
      await db.insert(profiles).values({
        id: userId,
        role: role as any,
        fullName,
        email,
      }).onConflictDoNothing();

      if (role === "creator") {
        await db.insert(creatorProfiles).values({
          profileId: userId,
          slug: `creator-${userId}`,
          headline: "",
        }).onConflictDoNothing();

        await db.insert(creatorWallets).values({
          creatorId: userId,
          balance: 0,
          points: 0,
        }).onConflictDoNothing();
      } else if (role === "business") {
        await db.insert(businessProfiles).values({
          profileId: userId,
          companyName: fullName,
          businessCategory: "",
        }).onConflictDoNothing();
      } else if (role === "school") {
        await db.insert(schoolProfiles).values({
          profileId: userId,
          schoolName: fullName,
          picName: fullName,
        }).onConflictDoNothing();
        await db.insert(creatorWallets).values({ creatorId: userId, balance: 0, points: 0 }).onConflictDoNothing();
        await db.insert(schools).values({ profileId: userId, name: fullName, slug: `school-${userId}` }).onConflictDoNothing();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil.",
      requiresConfirmation: !data.session,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role,
        fullName,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
