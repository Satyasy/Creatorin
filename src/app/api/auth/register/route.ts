import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles, creatorProfiles, businessProfiles, creatorWallets, schoolProfiles, schools } from "@/lib/db/schema";
import { hashPassword, signJwtToken } from "@/lib/auth-local";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, fullName, role = "creator" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    if (!["creator", "business", "school"].includes(role)) {
      return NextResponse.json({ error: "Peran akun tidak valid." }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cek apakah email sudah terdaftar
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.email, cleanEmail))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan gunakan email lain atau masuk." },
        { status: 400 }
      );
    }

    // 2. Buat ID & Hash password dengan scrypt
    const userId = crypto.randomUUID();
    const passwordHash = hashPassword(password);

    await db.insert(profiles).values({
      id: userId,
      role: role as any,
      fullName: fullName.trim(),
      email: cleanEmail,
      passwordHash,
    });

    // 3. Inisialisasi profil peran spesifik
    if (role === "creator") {
      await db.insert(creatorProfiles).values({
        profileId: userId,
        slug: `creator-${userId.slice(0, 8)}`,
        headline: "Kreator Konten",
      }).onConflictDoNothing();

      await db.insert(creatorWallets).values({
        creatorId: userId,
        balance: 0,
        points: 0,
      }).onConflictDoNothing();
    } else if (role === "business") {
      await db.insert(businessProfiles).values({
        profileId: userId,
        companyName: fullName.trim(),
        businessCategory: "Umum",
      }).onConflictDoNothing();
    } else if (role === "school") {
      await db.insert(schoolProfiles).values({
        profileId: userId,
        schoolName: fullName.trim(),
        picName: fullName.trim(),
      }).onConflictDoNothing();

      await db.insert(creatorWallets).values({ creatorId: userId, balance: 0, points: 0 }).onConflictDoNothing();
      await db.insert(schools).values({ profileId: userId, name: fullName.trim(), slug: `school-${userId.slice(0, 8)}` }).onConflictDoNothing();
    }

    // 4. Generate local JWT token
    const token = await signJwtToken({
      id: userId,
      email: cleanEmail,
      role: role as any,
      fullName: fullName.trim(),
    });

    const response = NextResponse.json(
      {
        success: true,
        message: "Registrasi berhasil.",
        session: {
          accessToken: token,
        },
        user: {
          id: userId,
          email: cleanEmail,
          role,
          fullName: fullName.trim(),
        },
      },
      { status: 201 }
    );

    // Set HTTP-Only Cookie untuk persistensi session cross-subdomain (creatorin.my.id <-> api.creatorin.my.id)
    const isProd = process.env.NODE_ENV === "production";
    const cookieDomain = isProd ? ".creatorin.my.id" : undefined;
    response.cookies.set("creatorin_token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
