import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { dataSubjectRequestPath } from "@/lib/dsar";
import { siteConfig } from "@/lib/site";

export const dataSubjectRequestVerificationPath = `${dataSubjectRequestPath}/confirm`;
export const defaultDataSubjectRequestVerificationTokenHours = 24;

export function getDataSubjectRequestVerificationTokenHours(
  env: Record<string, string | undefined> = process.env,
) {
  const configured = Number(env.DSAR_EMAIL_VERIFICATION_TOKEN_HOURS);

  if (!Number.isFinite(configured) || configured <= 0) {
    return defaultDataSubjectRequestVerificationTokenHours;
  }

  return Math.min(Math.floor(configured), 168);
}

export function hashDataSubjectRequestVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function createDataSubjectRequestVerificationToken() {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashDataSubjectRequestVerificationToken(token),
  };
}

export function buildDataSubjectRequestVerificationUrl(token: string) {
  const url = new URL(dataSubjectRequestVerificationPath, siteConfig.url);
  url.searchParams.set("token", token);
  return url.toString();
}
