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

function isSecureRequest(request: NextRequest) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
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

  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: "/cms" },
  });
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  return response;
}
