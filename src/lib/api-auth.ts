import { NextRequest } from "next/server";
import { createClient } from "./supabase/server";
import { getDb } from "./db";
import { profiles } from "./db/schema";
import { eq } from "drizzle-orm";

export type AuthUser = {
  id: string;
  email: string;
  role: "creator" | "business" | "school";
  fullName: string;
};

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthUser | null> {
  // 1. Check for testing/development override header
  const devUserId = req.headers.get("x-user-id");
  if (devUserId) {
    const db = getDb();
    if (db) {
      try {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, devUserId)).limit(1);
        if (profile) {
          return {
            id: profile.id,
            email: `${profile.fullName.toLowerCase().replace(/\s+/g, "")}@creatorin.id`,
            role: profile.role,
            fullName: profile.fullName,
          };
        }
      } catch (err) {
        console.warn("Dev user lookup failed:", err);
      }
    }
  }

  // 2. Check standard Supabase session
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    const db = getDb();
    let userRole: "creator" | "business" | "school" = (user.user_metadata?.role as any) || "creator";
    let fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";

    if (db) {
      try {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
        if (profile) {
          userRole = profile.role;
          fullName = profile.fullName;
        }
      } catch (err) {
        console.warn("Profile fetch fallback:", err);
      }
    }

    return {
      id: user.id,
      email: user.email || "",
      role: userRole,
      fullName: fullName,
    };
  } catch (err) {
    console.warn("Auth check error:", err);
    return null;
  }
}
