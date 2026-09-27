import { randomBytes, createHash, timingSafeEqual } from "node:crypto";

const equal = (a, b) => typeof a === "string" && timingSafeEqual(
  createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest(),
);

export function createPreviewSession(now = Date.now) {
  const token = randomBytes(32).toString("base64url");
  const session = randomBytes(32).toString("base64url");
  const issued = now();
  let used = false;
  return {
    url: `http://127.0.0.1:3027/__preview/unlock?token=${token}`,
    unlock(value) {
      if (used || now() - issued > 15 * 60_000 || !equal(value, token)) return null;
      used = true;
      return `dwr_preview=${session}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800`;
    },
    matches(cookie) {
      if (!used || now() - issued > 8 * 60 * 60_000) return false;
      return (cookie || "").split(";").some((part) => equal(part.trim(), `dwr_preview=${session}`));
    },
  };
}
