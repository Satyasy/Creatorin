"use server";

import { getDb } from "../db";
import { projectBriefs, briefApplications } from "../db/schema";
import { createClient } from "../supabase/server";
import { revalidatePath } from "next/cache";

export async function createProjectBrief(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Silakan masuk akun terlebih dahulu." };
  }

  const title = formData.get("title") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const budget = formData.get("budget") as string;
  const expectedOutput = formData.get("expectedOutput") as string;
  const deadline = formData.get("deadline") as string;

  if (!title || !description || !budget) {
    return { error: "Judul, deskripsi, dan budget wajib diisi." };
  }

  const db = getDb();
  if (!db) {
    return { error: "Database belum terhubung. Konfigurasi DATABASE_URL terlebih dahulu." };
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

    revalidatePath("/", "layout");
    return { success: true, brief: newBrief };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat brief";
    return { error: message };
  }
}

export async function applyToBrief(briefId: string, pitch: string, proposedPrice: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Silakan masuk akun terlebih dahulu." };
  }

  const db = getDb();
  if (!db) {
    return { error: "Database belum terhubung." };
  }

  try {
    const [application] = await db
      .insert(briefApplications)
      .values({
        briefId,
        creatorId: user.id,
        pitch,
        proposedPrice,
        status: "pending",
      })
      .returning();

    revalidatePath("/", "layout");
    return { success: true, application };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mengirim lamaran brief";
    return { error: message };
  }
}
