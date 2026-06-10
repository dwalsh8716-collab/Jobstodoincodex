import "server-only";

import { z } from "zod";
import type { ContactFormPayload } from "@/validations/contact";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";
import { templateForContactPayload } from "./templates";

const graphResponseSchema = z.object({
  messages: z.array(z.object({ id: z.string().optional() })).optional(),
});

export type WhatsAppBusinessSendResult = {
  ok: boolean;
  skipped: boolean;
  reason?: string;
  messageId?: string;
};

export function getWhatsAppBusinessStatus() {
  const enabled = process.env.WHATSAPP_BUSINESS_ENABLED === "true";
  const configured = Boolean(
    process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN,
  );

  return {
    enabled,
    configured,
    state: !enabled ? "disabled" : configured ? "ready" : "missing_config",
  } as const;
}

export function shouldSendWhatsAppBusinessMessage(payload: ContactFormPayload) {
  return Boolean(
    payload.preferredContactMethod === "whatsapp" &&
      payload.consent === "yes" &&
      normaliseWhatsAppNumber(payload.phone),
  );
}

export async function sendWhatsAppBusinessConfirmation(
  payload: ContactFormPayload,
): Promise<WhatsAppBusinessSendResult> {
  const status = getWhatsAppBusinessStatus();

  if (!status.enabled) {
    return { ok: true, skipped: true, reason: "disabled" };
  }

  if (!status.configured) {
    return { ok: false, skipped: true, reason: "missing_config" };
  }

  if (!shouldSendWhatsAppBusinessMessage(payload)) {
    return { ok: true, skipped: true, reason: "no_whatsapp_opt_in" };
  }

  const to = normaliseWhatsAppNumber(payload.phone);
  if (!to) return { ok: true, skipped: true, reason: "invalid_phone" };

  const template = templateForContactPayload(payload);
  const templateName =
    process.env.WHATSAPP_BUSINESS_DEFAULT_TEMPLATE || template.templateName;
  const languageCode =
    process.env.WHATSAPP_BUSINESS_TEMPLATE_LANGUAGE || "en_GB";
  const apiVersion = process.env.WHATSAPP_BUSINESS_API_VERSION || "v23.0";
  const phoneNumberId = process.env.WHATSAPP_BUSINESS_PHONE_NUMBER_ID;
  const token = process.env.WHATSAPP_BUSINESS_ACCESS_TOKEN;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          type: "template",
          template: {
            name: templateName,
            language: { code: languageCode },
            components: [
              {
                type: "body",
                parameters: template.parameters.map((text) => ({
                  type: "text",
                  text,
                })),
              },
            ],
          },
        }),
      },
    );

    if (!response.ok) {
      return { ok: false, skipped: false, reason: "provider_rejected" };
    }

    const parsed = graphResponseSchema.safeParse(await response.json());
    const messageId = parsed.success
      ? parsed.data.messages?.[0]?.id
      : undefined;

    return { ok: true, skipped: false, messageId };
  } catch {
    return { ok: false, skipped: false, reason: "send_failed" };
  }
}
