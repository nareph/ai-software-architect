import { NextResponse } from "next/server";
// GET /api/artifacts/:id/versions
export async function GET() {
  return NextResponse.json({ versions: [] });
}
