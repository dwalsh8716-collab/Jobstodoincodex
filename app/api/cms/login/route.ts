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

function withCmsSearchParams(redirectTo: string, params?: Record<string, string>) {
  const url = new URL("/cms", "https://essentialresourcing.local");
  url.searchParams.set("next", redirectTo);

  for (const [key, value] of Object.entries(params || {})) {
    url.searchParams.set(key, value);
  }

  return `${url.pathname}${url.search}`;
}

function redirectToLocation(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: { Location: location },
  });
}

function isSecureRequest(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (forwardedProto) {
    return forwardedProto.split(",")[0]?.trim() === "https";
  }

  return new URL(request.url).protocol === "https:";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const redirectTo = safeRedirect(formData.get("redirectTo"));

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
    return redirectToLocation(
      withCmsSearchParams(redirectTo, { setup: "missing" }),
    );
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
    return redirectToLocation(withCmsSearchParams(redirectTo, { error: "1" }));
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
  const response = redirectToLocation(redirectTo);
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: session,
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    maxAge: getCmsSessionMaxAge(),
    path: "/"
  });

  return response;
}
