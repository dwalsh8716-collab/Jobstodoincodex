export const CMS_SESSION_COOKIE = "essential_cms_session";

const encoder = new TextEncoder();
const sessionHours = 12;

function getSecret() {
  return process.env.CMS_GATE_SECRET || "";
}

export function cmsGateConfigured() {
  return Boolean(
    process.env.CMS_GATE_USERNAME &&
      process.env.CMS_GATE_PASSWORD &&
      process.env.CMS_GATE_SECRET,
  );
}

export function getCmsUsername() {
  return process.env.CMS_GATE_USERNAME || "";
}

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const secret = getSecret();
  if (!secret) return "";

  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign"
  ]);
  return toHex(await crypto.subtle.sign("HMAC", key, encoder.encode(value)));
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}

export async function createCmsSession(username: string) {
  const expires = Date.now() + sessionHours * 60 * 60 * 1000;
  const value = `${encodeURIComponent(username)}.${expires}`;
  const signature = await sign(value);
  return `${value}.${signature}`;
}

export async function isCmsSessionValid(cookieValue?: string) {
  if (!cmsGateConfigured() || !cookieValue) return false;

  const parts = cookieValue.split(".");
  if (parts.length !== 3) return false;

  const [username, expires, signature] = parts;
  const expiresAt = Number(expires);
  if (!username || !Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const expected = await sign(`${username}.${expires}`);
  return Boolean(expected) && timingSafeEqual(signature, expected);
}

export function getCmsSessionMaxAge() {
  return sessionHours * 60 * 60;
}
