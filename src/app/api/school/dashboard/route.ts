import { NextRequest, NextResponse } from "next/server";
import { schoolService } from "@/services/schoolService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const schoolId = searchParams.get("schoolId") || undefined;
    const overview = await schoolService.getDashboardOverview(schoolId);
    return NextResponse.json(overview);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
