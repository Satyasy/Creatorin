import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  const isProd = process.env.NODE_ENV === "production";
  const cookieDomain = isProd ? ".creatorin.my.id" : undefined;
  response.cookies.set("creatorin_token", "", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    domain: cookieDomain,
    maxAge: 0,
  });

  return response;
}
