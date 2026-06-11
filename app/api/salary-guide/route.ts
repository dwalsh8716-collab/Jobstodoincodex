import { NextResponse, type NextRequest } from "next/server";
import { submitSalaryGuideLead } from "@/lib/salary-guide";
import { formDataToSalaryGuideInput } from "@/validations/salary-guide";

async function requestToObject(request: NextRequest) {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return (await request.json().catch(() => ({}))) as Record<string, unknown>;
  }

  try {
    return formDataToSalaryGuideInput(await request.formData());
  } catch {
    return {};
  }
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const result = await submitSalaryGuideLead(await requestToObject(request), {
    ip: getClientIp(request),
    userAgent: request.headers.get("user-agent") || undefined,
  });

  return NextResponse.json(
    {
      ok: result.ok,
      code: result.code,
      message: result.message,
      redirectTo: result.ok ? "/salary-guides/thanks" : undefined,
    },
    { status: result.statusCode },
  );
}
