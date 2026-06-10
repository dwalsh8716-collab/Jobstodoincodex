import { NextResponse, type NextRequest } from "next/server";
import { submitDataSubjectRequest } from "@/actions/data-subject-request";
import { formDataToDataSubjectRequestInput } from "@/validations/data-subject-request";

async function requestToObject(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  return formDataToDataSubjectRequestInput(await request.formData());
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const result = await submitDataSubjectRequest(await requestToObject(request), {
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || undefined,
  });

  return NextResponse.json(
    {
      ok: result.ok,
      message: result.message,
    },
    { status: result.statusCode },
  );
}
