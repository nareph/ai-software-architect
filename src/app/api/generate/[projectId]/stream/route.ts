import { NextResponse } from "next/server";
// GET /api/generate/:projectId/stream — SSE
export async function GET() {
  return new Response('data: {"event":"connected"}\n\n', {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
