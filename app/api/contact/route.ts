import { NextResponse, type NextRequest } from "next/server";
import { submitContactEnquiry } from "@/actions/contact";
import { formDataToContactInput } from "@/validations/contact";

async function requestToObject(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  return formDataToContactInput(await request.formData());
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const result = await submitContactEnquiry(await requestToObject(request), {
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
