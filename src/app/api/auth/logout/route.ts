import { NextResponse } from "next/server";

export async function POST() {
  return handleLogout();
}

export async function GET() {
  return handleLogout();
}

function handleLogout() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  const tokenNames = ["creatorin_token", "creatorin_access_token", "sb-creatorin-auth-token", "auth_token"];
  const expiresGmt = "Expires=Thu, 01 Jan 1970 00:00:00 GMT";

  for (const name of tokenNames) {
    // 1. Next.js native delete
    response.cookies.delete(name);

    // 2. Explicit Set-Cookie headers appended directly to avoid Map overwrite
    // Domain .creatorin.my.id (Cross-subdomain, None + Secure)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Domain=.creatorin.my.id; Max-Age=0; ${expiresGmt}; SameSite=None; Secure; HttpOnly`
    );

    // Domain creatorin.my.id (Apex domain)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Domain=creatorin.my.id; Max-Age=0; ${expiresGmt}; SameSite=None; Secure; HttpOnly`
    );

    // Domain api.creatorin.my.id (API host)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Domain=api.creatorin.my.id; Max-Age=0; ${expiresGmt}; SameSite=None; Secure; HttpOnly`
    );

    // Host-only cookie (SameSite None)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; ${expiresGmt}; SameSite=None; Secure; HttpOnly`
    );

    // Host-only cookie (SameSite Lax / standard local dev)
    response.headers.append(
      "Set-Cookie",
      `${name}=; Path=/; Max-Age=0; ${expiresGmt}; SameSite=Lax; HttpOnly`
    );
  }

  return response;
}
