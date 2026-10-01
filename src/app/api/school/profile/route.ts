import { NextRequest, NextResponse } from 'next/server';
import { schoolService } from '@/services/schoolService';
import { SchoolInfo } from '@/types';

export async function GET() {
  try {
    const profile = await schoolService.getPublicSchoolProfile();
    return NextResponse.json({ success: true, data: profile.school });
  } catch (error) {
    console.error('Error fetching school profile:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data profil sekolah' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const updated = await schoolService.updateSchoolProfile('sch-kreatif-01', body as Partial<SchoolInfo>);

    return NextResponse.json({
      success: true,
      message: 'Profil sekolah berhasil diperbarui',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating school profile:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal memperbarui profil sekolah' },
      { status: 500 }
    );
  }
}
