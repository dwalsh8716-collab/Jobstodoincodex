import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const key = process.env.INDEXNOW_KEY;

  if (!key) {
    return new NextResponse("Not configured", { status: 404 });
  }

  return new NextResponse(key, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": "text/plain; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
