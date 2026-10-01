import { NextRequest, NextResponse } from 'next/server';
import { schoolService } from '@/services/schoolService';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const profile = await schoolService.getPublicSchoolProfile(slug);

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profil sekolah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    console.error('Error fetching public school profile:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil profil publik sekolah' },
      { status: 500 }
    );
  }
}
