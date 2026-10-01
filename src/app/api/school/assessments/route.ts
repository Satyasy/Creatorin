import { NextRequest, NextResponse } from 'next/server';
import { schoolService } from '@/services/schoolService';
import { AssessmentStatus } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || undefined;
    const year = searchParams.get('year') || undefined;
    const major = searchParams.get('major') || undefined;
    const classGrade = searchParams.get('classGrade') || undefined;
    const status = (searchParams.get('status') as AssessmentStatus | 'all') || undefined;

    const students = await schoolService.getStudentsForAssessment(undefined, {
      search,
      year,
      major,
      classGrade,
      status,
    });

    return NextResponse.json({ success: true, data: students });
  } catch (error) {
    console.error('Error fetching students for assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil daftar penilaian siswa' },
      { status: 500 }
    );
  }
}
