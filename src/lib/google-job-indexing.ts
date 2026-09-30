import "server-only";

import { sign } from "node:crypto";
import { canonicalJobUrl } from "./job-distribution";
import type { Job } from "./types";

type ServiceAccount = { client_email: string; private_key: string };
type NotificationType = "URL_UPDATED" | "URL_DELETED";

const tokenEndpoint = "https://oauth2.googleapis.com/token";
const indexingEndpoint = "https://indexing.googleapis.com/v3/urlNotifications:publish";
const scope = "https://www.googleapis.com/auth/indexing";
const notifiedRevisions = new Map<string, string>();

export function googleIndexingConfigured() {
  return Boolean(process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON);
}

function credentials(): ServiceAccount {
  const raw = process.env.GOOGLE_INDEXING_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("Google Indexing API service account is not configured.");
  const value = JSON.parse(raw) as Partial<ServiceAccount>;
  if (!value.client_email || !value.private_key) throw new Error("Google Indexing API service account is incomplete.");
  return value as ServiceAccount;
}

async function accessToken(fetcher: typeof fetch) {
  const account = credentials();
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const claims = Buffer.from(JSON.stringify({
    iss: account.client_email,
    scope,
    aud: tokenEndpoint,
    iat: now,
    exp: now + 3600,
  })).toString("base64url");
  const unsigned = `${header}.${claims}`;
  const signature = sign("RSA-SHA256", Buffer.from(unsigned), account.private_key).toString("base64url");
  const response = await fetcher(tokenEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${unsigned}.${signature}`,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Google OAuth rejected credentials (${response.status}).`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("Google OAuth returned no access token.");
  return data.access_token;
}

export async function notifyGoogleJobUrl(job: Pick<Job, "slug">, type: NotificationType, options: {
  revision?: string;
  fetch?: typeof fetch;
} = {}) {
  const url = canonicalJobUrl(job);
  const dedupeKey = `${url}:${type}`;
  if (options.revision && notifiedRevisions.get(dedupeKey) === options.revision) {
    return { status: "already_notified" as const, url, type };
  }
  if (!googleIndexingConfigured()) return { status: "not_configured" as const, url, type };

  const fetcher = options.fetch || fetch;
  const token = await accessToken(fetcher);
  const response = await fetcher(indexingEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ url, type }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Google Indexing API rejected the job notification (${response.status}).`);
  if (options.revision) {
    if (notifiedRevisions.size >= 500) notifiedRevisions.clear();
    notifiedRevisions.set(dedupeKey, options.revision);
  }
  return { status: "notified" as const, url, type };
}
