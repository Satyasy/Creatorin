import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    const db = getDb();
    let profileData = null;
    if (db && data.user) {
      const [profile] = await db.select().from(profiles).where(eq(profiles.id, data.user.id)).limit(1);
      profileData = profile;
    }

    return NextResponse.json({
      success: true,
      message: "Login berhasil.",
      session: {
        accessToken: data.session?.access_token,
        expiresAt: data.session?.expires_at,
      },
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: profileData?.role || data.user?.user_metadata?.role || "creator",
        fullName: profileData?.fullName || data.user?.user_metadata?.full_name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
