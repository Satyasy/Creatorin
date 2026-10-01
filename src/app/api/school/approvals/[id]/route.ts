import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/services/schoolService";
import { SchoolStatus } from "@/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const status: SchoolStatus = body.status;

    if (!status || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const success = await schoolService.updateApprovalStatus(id, status);
    if (!success) {
      return NextResponse.json({ error: "Permintaan siswa tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ success: true, status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
