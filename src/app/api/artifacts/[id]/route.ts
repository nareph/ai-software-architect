import { NextResponse } from "next/server";
// GET /api/artifacts/:id
export async function GET() {
  return NextResponse.json({ artifact: null });
}
