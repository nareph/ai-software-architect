import { NextResponse } from "next/server";
// GET /api/projects/:id
// DELETE /api/projects/:id
export async function GET() {
  return NextResponse.json({ project: null });
}
export async function DELETE() {
  return NextResponse.json({ message: 'Archived' });
}
