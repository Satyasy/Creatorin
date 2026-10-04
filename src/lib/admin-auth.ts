import { NextRequest } from "next/server";
import { verifyJwtToken, TokenPayload } from "./auth-local";

export async function verifyAdminRequest(req: NextRequest): Promise<TokenPayload | null> {
  // 1. Cek Authorization Header (Bearer token)
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const payload = await verifyJwtToken(token);
    if (payload && (payload.role === "admin" || payload.email === "admin@creatorin.my.id")) {
      return payload;
    }
  }

  // 2. Cek Cookie creatorin_access_token
  const cookieToken = req.cookies.get("creatorin_access_token")?.value;
  if (cookieToken) {
    const payload = await verifyJwtToken(cookieToken);
    if (payload && (payload.role === "admin" || payload.email === "admin@creatorin.my.id")) {
      return payload;
    }
  }

  return null;
}
