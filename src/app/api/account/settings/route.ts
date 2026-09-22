import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { createClient } from "@/lib/supabase/server";

export async function PUT(req: NextRequest) {
  const user = await getAuthenticatedUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { newPassword, newEmail } = body;

  try {
    const supabase = await createClient();

    const updates: { password?: string; email?: string } = {};
    if (newPassword) updates.password = newPassword;
    if (newEmail) updates.email = newEmail;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "Tidak ada data perubahan yang dikirim." }, { status: 400 });
    }

    const { data, error } = await supabase.auth.updateUser(updates);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan akun berhasil diperbarui.",
      user: data.user,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
