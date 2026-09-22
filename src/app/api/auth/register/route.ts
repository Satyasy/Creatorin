import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles, creatorWallets, schoolProfiles } from "@/lib/db/schema";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role = "creator" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json({ error: "Email, password, dan nama lengkap wajib diisi." }, { status: 400 });
    }

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
    const db = getDb();
    if (db && data.user) {
      const userId = data.user.id;
      await db.insert(profiles).values({
        id: userId,
        role: role as any,
        fullName,
      }).onConflictDoNothing();

      if (role === "creator") {
        await db.insert(creatorProfiles).values({
          profileId: userId,
          slug: fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          headline: "Kreator Baru di Creatorin",
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
          businessCategory: "UMKM / Bisnis",
        }).onConflictDoNothing();
      } else if (role === "school") {
        await db.insert(schoolProfiles).values({
          profileId: userId,
          schoolName: fullName,
          picName: fullName,
        }).onConflictDoNothing();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil.",
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
