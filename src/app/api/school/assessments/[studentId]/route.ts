import { NextRequest, NextResponse } from 'next/server';
import { schoolService } from '@/services/schoolService';
import { RubricCriterion, AssessmentStatus } from '@/types';

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    const detail = await schoolService.getStudentAssessmentDetail(studentId);

    if (!detail) {
      return NextResponse.json(
        { success: false, error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: detail });
  } catch (error) {
    console.error('Error fetching student assessment detail:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil detail penilaian siswa' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await context.params;
    const body = await request.json();
    const { rubricItems, status, notes } = body as {
      rubricItems: RubricCriterion[];
      status: AssessmentStatus;
      notes?: string;
    };

    if (!rubricItems || !Array.isArray(rubricItems)) {
      return NextResponse.json(
        { success: false, error: 'Format rubrik tidak valid' },
        { status: 400 }
      );
    }

    const result = await schoolService.saveAssessment(
      studentId,
      rubricItems,
      status || 'draft',
      notes
    );

    return NextResponse.json({
      success: true,
      message: status === 'completed' ? 'Penilaian berhasil diselesaikan' : 'Draf penilaian berhasil disimpan',
      data: result,
    });
  } catch (error) {
    console.error('Error saving student assessment:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan penilaian siswa' },
      { status: 500 }
    );
  }
}
