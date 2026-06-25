import { NextResponse } from "next/server";
// GET /api/generate/:projectId/status
export async function GET() {
  return NextResponse.json({ job: null });
}
