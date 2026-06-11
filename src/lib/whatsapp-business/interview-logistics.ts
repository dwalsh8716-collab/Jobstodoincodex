import "server-only";

import { isRecruiterLabsFeatureEnabled } from "@/lib/recruiter-labs";
import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "@/lib/operations/database";
import { normaliseWhatsAppNumber } from "@/lib/whatsapp";
import {
  getWhatsAppBusinessStatus,
  sendWhatsAppTemplateMessage,
  type WhatsAppBusinessSendResult,
} from "./client";
import {
  isAllowedWhatsAppInterviewLogisticsTrigger,
  templateForInterviewLogistics,
  type WhatsAppInterviewLocationType,
  type WhatsAppInterviewLogisticsTrigger,
} from "./templates";

type Env = Record<string, string | undefined>;
type JsonRecord = Record<string, unknown>;

export type WhatsAppInterviewLogisticsInput = {
  trigger: WhatsAppInterviewLogisticsTrigger;
  candidateName: string;
  candidatePhone?: string | null;
  preferredContactMethod?: string | null;
  candidateWhatsAppConsent?: boolean | null;
  interviewStartAt?: Date | string | null;
  timezone?: string | null;
  roleTitle?: string | null;
  locationType?: WhatsAppInterviewLocationType | null;
  locationLabel?: string | null;
  googleMeetUrl?: string | null;
  mapUrl?: string | null;
  locationApprovedForWhatsApp?: boolean | null;
  interviewRequestId?: string | null;
};

export type WhatsAppInterviewLogisticsResult = WhatsAppBusinessSendResult & {
  code:
    | "sent"
    | "feature_disabled"
    | "blocked_trigger"
    | "interview_not_confirmed"
    | "no_whatsapp_opt_in"
    | "invalid_phone"
    | "whatsapp_disabled"
    | "missing_config"
    | "database_unavailable"
    | "request_not_found"
    | "database_write_failed"
    | "provider_rejected"
    | "send_failed";
  manualFallbackRequired: boolean;
  templateName?: string;
  id?: string;
};

type InterviewRequestRecord = {
  id: string;
  status: string;
  interviewStartAt?: string | null;
  timezone?: string | null;
  locationType?: WhatsAppInterviewLocationType | null;
  locationLabel?: string | null;
  mapUrl?: string | null;
  locationApprovedForWhatsApp?: boolean | null;
  googleMeetUrl?: string | null;
  metadata?: JsonRecord | null;
  candidate?: {
    name?: string | null;
    phone?: string | null;
  } | null;
  snapshot?: JsonRecord | null;
};

type StoredInterviewLogisticsResult = {
  whatsappMessageId?: string | null;
};

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function booleanValue(value: unknown) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function result(
  code: WhatsAppInterviewLogisticsResult["code"],
  options: Partial<WhatsAppInterviewLogisticsResult> = {},
): WhatsAppInterviewLogisticsResult {
  const hardFailure = [
    "blocked_trigger",
    "missing_config",
    "database_unavailable",
    "request_not_found",
    "database_write_failed",
    "provider_rejected",
    "send_failed",
  ].includes(code);

  return {
    ok: !hardFailure,
    skipped: code !== "sent",
    code,
    reason: code === "sent" ? undefined : code,
    manualFallbackRequired: code !== "sent",
    ...options,
  };
}

export function getWhatsAppInterviewSchedulingReadiness(
  env: Env = process.env,
) {
  const featureEnabled = isRecruiterLabsFeatureEnabled(
    "FEATURE_WHATSAPP_INTERVIEW_SCHEDULING",
    env,
  );
  const whatsappStatus = getWhatsAppBusinessStatus(env);
  const databaseStatus =
    env === process.env
      ? getOperationsBackendStatus()
      : {
          enabled: env.OPERATIONS_DB_ENABLED === "true",
          configured: Boolean(env.DATABASE_URL),
          state:
            env.OPERATIONS_DB_ENABLED !== "true"
              ? "disabled"
              : env.DATABASE_URL
                ? "ready"
                : "missing_database_url",
          message: env.DATABASE_URL
            ? "Private operations database is configured."
            : "Private operations database is not ready.",
        };

  return {
    featureEnabled,
    whatsappStatus,
    databaseStatus,
    ready:
      featureEnabled &&
      whatsappStatus.enabled &&
      whatsappStatus.configured &&
      databaseStatus.enabled &&
      databaseStatus.configured &&
      databaseStatus.state === "ready",
  };
}

