import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { checkRateLimit } from "@/lib/redis";
import { verifyPassword, signJwtToken } from "@/lib/auth-local";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const { allowed, reset } = await checkRateLimit(`login:${ip}`, 15, 60);
    if (!allowed) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan login. Silakan coba beberapa saat lagi." },
        { status: 429, headers: { "Retry-After": String(reset) } }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Cari user di tabel profiles berdasarkan email
    const [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, cleanEmail))
      .limit(1);

    if (!userProfile) {
      return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
    }

    // 2. Verifikasi kata sandi
    if (!userProfile.passwordHash || !verifyPassword(password, userProfile.passwordHash)) {
      return NextResponse.json({ error: "Email atau kata sandi tidak sesuai." }, { status: 401 });
    }

    // 3. Generate token JWT lokal
    const token = await signJwtToken({
      id: userProfile.id,
      email: userProfile.email || cleanEmail,
      role: userProfile.role,
      fullName: userProfile.fullName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      session: {
        accessToken: token,
      },
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl,
        coverUrl: userProfile.coverUrl || '',
        location: userProfile.location,
        phone: userProfile.phone,
      },
    });

    // Set HTTP-Only Cookie untuk persistensi browser cross-subdomain (creatorin.my.id <-> api.creatorin.my.id)
    const host = req.headers.get("host") || "";
    const isCustomDomain = host.includes("creatorin.my.id");
    const cookieDomain = isCustomDomain ? ".creatorin.my.id" : undefined;
    const isSecure = isCustomDomain;
    response.cookies.set("creatorin_token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isCustomDomain ? "none" : "lax",
      path: "/",
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
