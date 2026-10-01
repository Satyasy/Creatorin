import { NextRequest, NextResponse } from 'next/server';
import { schoolService } from '@/services/schoolService';
import { SchoolAchievement } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const achievement = await schoolService.saveAchievement(body as Partial<SchoolAchievement>);

    return NextResponse.json({
      success: true,
      message: 'Prestasi berhasil disimpan',
      data: achievement,
    });
  } catch (error) {
    console.error('Error saving achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menyimpan prestasi sekolah' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID prestasi harus disertakan' },
        { status: 400 }
      );
    }

    const success = await schoolService.deleteAchievement(id);
    return NextResponse.json({
      success,
      message: success ? 'Prestasi berhasil dihapus' : 'Prestasi tidak ditemukan',
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    return NextResponse.json(
      { success: false, error: 'Gagal menghapus prestasi sekolah' },
      { status: 500 }
    );
  }
}
