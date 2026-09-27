import { createHash, timingSafeEqual } from "node:crypto";
import { readdirSync } from "node:fs";

export const previewHeaders = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
};

export function assertLocalPreview(env = process.env, files = readdirSync(".")) {
  if (env.RAILWAY_ENVIRONMENT_ID || env.RAILWAY_PROJECT_ID) {
    throw new Error("This phase-one preview cannot run on Railway. Hosting requires a separate staging review.");
  }
  const envFiles = files.filter((name) => /^\.env($|\.)/.test(name) && name !== ".env.example");
  if (envFiles.length) throw new Error("Remove environment files from the preview workspace; production credentials must never be copied here.");
  const forbidden = Object.keys(env).filter((key) => env[key] && (
    /^(DATABASE_URL|RESEND_|CONTACT_(TO|FROM)_EMAIL|CMS_GATE_|SANITY_|NEXT_PUBLIC_SANITY_|SENTRY_|NEXT_PUBLIC_SENTRY_|INDEXNOW_|GOOGLE_SITE_VERIFICATION|CANDIDATE_CV_|DAVIDS_AUDIO_NOTE_STORAGE_|LOXO_|WHATSAPP_BUSINESS_(ACCESS_TOKEN|APP_SECRET|VERIFY_TOKEN|PHONE_NUMBER_ID)|NEXT_PUBLIC_(GA_ID|GTM_ID|LINKEDIN_PARTNER_ID|META_PIXEL_ID|CLARITY_ID|HOTJAR_ID|BOOKING_URL|GOOGLE_BOOKING_URL)|CRON_SECRET)/.test(key) ||
    (/^(FEATURE_|OPERATIONS_DB_ENABLED|RETENTION_ENGINE_ENABLED|WHATSAPP_BUSINESS_ENABLED)/.test(key) && env[key] === "true")
  ));
  if (forbidden.length) throw new Error(`Live configuration is not allowed in this preview: ${forbidden.join(", ")}`);
  if (env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_SITE_URL !== "http://127.0.0.1:3027") {
    throw new Error("Preview site URL must be the local preview address.");
  }
}

export function authorisationMatches(header, username, password) {
  if (!username || !password || typeof header !== "string") return false;
  const expected = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const hash = (value) => createHash("sha256").update(value).digest();
  return timingSafeEqual(hash(header), hash(expected));
}

export function previewDecision({ method, url, host, authorization }, credentials) {
  if (!/^(127\.0\.0\.1|localhost)(:3027)?$/.test(host || "")) return { status: 403, body: "Local preview only." };
  if (!authorisationMatches(authorization, credentials.username, credentials.password)) {
    return { status: 401, body: "Private David Walsh Recruitment preview.", authenticate: true };
  }
  if (!["GET", "HEAD"].includes(method)) return { status: 405, body: "Submissions and live actions are disabled in this preview." };
  let pathname;
  try { pathname = decodeURIComponent(new URL(url, "http://127.0.0.1:3027").pathname).replace(/\\/g, "/"); }
  catch { return { status: 400, body: "Invalid request." }; }
  if (/^\/(api|studio|cms|admin|labs|recruiter-labs|candidate|client)(\/|$)/i.test(pathname) || pathname === "/candidate-privacy/request/confirm") {
    return { status: 403, body: "Private tools and integrations are isolated pending the next review phase." };
  }
  if (pathname === "/robots.txt") return { status: 200, body: "User-agent: *\nDisallow: /\n" };
  if (/^\/(sitemap\.xml|rss\.xml|llms(-full)?\.txt|indexnow-key\.txt)$/.test(pathname)) {
    return { status: 404, body: "Discovery feeds are disabled in this private preview." };
  }
  return null;
}
