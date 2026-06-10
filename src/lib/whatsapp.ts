export const defaultWhatsAppNumber = "447824514296";

export const whatsAppMessages = {
  general:
    "Hi David, I've been on the Essential Resourcing website and wanted to speak to you.",
  hiring:
    "Hi David, I'm hiring and wanted to speak to you about a marketing or communications role.",
  strategicInterim:
    "Hi David, I'd like to speak to you about strategic interim support.",
  candidates:
    "Hi David, I've seen Essential Resourcing and wanted to speak to you about my next move.",
  jobs:
    "Hi David, I've seen the role on Essential Resourcing and wanted to ask about it.",
} as const;

export type WhatsAppIntent = keyof typeof whatsAppMessages;

export function normaliseWhatsAppNumber(value?: string) {
  const number = value?.replace(/[^\d]/g, "") || "";
  return number.length >= 8 && number.length <= 15 ? number : "";
}

export function buildWhatsAppUrl({
  number,
  message,
}: {
  number?: string;
  message?: string;
}) {
  const safeNumber = normaliseWhatsAppNumber(number);
  if (!safeNumber) return "";

  const params = message
    ? `?text=${encodeURIComponent(message.trim())}`
    : "";

  return `https://wa.me/${safeNumber}${params}`;
}

export function whatsAppMessageForIntent(
  intent: WhatsAppIntent = "general",
  fallback = whatsAppMessages.general,
) {
  return whatsAppMessages[intent] || fallback;
}
