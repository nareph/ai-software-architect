import { NextResponse } from "next/server";
// GET /api/projects — list projects
// POST /api/projects — create project
export async function GET() {
  return NextResponse.json({ data: [] });
}
export async function POST() {
  return NextResponse.json({ project: null }, { status: 201 });
}
