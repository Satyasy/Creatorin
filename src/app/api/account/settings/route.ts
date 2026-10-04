import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";
import { getDb } from "@/lib/db";
import { profiles, userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDb();
  if (!db) return NextResponse.json({ error: "Database not connected" }, { status: 503 });
  try {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, user.id)).limit(1);
    return NextResponse.json({ settings: settings || { notifyPush: true, language: 'id' } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Gagal memuat pengaturan' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { newPassword, newEmail, location, phone, fullName, notifyPush, language } = body;

  const hasAuthUpdates = Boolean(newPassword || newEmail);
  const hasProfileUpdates = Boolean(location !== undefined || phone !== undefined || fullName !== undefined);
  const hasPrefUpdates = Boolean(notifyPush !== undefined || language !== undefined);

  if (!hasAuthUpdates && !hasProfileUpdates && !hasPrefUpdates) {
    return NextResponse.json({ error: "Tidak ada data perubahan yang dikirim." }, { status: 400 });
  }

  try {
    // 1. Handle Supabase Auth credential changes if provided
    if (hasAuthUpdates) {
      const supabase = await createClient();
      const updates: { password?: string; email?: string } = {};
      if (newPassword) updates.password = newPassword;
      if (newEmail) updates.email = newEmail;

      const { error } = await supabase.auth.updateUser(updates);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    // 2. Handle Profile details in database if provided
    const db = getDb();
    if ((hasProfileUpdates || hasPrefUpdates) && !db) {
      return NextResponse.json({ error: "Database not connected" }, { status: 503 });
    }
    if (hasProfileUpdates && db) {
        await db
          .update(profiles)
          .set({
            ...(location !== undefined && { location }),
            ...(phone !== undefined && { phone }),
            ...(fullName !== undefined && { fullName }),
            updatedAt: new Date(),
          })
          .where(eq(profiles.id, user.id));
    }
    if (hasPrefUpdates && db) {
      await db.insert(userSettings).values({
        userId: user.id,
        notifyPush: notifyPush ?? true,
        language: language || 'id',
      }).onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...(notifyPush !== undefined && { notifyPush }),
          ...(language !== undefined && { language }),
          updatedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan akun berhasil diperbarui.",
      settings: {
        location,
        phone,
        notifyPush: notifyPush ?? true,
        language: language || "id",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
