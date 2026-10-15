import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { profiles, creatorWallets, creatorProfiles, businessProfiles, schoolProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { signJwtToken } from '@/lib/auth-local';
import { DEMO_USERS, DEMO_COOKIE, DEMO_DESTINATIONS, getDemoUser } from '@/lib/demo-users';

const DEMO_PERSONAS: Record<string, { email: string; role: 'creator' | 'business' | 'school'; fullName: string }> = {
  creator: {
    email: 'creator@creatorin.my.id',
    role: 'creator',
    fullName: 'Creator Pro CreatorIn',
  },
  business: {
    email: 'umkm@creatorin.my.id',
    role: 'business',
    fullName: 'Kopi Lereng Nusantara',
  },
  umkm: {
    email: 'umkm@creatorin.my.id',
    role: 'business',
    fullName: 'Kopi Lereng Nusantara',
  },
  school: {
    email: 'school@creatorin.my.id',
    role: 'school',
    fullName: 'SMK Negeri 1 Surabaya',
  },
};

/**
 * POST /api/auth/demo
 * Authenticates as an authentic seeded demo user and issues a genuine JWT session.
 * Eliminates client-side password exposure while honoring full DB persistence and JWT verification.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const roleKey = (body.role || '').toLowerCase();
    const persona = DEMO_PERSONAS[roleKey];

    if (!persona) {
      return NextResponse.json(
        {
          error: `Peran demo "${body.role}" tidak valid. Pilihan yang tersedia: creator, business (umkm), school.`,
        },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json({ error: 'Database tidak terhubung' }, { status: 503 });
    }

    // 1. Cari user profil di database
    let [userProfile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.email, persona.email))
      .limit(1);

    // 2. Jika user demo belum ada di DB, buatkan secara otomatis
    if (!userProfile) {
      const generatedId = crypto.randomUUID();
      const [newProfile] = await db
        .insert(profiles)
        .values({
          id: generatedId,
          email: persona.email,
          fullName: persona.fullName,
          role: persona.role,
          avatarUrl:
            persona.role === 'creator'
              ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'
              : persona.role === 'business'
              ? 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=300&auto=format&fit=crop&q=80'
              : 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=300&auto=format&fit=crop&q=80',
          location: persona.role === 'creator' ? 'Jakarta Selatan' : 'Surabaya, Jawa Timur',
        })
        .returning();

      userProfile = newProfile;

      // Inisialisasi dompet jika belum ada
      await db
        .insert(creatorWallets)
        .values({
          creatorId: userProfile.id,
          balance: 5000,
          points: 100,
        })
        .onConflictDoNothing();

      // Buat profile spesifik berdasarkan role
      if (persona.role === 'creator') {
        await db
          .insert(creatorProfiles)
          .values({
            profileId: userProfile.id,
            slug: 'creator-pro',
            headline: 'Lead Motion Designer & Creative Director',
            bio: 'Spesialis video komersial, motion branding, dan identitas visual konversi tinggi untuk brand modern.',
            careerScore: 98,
            rating: '4.9',
            startingPrice: 'Rp 500.000',
            skills: ['Motion Graphic', 'Video TikTok', 'Reels Instagram', 'Branding'],
            isPro: true,
          })
          .onConflictDoNothing();
      } else if (persona.role === 'business') {
        await db
          .insert(businessProfiles)
          .values({
            profileId: userProfile.id,
            companyName: 'Kopi Lereng Nusantara UMKM',
            businessCategory: 'Food & Beverage',
            description: 'Produsen biji kopi specialty lereng pegunungan Jawa Timur.',
            website: 'https://kopilereng.id',
          })
          .onConflictDoNothing();
      } else if (persona.role === 'school') {
        await db
          .insert(schoolProfiles)
          .values({
            profileId: userProfile.id,
            schoolName: 'SMK Negeri 1 Surabaya',
            picName: 'Dra. Endang Wahyuni, M.Pd.',
            picContact: '081234567890',
            isVerified: true,
          })
          .onConflictDoNothing();
      }
    }

    // 3. Terbitkan JWT resmi
    const token = await signJwtToken({
      id: userProfile.id,
      email: userProfile.email || persona.email,
      role: userProfile.role,
      fullName: userProfile.fullName,
    });

    const response = NextResponse.json({
      success: true,
      message: `Login demo sebagai ${persona.fullName} berhasil.`,
      session: {
        accessToken: token,
      },
      user: {
        id: userProfile.id,
        email: userProfile.email,
        role: userProfile.role,
        fullName: userProfile.fullName,
        avatarUrl: userProfile.avatarUrl,
        location: userProfile.location,
        phone: userProfile.phone,
      },
    });

    // 4. Set Cookie creatorin_token
    const host = req.headers.get('host') || '';
    const isCustomDomain = host.includes('creatorin.my.id');
    const cookieDomain = isCustomDomain ? '.creatorin.my.id' : undefined;
    const isSecure = isCustomDomain;
    response.cookies.set('creatorin_token', token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: isCustomDomain ? 'none' : 'lax',
      path: '/',
      domain: cookieDomain,
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error('[Demo Auth Error]', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}

/** GET /api/auth/demo — Backwards compatibility redirect */
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

  response.cookies.set(DEMO_COOKIE, role, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60,
    secure: false,
  });

  return response;
}

/** DELETE /api/auth/demo → clear demo cookie and go home */
export async function DELETE(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/', req.url));
  response.cookies.delete(DEMO_COOKIE);
  return response;
}
