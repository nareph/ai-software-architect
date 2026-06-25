import { NextResponse } from "next/server";
// PATCH /api/feedback/:artifactId
export async function PATCH() {
  return NextResponse.json({ feedback: null });
}
