import { NextResponse, type NextRequest } from "next/server";
import { confirmDataSubjectRequestEmail } from "@/actions/data-subject-request";

async function requestToObject(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  try {
    return Object.fromEntries((await request.formData()).entries());
  } catch {
    return {};
  }
}

export async function POST(request: NextRequest) {
  const body = await requestToObject(request);
  const result = await confirmDataSubjectRequestEmail(body.token);

  return NextResponse.json(
    {
      ok: result.ok,
      message: result.message,
    },
    { status: result.statusCode },
  );
}
