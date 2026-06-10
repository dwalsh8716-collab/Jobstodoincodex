import { NextResponse } from "next/server";
import {
  CMS_SESSION_COOKIE,
  cmsGateConfigured,
  createCmsSession,
  getCmsSessionMaxAge,
  getCmsUsername
} from "@/lib/cms-auth";
import { logAuditEvent } from "@/lib/operations/audit";
import { hashPrivateValue } from "@/lib/operations/database";

function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function safeRedirect(value: FormDataEntryValue | null) {
  const redirectTo = typeof value === "string" ? value : "/studio";
  return redirectTo.startsWith("/") && !redirectTo.startsWith("//") ? redirectTo : "/studio";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = safeRedirect(formData.get("redirectTo"));
  const cmsUrl = new URL("/cms", request.url);
  cmsUrl.searchParams.set("next", redirectTo);

  if (!cmsGateConfigured()) {
    await logAuditEvent(
      {
        action: "login_failed",
        entityType: "auth_session",
        entityLabel: "CMS gate",
        metadata: {
          reason: "cms_gate_missing_configuration",
          redirectTo,
        },
      },
      {
        meta: {
          ip: getClientIp(request),
          userAgent: request.headers.get("user-agent") || undefined,
        },
      },
    );
    cmsUrl.searchParams.set("setup", "missing");
    return NextResponse.redirect(cmsUrl, { status: 303 });
  }

  const validUsername = username.toLowerCase() === getCmsUsername().toLowerCase();
  const validPassword = password === process.env.CMS_GATE_PASSWORD;

  if (!validUsername || !validPassword) {
    await logAuditEvent(
      {
        action: "login_failed",
        entityType: "auth_session",
        entityLabel: "CMS gate",
        metadata: {
          reason: "invalid_credentials",
          usernameHash: hashPrivateValue(username.toLowerCase()),
          redirectTo,
        },
      },
      {
        meta: {
          ip: getClientIp(request),
          userAgent: request.headers.get("user-agent") || undefined,
        },
      },
    );
    cmsUrl.searchParams.set("error", "1");
    return NextResponse.redirect(cmsUrl, { status: 303 });
  }

  const session = await createCmsSession(username);
  await logAuditEvent(
    {
      actor: {
        email: username,
        role: "cms_admin",
      },
      action: "login_success",
      entityType: "auth_session",
      entityLabel: "CMS gate",
      metadata: { redirectTo },
    },
    {
      meta: {
        ip: getClientIp(request),
        userAgent: request.headers.get("user-agent") || undefined,
      },
    },
  );
  const response = NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
  const secureCookie = new URL(request.url).protocol === "https:";
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: session,
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    maxAge: getCmsSessionMaxAge(),
    path: "/"
  });

  return response;
}
