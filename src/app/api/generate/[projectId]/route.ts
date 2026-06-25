import { NextResponse } from "next/server";
// POST /api/generate/:projectId — start generation
export async function POST() {
  return NextResponse.json({ jobId: null, status: 'queued' }, { status: 202 });
}
