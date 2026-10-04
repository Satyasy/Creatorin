import { NextRequest, NextResponse } from 'next/server';
import { DEMO_USERS, DEMO_COOKIE, DEMO_DESTINATIONS, getDemoUser } from '@/lib/demo-users';

// Only available in development — returns 404 in production
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const role = req.nextUrl.searchParams.get('role') ?? 'school';
  const user = getDemoUser(role);

  if (!user) {
    const available = Object.keys(DEMO_USERS).join(', ');
    return NextResponse.json(
      { error: `Unknown demo role "${role}". Available: ${available}` },
      { status: 400 }
    );
  }

  const redirectTo = req.nextUrl.searchParams.get('redirect') ?? DEMO_DESTINATIONS[role] ?? '/';

  const response = NextResponse.redirect(new URL(redirectTo, req.url));

  // Set a short-lived demo cookie (1 hour) that AuthProvider reads
  response.cookies.set(DEMO_COOKIE, role, {
    path: '/',
    httpOnly: false,      // must be readable on the client for AuthProvider
    sameSite: 'lax',
    maxAge: 60 * 60,      // 1 hour
    secure: false,        // localhost is not HTTPS
  });

  return response;
}

/** DELETE /api/auth/demo → clear demo cookie and go home */
export async function DELETE(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/', req.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
