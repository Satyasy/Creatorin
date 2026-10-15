import { NextRequest } from "next/server";
import { getDb } from "./db";
import { profiles } from "./db/schema";
import { eq } from "drizzle-orm";
import { verifyJwtToken } from "./auth-local";

export type AuthUser = {
  id: string;
  email: string;
  role: "admin" | "creator" | "business" | "school";
  fullName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  location?: string | null;
  phone?: string | null;
};

export async function getAuthenticatedUser(req: NextRequest): Promise<AuthUser | null> {
  // 1. Check for testing/development override header
  const devUserId = req.headers.get("x-user-id");
  if (process.env.NODE_ENV === "test" && devUserId) {
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
    const db = getDb();
    if (db) {
      try {
        const [profile] = await db.select().from(profiles).where(eq(profiles.id, devUserId)).limit(1);
        if (profile) {
          return {
            id: profile.id,
            email: profile.email || `${profile.fullName.toLowerCase().replace(/\s+/g, "")}@creatorin.id`,
            role: profile.role,
            fullName: profile.fullName,
            avatarUrl: profile.avatarUrl,
            coverUrl: profile.coverUrl,
            location: profile.location,
            phone: profile.phone,
          };
        }
      } catch (err) {
        console.warn("Dev user lookup failed:", err);
      }
    }
  }

  // 2. Check local JWT token from cookie or Authorization header
  let token: string | undefined = req.cookies.get("creatorin_token")?.value;

  if (!token) {
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }

  if (token) {
    const decoded = await verifyJwtToken(token);
    if (decoded && decoded.id) {
      const db = getDb();
      if (db) {
        try {
          const [profile] = await db.select().from(profiles).where(eq(profiles.id, decoded.id)).limit(1);
          if (profile) {
            return {
              id: profile.id,
              email: profile.email || decoded.email,
              role: profile.role,
              fullName: profile.fullName,
              avatarUrl: profile.avatarUrl,
              coverUrl: profile.coverUrl,
              location: profile.location,
              phone: profile.phone,
            };
          }
        } catch (err) {
          console.warn("Profile fetch error:", err);
        }
      }

      // Return decoded info if DB query failed
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        fullName: decoded.fullName,
      };
    }
  }

  return null;
}
