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
    if (devUserId === "33333333-3333-3333-3333-333333333333") {
      return {
        id: devUserId,
        email: "munir@creatorin.id",
        role: "creator",
        fullName: "Sobakhul Munir Siroj",
      };
    }
    if (devUserId === "44444444-4444-4444-4444-444444444444") {
      return {
        id: devUserId,
        email: "glowlab@creatorin.id",
        role: "business",
        fullName: "GlowLab Skincare Indonesia",
      };
    }
    if (devUserId === "11111111-1111-1111-1111-111111111111") {
      return {
        id: devUserId,
        email: "maya@creatorin.id",
        role: "creator",
        fullName: "Maya Angelina",
      };
    }
    if (devUserId === "22222222-2222-2222-2222-222222222222") {
      return {
        id: devUserId,
        email: "qaesyaar@creatorin.id",
        role: "creator",
        fullName: "Qaesyaar Aqeel",
      };
    }
    if (devUserId === "55555555-5555-5555-5555-555555555555") {
      return {
        id: devUserId,
        email: "smkmitra@creatorin.id",
        role: "school",
        fullName: "SMK Mitra Creatorin",
      };
    }

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
