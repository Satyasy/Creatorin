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

  const isProd = process.env.NODE_ENV === "production";
  const epochDate = new Date(0);

  // Daftar nama cookie autentikasi yang harus dibersihkan
  const tokenNames = ["creatorin_token", "creatorin_access_token", "sb-creatorin-auth-token", "auth_token"];

  // Daftar domain variasi cookie untuk memastikan penghapusan tuntas lintas browser dan subdomain
  const domainVariants = isProd
    ? [".creatorin.my.id", "creatorin.my.id", "api.creatorin.my.id", undefined]
    : [undefined];

  for (const name of tokenNames) {
    for (const domain of domainVariants) {
      response.cookies.set(name, "", {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        path: "/",
        domain,
        maxAge: 0,
        expires: epochDate,
      });
    }
  }

  return response;
}