export async function sendWhatsAppInterviewLogistics(
  input: WhatsAppInterviewLogisticsInput,
  env: Env = process.env,
): Promise<WhatsAppInterviewLogisticsResult> {
  if (
    !isRecruiterLabsFeatureEnabled("FEATURE_WHATSAPP_INTERVIEW_SCHEDULING", env)
  ) {
    return result("feature_disabled");
  }

  if (!isAllowedWhatsAppInterviewLogisticsTrigger(input.trigger)) {
    return result("blocked_trigger", { ok: false });
  }

  if (
    !input.interviewStartAt ||
    Number.isNaN(new Date(input.interviewStartAt).getTime())
  ) {
    return result("interview_not_confirmed");
  }

  if (
    input.preferredContactMethod !== "whatsapp" ||
    input.candidateWhatsAppConsent !== true
  ) {
    return result("no_whatsapp_opt_in");
  }

  const candidatePhone = normaliseWhatsAppNumber(input.candidatePhone || "");
  if (!candidatePhone) return result("invalid_phone");

  const whatsappStatus = getWhatsAppBusinessStatus(env);
  if (!whatsappStatus.enabled) return result("whatsapp_disabled");
  if (!whatsappStatus.configured)
    return result("missing_config", { ok: false });

  const template = templateForInterviewLogistics(
    {
      trigger: input.trigger,
      candidateName: input.candidateName,
      interviewStartAt: input.interviewStartAt,
      timezone: input.timezone,
      roleTitle: input.roleTitle,
      locationType: input.locationType,
      locationLabel: input.locationLabel,
      googleMeetUrl: input.googleMeetUrl,
      mapUrl: input.mapUrl,
      locationApprovedForWhatsApp: input.locationApprovedForWhatsApp,
    },
    env,
  );

  const sent = await sendWhatsAppTemplateMessage(
    {
      to: candidatePhone,
      trigger: template.trigger,
      templateName: template.templateName,
      parameters: template.parameters,
    },
    env,
  );

  if (!sent.ok || sent.skipped) {
    return result(
      (sent.reason as WhatsAppInterviewLogisticsResult["code"]) ||
        "send_failed",
      {
        ok: sent.ok,
        reason: sent.reason,
        messageId: sent.messageId,
        templateName: template.templateName,
      },
    );
  }

  return result("sent", {
    skipped: false,
    manualFallbackRequired: false,
    messageId: sent.messageId,
    templateName: template.templateName,
  });
}

export async function sendWhatsAppInterviewLogisticsForRequest(
  interviewRequestId: string,
  trigger: WhatsAppInterviewLogisticsTrigger = "interview_confirmation",
  env: Env = process.env,
): Promise<WhatsAppInterviewLogisticsResult> {
  if (
    !isRecruiterLabsFeatureEnabled("FEATURE_WHATSAPP_INTERVIEW_SCHEDULING", env)
  ) {
    return result("feature_disabled");
  }

  const readiness = getWhatsAppInterviewSchedulingReadiness(env);
  if (
    !readiness.databaseStatus.enabled ||
    !readiness.databaseStatus.configured
  ) {
    return result("database_unavailable", {
      ok: false,
      reason: readiness.databaseStatus.state,
    });
  }

  const record = await getInterviewRequestRecord(interviewRequestId);
  if (!record) {
    return result("request_not_found", { ok: false });
  }

  if (record.status !== "scheduled") {
    return result("interview_not_confirmed");
  }

  const metadata = isRecord(record.metadata) ? record.metadata : {};
  const snapshot = isRecord(record.snapshot) ? record.snapshot : {};
  const logisticsInput: WhatsAppInterviewLogisticsInput = {
    trigger,
    interviewRequestId,
    candidateName: record.candidate?.name || "there",
    candidatePhone: record.candidate?.phone,
    preferredContactMethod:
      stringValue(metadata.preferredContactMethod) ||
      stringValue(snapshot.preferredContactMethod),
    candidateWhatsAppConsent:
      booleanValue(metadata.candidateWhatsAppConsent) ??
      booleanValue(snapshot.candidateWhatsAppConsent),
    interviewStartAt: record.interviewStartAt,
    timezone: record.timezone,
    roleTitle:
      stringValue(metadata.roleTitle) ||
      stringValue(snapshot.roleTitle) ||
      stringValue(snapshot.headline),
    locationType: record.locationType,
    locationLabel: record.locationLabel,
    googleMeetUrl: record.googleMeetUrl,
    mapUrl: record.mapUrl,
    locationApprovedForWhatsApp: record.locationApprovedForWhatsApp,
  };

  const sendResult = await sendWhatsAppInterviewLogistics(logisticsInput, env);

  try {
    const stored = await recordInterviewLogisticsAttempt(
      interviewRequestId,
      logisticsInput,
      sendResult,
    );

    return {
      ...sendResult,
      id: stored.whatsappMessageId || undefined,
    };
  } catch {
    return result("database_write_failed", { ok: false });
  }
}

