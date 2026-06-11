import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { isFeatureFlagEnabled } from "@/lib/feature-flags";
import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "@/lib/operations/database";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";

export const whatsappCustomerServiceWindowHours = 24;

const knownWebhookStatuses = new Set([
  "sent",
  "delivered",
  "read",
  "failed",
  "skipped",
]);

type JsonRecord = Record<string, unknown>;

export type WhatsAppWebhookStatus =
  | "sent"
  | "delivered"
  | "read"
  | "failed"
  | "skipped";

export type WhatsAppReplyPolicy =
  | "freeform_allowed"
  | "approved_template_required";

export type ParsedWhatsAppIncomingMessage = {
  providerMessageId: string;
  fromPhoneHash?: string;
  messageType: string;
  hasText: boolean;
  receivedAt: string;
  customerServiceWindowExpiresAt: string;
  responsePolicy: WhatsAppReplyPolicy;
};

export type ParsedWhatsAppStatusUpdate = {
  providerMessageId: string;
  status: WhatsAppWebhookStatus;
  rawStatus?: string;
  statusAt?: string;
  errorCode?: string;
  errorTitle?: string;
};

export type ParsedWhatsAppWebhookPayload = {
  incomingMessages: ParsedWhatsAppIncomingMessage[];
  statuses: ParsedWhatsAppStatusUpdate[];
};

export type WhatsAppCrmSyncResult = {
  ok: boolean;
  enabled: boolean;
  attempted: boolean;
  reason?:
    | "feature_disabled"
    | "whatsapp_business_disabled"
    | "missing_app_secret"
    | "database_disabled"
    | "missing_database_url"
    | "database_unavailable"
    | "database_write_failed";
  messageCount: number;
  statusCount: number;
  storedMessageCount: number;
  updatedStatusCount: number;
  matchedCandidateCount: number;
  unmatchedMessageCount: number;
  skippedMessageCount: number;
};

type InboundStoreResult = {
  stored: boolean;
  matchedCandidateId?: string | null;
  candidateMatchCount: number;
};

