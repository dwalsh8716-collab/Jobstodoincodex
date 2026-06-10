import { NextResponse, type NextRequest } from "next/server";
import {
  CMS_SESSION_COOKIE,
  getCmsSessionUsername,
} from "@/lib/cms-auth";
import { logAuditEvent } from "@/lib/operations/audit";

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: NextRequest) {
  const username = await getCmsSessionUsername(
    request.cookies.get(CMS_SESSION_COOKIE)?.value,
  );

  await logAuditEvent(
    {
      actor: username
        ? {
            email: username,
            role: "cms_admin",
          }
        : undefined,
      action: "logout",
      entityType: "auth_session",
      entityLabel: "CMS gate",
    },
    {
      meta: {
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
      },
    },
  );

  const response = NextResponse.redirect(new URL("/cms", request.url), { status: 303 });
  const secureCookie = new URL(request.url).protocol === "https:";
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  return response;
}