async function getInterviewRequestRecord(interviewRequestId: string) {
  return runPsqlJson<InterviewRequestRecord | null>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      )
      select coalesce((
        select json_build_object(
          'id', ir.id::text,
          'status', ir.status,
          'interviewStartAt', ir.interview_start_at,
          'timezone', ir.interview_timezone,
          'locationType', ir.interview_location_type,
          'locationLabel', ir.interview_location_label,
          'mapUrl', ir.interview_map_url,
          'locationApprovedForWhatsApp', ir.location_approved_for_whatsapp,
          'googleMeetUrl', ir.google_meet_url,
          'metadata', ir.metadata,
          'candidate', json_build_object(
            'name', c.name,
            'phone', c.phone
          ),
          'snapshot', sc.candidate_profile_snapshot
        )
        from recruiter_lab_interview_requests ir
        join recruiter_lab_shortlist_candidates sc on sc.id = ir.shortlist_candidate_id
        join candidates c on c.id = sc.candidate_id
        where ir.id = ((select data->>'interviewRequestId' from payload))::uuid
        limit 1
      ), 'null'::json)::text;
    `,
    { interviewRequestId },
  );
}

async function recordInterviewLogisticsAttempt(
  interviewRequestId: string,
  input: WhatsAppInterviewLogisticsInput,
  sendResult: WhatsAppInterviewLogisticsResult,
) {
  const recipientHash = hashPrivateValue(
    normaliseWhatsAppNumber(input.candidatePhone || ""),
  );
  const messageStatus =
    sendResult.code === "sent" ? "sent" : sendResult.ok ? "skipped" : "failed";

  return runPsqlJson<StoredInterviewLogisticsResult>(
    `
      with payload as (
        select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
      ),
      message as (
        insert into whatsapp_messages (
          direction,
          entity_type,
          entity_id,
          trigger,
          template_name,
          recipient_hash,
          provider_message_id,
          status,
          metadata
        )
        select
          'outbound',
          'recruiter_labs_interview_request',
          (data->>'interviewRequestId')::uuid,
          data->>'trigger',
          coalesce(nullif(data->>'templateName', ''), 'not_sent'),
          nullif(data->>'recipientHash', ''),
          nullif(data->>'providerMessageId', ''),
          data->>'messageStatus',
          jsonb_build_object(
            'source', 'recruiter_labs_interview_logistics',
            'templateOnly', true,
            'manualFallbackRequired', coalesce((data->>'manualFallbackRequired')::boolean, true),
            'reason', nullif(data->>'reason', ''),
            'locationType', nullif(data->>'locationType', ''),
            'googleMeetLinkIncluded', coalesce((data->>'googleMeetLinkIncluded')::boolean, false),
            'mapLinkIncluded', coalesce((data->>'mapLinkIncluded')::boolean, false),
            'rawMessageStored', false
          )
        from payload
        returning id
      ),
      request_update as (
        update recruiter_lab_interview_requests ir
        set
          whatsapp_message_id = (select id from message),
          whatsapp_logistics_status = (select data->>'logisticsStatus' from payload),
          whatsapp_logistics_last_attempt_at = now(),
          whatsapp_logistics_failure_reason = nullif((select data->>'reason' from payload), ''),
          metadata = coalesce(ir.metadata, '{}'::jsonb) ||
            jsonb_build_object(
              'whatsappLogisticsLastTrigger', (select data->>'trigger' from payload),
              'whatsappLogisticsTemplateOnly', true,
              'whatsappLogisticsManualFallbackRequired',
                coalesce(((select data->>'manualFallbackRequired' from payload))::boolean, true)
            ),
          updated_at = now()
        where ir.id = (select (data->>'interviewRequestId')::uuid from payload)
        returning ir.id
      )
      select json_build_object(
        'whatsappMessageId', (select id::text from message)
      )::text;
    `,
    {
      interviewRequestId,
      trigger: input.trigger,
      templateName: sendResult.templateName,
      recipientHash,
      providerMessageId: sendResult.messageId,
      messageStatus,
      logisticsStatus:
        sendResult.code === "sent"
          ? "sent"
          : sendResult.ok
            ? "manual_fallback"
            : "failed",
      reason: sendResult.reason,
      manualFallbackRequired: sendResult.manualFallbackRequired,
      locationType: input.locationType,
      googleMeetLinkIncluded: Boolean(
        input.locationType === "google_meet" && input.googleMeetUrl,
      ),
      mapLinkIncluded: Boolean(
        input.locationType === "physical" &&
        input.locationApprovedForWhatsApp &&
        input.mapUrl,
      ),
    },
  );
}