type StatusStoreResult = {
  updated: boolean;
  created: boolean;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asUnixDate(value: unknown, fallback = new Date()) {
  const numeric =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return new Date(numeric * 1000);
}

function normaliseWebhookStatus(status: unknown): WhatsAppWebhookStatus {
  const rawStatus = asString(status);
  return rawStatus && knownWebhookStatuses.has(rawStatus)
    ? (rawStatus as WhatsAppWebhookStatus)
    : "skipped";
}

function getPrivacySalt() {
  return process.env.OPERATIONS_PRIVACY_SALT || process.env.CMS_GATE_SECRET;
}

export function getWhatsAppCustomerServiceWindow(
  receivedAt: Date,
  now = new Date(),
) {
  const expiresAt = new Date(
    receivedAt.getTime() + whatsappCustomerServiceWindowHours * 60 * 60 * 1000,
  );
  const canReplyWithFreeform = now.getTime() <= expiresAt.getTime();

  return {
    expiresAt,
    canReplyWithFreeform,
    responsePolicy: canReplyWithFreeform
      ? "freeform_allowed"
      : "approved_template_required",
  } as const;
}

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

export function parseWhatsAppWebhookPayload(
  payload: unknown,
  now = new Date(),
): ParsedWhatsAppWebhookPayload {
  const incomingMessages: ParsedWhatsAppIncomingMessage[] = [];
  const statuses: ParsedWhatsAppStatusUpdate[] = [];

  if (!isRecord(payload)) return { incomingMessages, statuses };

  for (const entry of asArray(payload.entry)) {
    if (!isRecord(entry)) continue;

    for (const change of asArray(entry.changes)) {
      if (!isRecord(change) || !isRecord(change.value)) continue;
      const value = change.value;

      for (const message of asArray(value.messages)) {
        if (!isRecord(message)) continue;
        const providerMessageId = asString(message.id);
        const from = normaliseWhatsAppNumber(asString(message.from));

        if (!providerMessageId || !from) continue;

        const messageType = asString(message.type) || "unknown";
        const receivedAt = asUnixDate(message.timestamp, now);
        const serviceWindow = getWhatsAppCustomerServiceWindow(receivedAt, now);
        const text = isRecord(message.text)
          ? asString(message.text.body)
          : undefined;

        incomingMessages.push({
          providerMessageId,
          fromPhoneHash: hashPrivateValue(from),
          messageType,
          hasText: Boolean(text?.trim()),
          receivedAt: receivedAt.toISOString(),
          customerServiceWindowExpiresAt: serviceWindow.expiresAt.toISOString(),
          responsePolicy: serviceWindow.responsePolicy,
        });
      }

      for (const status of asArray(value.statuses)) {
        if (!isRecord(status)) continue;
        const providerMessageId = asString(status.id);
        if (!providerMessageId) continue;

        const error = asArray(status.errors).find(isRecord);
        const rawStatus = asString(status.status);
        const statusAt = asUnixDate(status.timestamp, now);

        statuses.push({
          providerMessageId,
          status: normaliseWebhookStatus(rawStatus),
          rawStatus,
          statusAt: statusAt.toISOString(),
          errorCode:
            typeof error?.code === "number"
              ? String(error.code)
              : asString(error?.code),
          errorTitle: asString(error?.title),
        });
      }
    }
  }

  return { incomingMessages, statuses };
}

export async function processWhatsAppWebhookPayload(
  payload: unknown,
): Promise<WhatsAppCrmSyncResult> {
  return processParsedWhatsAppWebhookPayload(
    parseWhatsAppWebhookPayload(payload),
  );
}

export async function processParsedWhatsAppWebhookPayload(
  parsed: ParsedWhatsAppWebhookPayload,
): Promise<WhatsAppCrmSyncResult> {
  const base = {
    messageCount: parsed.incomingMessages.length,
    statusCount: parsed.statuses.length,
    storedMessageCount: 0,
    updatedStatusCount: 0,
    matchedCandidateCount: 0,
    unmatchedMessageCount: 0,
    skippedMessageCount: 0,
  };

  if (!isFeatureFlagEnabled("FEATURE_WHATSAPP_CRM_SYNC")) {
    return {
      ok: true,
      enabled: false,
      attempted: false,
      reason: "feature_disabled",
      ...base,
    };
  }

  if (process.env.WHATSAPP_BUSINESS_ENABLED !== "true") {
    return {
      ok: true,
      enabled: true,
      attempted: false,
      reason: "whatsapp_business_disabled",
      ...base,
    };
  }

  if (!process.env.WHATSAPP_BUSINESS_APP_SECRET) {
    return {
      ok: false,
      enabled: true,
      attempted: false,
      reason: "missing_app_secret",
      ...base,
    };
  }

  const operationsStatus = getOperationsBackendStatus();

  if (!operationsStatus.enabled) {
    return {
      ok: true,
      enabled: true,
      attempted: false,
      reason: "database_disabled",
      ...base,
    };
  }

  if (!operationsStatus.configured) {
    return {
      ok: false,
      enabled: true,
      attempted: false,
      reason: "missing_database_url",
      ...base,
    };
  }

  if (operationsStatus.state !== "ready") {
    return {
      ok: false,
      enabled: true,
      attempted: false,
      reason: "database_unavailable",
      ...base,
    };
  }

  try {
    let storedMessageCount = 0;
    let updatedStatusCount = 0;
    let matchedCandidateCount = 0;
    let unmatchedMessageCount = 0;
    let skippedMessageCount = 0;
    const privacySalt = getPrivacySalt();

    for (const status of parsed.statuses) {
      const result = await storeWhatsAppStatusUpdate(status);
      if (result.updated || result.created) updatedStatusCount += 1;
    }

    for (const message of parsed.incomingMessages) {
      if (!message.fromPhoneHash || !privacySalt) {
        skippedMessageCount += 1;
        continue;
      }

      const result = await storeIncomingWhatsAppMessage(message, privacySalt);

      if (result.stored) storedMessageCount += 1;
      if (result.matchedCandidateId) matchedCandidateCount += 1;
      if (!result.matchedCandidateId) unmatchedMessageCount += 1;
    }

    return {
      ok: true,
      enabled: true,
      attempted: true,
      messageCount: parsed.incomingMessages.length,
      statusCount: parsed.statuses.length,
      storedMessageCount,
      updatedStatusCount,
      matchedCandidateCount,
      unmatchedMessageCount,
      skippedMessageCount,
    };
  } catch (error) {
    console.error("WhatsApp CRM webhook sync failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      ok: false,
      enabled: true,
      attempted: true,
      reason: "database_write_failed",
      ...base,
    };
  }
}

async function storeIncomingWhatsAppMessage(
  message: ParsedWhatsAppIncomingMessage,
  privacySalt: string,
): Promise<InboundStoreResult> {
  return runPsqlJson<InboundStoreResult>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      candidate_matches as (
        select c.id
        from candidates c, payload
        where c.phone is not null
          and c.deleted_at is null
          and c.status <> 'deleteRequested'
          and encode(
            digest(
              (payload.data->>'privacySalt') || ':' || regexp_replace(c.phone, '[^0-9]', '', 'g'),
              'sha256'
            ),
            'hex'
          ) = payload.data->>'fromPhoneHash'
      ),
      candidate_match as (
        select
          case when count(*) = 1 then min(id)::text else null end as candidate_id,
          count(*)::int as match_count
        from candidate_matches
      ),
      created as (
        insert into whatsapp_messages (
          direction,
          entity_type,
          entity_id,
          trigger,
          template_name,
          recipient_hash,
          provider_message_id,
          status,
          matched_candidate_id,
          customer_service_window_expires_at,
          response_policy,
          metadata,
          created_at,
          updated_at
        )
        select
          'inbound',
          case when candidate_match.candidate_id is not null then 'candidate' else 'whatsapp' end,
          nullif(candidate_match.candidate_id, '')::uuid,
          'incoming_message',
          'not_applicable',
          payload.data->>'fromPhoneHash',
          payload.data->>'providerMessageId',
          'received',
          nullif(candidate_match.candidate_id, '')::uuid,
          (payload.data->>'customerServiceWindowExpiresAt')::timestamptz,
          payload.data->>'responsePolicy',
          jsonb_build_object(
            'messageType', payload.data->>'messageType',
            'hasText', coalesce((payload.data->>'hasText')::boolean, false),
            'receivedAt', payload.data->>'receivedAt',
            'customerServiceWindowHours', ${whatsappCustomerServiceWindowHours},
            'candidateMatchStatus',
              case
                when candidate_match.match_count = 1 then 'matched'
                when candidate_match.match_count > 1 then 'ambiguous'
                else 'not_matched'
              end,
            'rawMessageStored', false,
            'source', 'meta_whatsapp_business_webhook'
          ),
          (payload.data->>'receivedAt')::timestamptz,
          now()
        from payload, candidate_match
        where not exists (
          select 1
          from whatsapp_messages existing
          where existing.provider_message_id = payload.data->>'providerMessageId'
            and existing.trigger = 'incoming_message'
        )
        returning id, entity_type, entity_id, matched_candidate_id
      ),
      activity as (
        insert into activities (
          entity_type,
          entity_id,
          activity_type,
          title,
          description,
          metadata
        )
        select
          'candidate',
          matched_candidate_id,
          'whatsapp_message_received',
          'WhatsApp message received',
          'Inbound WhatsApp activity recorded from the official Business webhook. Message content is not stored.',
          jsonb_build_object(
            'whatsappMessageId', id,
            'providerMessageId', (select data->>'providerMessageId' from payload),
            'responsePolicy', (select data->>'responsePolicy' from payload)
          )
        from created
        where matched_candidate_id is not null
        returning id
      )
      select json_build_object(
        'stored', exists(select 1 from created),
        'matchedCandidateId', (select matched_candidate_id::text from created limit 1),
        'candidateMatchCount', (select match_count from candidate_match)
      )::text;
    `,
    {
      ...message,
      privacySalt,
    },
  );
}

async function storeWhatsAppStatusUpdate(
  status: ParsedWhatsAppStatusUpdate,
): Promise<StatusStoreResult> {
  return runPsqlJson<StatusStoreResult>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      updated as (
        update whatsapp_messages
        set
          status = payload.data->>'status',
          error_code = nullif(payload.data->>'errorCode', ''),
          error_summary = nullif(payload.data->>'errorTitle', ''),
          metadata = coalesce(whatsapp_messages.metadata, '{}'::jsonb) || jsonb_build_object(
            'lastWebhookStatus', payload.data->>'status',
            'lastWebhookRawStatus', nullif(payload.data->>'rawStatus', ''),
            'lastWebhookStatusAt', nullif(payload.data->>'statusAt', ''),
            'source', 'meta_whatsapp_business_webhook'
          ),
          updated_at = now()
        from payload
        where whatsapp_messages.provider_message_id = payload.data->>'providerMessageId'
        returning whatsapp_messages.id
      ),
      created as (
        insert into whatsapp_messages (
          direction,
          entity_type,
          trigger,
          template_name,
          provider_message_id,
          status,
          error_code,
          error_summary,
          metadata,
          updated_at
        )
        select
          'provider_status',
          'whatsapp',
          'status_update',
          'not_applicable',
          payload.data->>'providerMessageId',
          payload.data->>'status',
          nullif(payload.data->>'errorCode', ''),
          nullif(payload.data->>'errorTitle', ''),
          jsonb_build_object(
            'lastWebhookRawStatus', nullif(payload.data->>'rawStatus', ''),
            'lastWebhookStatusAt', nullif(payload.data->>'statusAt', ''),
            'source', 'meta_whatsapp_business_webhook'
          ),
          now()
        from payload
        where not exists (select 1 from updated)
          and not exists (
            select 1
            from whatsapp_messages existing
            where existing.provider_message_id = payload.data->>'providerMessageId'
              and existing.trigger = 'status_update'
          )
        returning id
      )
      select json_build_object(
        'updated', exists(select 1 from updated),
        'created', exists(select 1 from created)
      )::text;
    `,
    status,
  );
}
