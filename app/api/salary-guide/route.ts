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

function getRequestAttribution(request: NextRequest) {
  const fallback = {
    sourcePage: "/salary-guides",
    utmSource: undefined,
    utmMedium: undefined,
    utmCampaign: undefined,
  };
  const referer = request.headers.get("referer");

  if (!referer) return fallback;

  try {
    const url = new URL(referer);

    return {
      sourcePage: url.pathname || fallback.sourcePage,
      utmSource: url.searchParams.get("utm_source") || undefined,
      utmMedium: url.searchParams.get("utm_medium") || undefined,
      utmCampaign: url.searchParams.get("utm_campaign") || undefined,
    };
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  const input = await requestToObject(request);
  const attribution = getRequestAttribution(request);
  const result = await submitSalaryGuideLead(
    {
      ...attribution,
      ...input,
    },
    {
      ip: getClientIp(request),
      userAgent: request.headers.get("user-agent") || undefined,
    },
  );

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
