import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getDb } from '@/lib/db';
import { profiles, creatorProfiles, businessProfiles, creatorWallets } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const next = request.nextUrl.searchParams.get('next') || '/';
  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const db = getDb();
      if (!db) return NextResponse.redirect(new URL('/sign-in?error=database', request.url));
      try {
        const role = request.nextUrl.searchParams.get('role') === 'creator' ? 'creator' : 'business';
        const fullName = String(data.user.user_metadata?.full_name || data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Pengguna');
        await db.insert(profiles).values({ id: data.user.id, role, fullName, email: data.user.email || '' }).onConflictDoNothing();
        const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, data.user.id)).limit(1);
        if (profile.role === 'creator') {
          await db.insert(creatorProfiles).values({ profileId: data.user.id, slug: `creator-${data.user.id}`, headline: '' }).onConflictDoNothing();
          await db.insert(creatorWallets).values({ creatorId: data.user.id, balance: 0, points: 0 }).onConflictDoNothing();
        } else if (profile.role === 'business') {
          await db.insert(businessProfiles).values({ profileId: data.user.id, companyName: fullName, businessCategory: '' }).onConflictDoNothing();
          await db.insert(creatorWallets).values({ creatorId: data.user.id, balance: 0, points: 0 }).onConflictDoNothing();
        }
        return NextResponse.redirect(new URL(next.startsWith('/') && !next.startsWith('//') ? next : '/', request.url));
      } catch {
        return NextResponse.redirect(new URL('/sign-in?error=database', request.url));
      }
    }
  }
  return NextResponse.redirect(new URL('/sign-in?error=oauth', request.url));
}
