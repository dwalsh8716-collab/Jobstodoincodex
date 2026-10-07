import "server-only";
import { createHash } from "node:crypto";
import { essentialEmailHeaderHtml } from "./branded-email";
import { salaryGuideEmailSchema } from "@/validations/salary-guide-email";
import {
  publicSalaryGuideTitle,
  publicSalaryGuideUrl,
} from "./salary-guide-product";
import { siteConfig } from "./site";

// Same single-instance rate-limiting pattern as existing forms, with independent
// IP/recipient limits, a global cap, expiry cleanup and no plaintext addresses.
const attempts = new Map<string, { count: number; expires: number }>();
function reserve(key: string, limit: number, windowMs: number, now: number) {
  for (const [entry, value] of attempts)
    if (value.expires <= now) attempts.delete(entry);
  const current = attempts.get(key);
  if (current && current.count >= limit) return false;
  if (!current && attempts.size >= 10_000) return false;
  attempts.set(key, {
    count: (current?.count || 0) + 1,
    expires: current?.expires || now + windowMs,
  });
  return true;
}

export function guideEmailContent(name: string) {
  const firstName = name.trim().split(/\s+/)[0];
  const safeFirstName = firstName.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
  return {
    subject: `Your ${publicSalaryGuideTitle}`,
    text: [
      `Hi ${firstName},`,
      "",
      "As promised, here's the guide:",
      "",
      publicSalaryGuideTitle,
      `View the Salary Guide: ${publicSalaryGuideUrl}`,
      "",
      "It's the live version, so if I update any of the numbers or add anything later, you'll always be looking at the latest one.",
      "",
      "And if you're actually hiring and want me to sense-check a salary against the real brief, just give me a shout.",
      "",
      "If it stacks up, I'll tell you. If it doesn't, I'll tell you that too.",
      "",
      "Cheers,",
      "David",
      "Essential Resourcing",
      "",
      "You asked us to email you this guide. This hasn't subscribed you to marketing emails.",
      `${siteConfig.url}/privacy-policy`,
    ].join("\n"),
    html: `<!doctype html>
<html lang="en"><body style="margin:0;padding:24px;background:#ffffff;color:#171717;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.55">
<div style="max-width:560px;margin:0 auto">
  ${essentialEmailHeaderHtml()}
  <p>Hi ${safeFirstName},</p>
  <p>As promised, here's the guide:</p>
  <p><strong>${publicSalaryGuideTitle}</strong><br><a href="${publicSalaryGuideUrl}" style="color:#131313;text-decoration:underline">View the Salary Guide</a></p>
  <p>It's the live version, so if I update any of the numbers or add anything later, you'll always be looking at the latest one.</p>
  <p>And if you're actually hiring and want me to sense-check a salary against the real brief, just give me a shout.</p>
  <p>If it stacks up, I'll tell you. If it doesn't, I'll tell you that too.</p>
  <p>Cheers,<br>David<br>Essential Resourcing</p>
  <p style="border-top:1px solid #dedede;padding-top:18px;margin-top:28px;color:#666;font-size:13px">You asked us to email you this guide. This hasn't subscribed you to marketing emails.<br><a href="${siteConfig.url}/privacy-policy" style="color:#444">Privacy Policy</a></p>
</div></body></html>`,
  };
}

export async function sendGuideEmail(
  input: unknown,
  ip: string,
  now = Date.now(),
) {
  const parsed = salaryGuideEmailSchema.safeParse(input);
  if (!parsed.success) return { status: 400, ok: false };
  const { name, email, startedAt, requestId } = parsed.data;
  if (now - startedAt < 1500 || startedAt > now || now - startedAt > 86_400_000)
    return { status: 400, ok: false };
  const digest = (value: string) =>
    createHash("sha256").update(value).digest("hex");
  if (
    !reserve(`ip:${digest(ip)}`, 5, 600_000, now) ||
    !reserve(`recipient:${digest(email.toLowerCase())}`, 2, 600_000, now) ||
    !reserve("global", 100, 3_600_000, now)
  )
    return { status: 429, ok: false };
  const key = process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM_EMAIL;
  if (!key || !from) return { status: 503, ok: false };
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `salary-guide-${digest(`${email.toLowerCase()}:${requestId}`)}`,
      },
      body: JSON.stringify({
        from: `David Walsh at Essential Resourcing <${from}>`,
        to: email,
        reply_to: siteConfig.email,
        ...guideEmailContent(name),
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) throw new Error("Delivery unavailable");
    const result = (await response.json()) as { id?: string };
    if (!result.id) throw new Error("Delivery not acknowledged");
    return { status: 200, ok: true };
  } catch {
    // No provider response, submitted data, address or request body in logs.
    console.error("Salary guide email delivery unavailable");
    return { status: 502, ok: false };
  }
}
