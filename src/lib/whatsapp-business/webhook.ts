import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWhatsAppWebhookChallenge({
  mode,
  token,
  challenge,
}: {
  mode: string | null;
  token: string | null;
  challenge: string | null;
}) {
  const expectedToken = process.env.WHATSAPP_BUSINESS_VERIFY_TOKEN;
  if (!expectedToken || mode !== "subscribe" || token !== expectedToken) {
    return null;
  }

  return challenge || "";
}

export function verifyMetaSignature({
  rawBody,
  signature,
  appSecret = process.env.WHATSAPP_BUSINESS_APP_SECRET,
}: {
  rawBody: string;
  signature: string | null;
  appSecret?: string;
}) {
  if (!appSecret) return false;
  if (!signature?.startsWith("sha256=")) return false;

  const received = Buffer.from(signature.replace("sha256=", ""), "hex");
  const expected = Buffer.from(
    createHmac("sha256", appSecret).update(rawBody).digest("hex"),
    "hex",
  );

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
