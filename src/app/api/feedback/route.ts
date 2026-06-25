import { NextResponse } from "next/server";
// POST /api/feedback
export async function POST() {
  return NextResponse.json({ message: 'Feedback recorded' }, { status: 201 });
}
