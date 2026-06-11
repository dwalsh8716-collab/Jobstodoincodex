import "server-only";

import type { ContactFormPayload } from "@/validations/contact";
import type { DataSubjectRequestPayload } from "@/validations/data-subject-request";
import { candidatePrivacyNoticeVersion } from "@/lib/candidate-trust";
import { dataSubjectRequestDueDays } from "@/lib/dsar";
import {
  retentionDatesForCategory,
  type RetentionCategory,
} from "@/lib/retention";
import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "./database";
import type { OperationsOverview, OperationWriteResult } from "./types";

type RequestMeta = {
  ip?: string;
  userAgent?: string;
};

type DataSubjectRequestStorageMeta = RequestMeta & {
  emailVerification?: {
    tokenHash: string;
    requestedAt: Date;
    expiresAt: Date;
  };
};

export type DataSubjectRequestEmailVerificationResult = {
  ok: boolean;
  reason?:
    | "backend_unavailable"
    | "token_not_found"
    | "token_expired"
    | "database_write_failed";
  request?: {
    id: string;
    requestType: DataSubjectRequestPayload["requestType"];
    requesterName: string;
    requesterEmail: string;
    requesterPhone?: string | null;
  };
};

export { getOperationsBackendStatus } from "./database";

function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function contactRetentionCategory(
  type: ContactFormPayload["type"],
): RetentionCategory {
  if (type === "client") return "client_hiring_enquiry";
  if (type === "job") return "role_application";
  return "general_candidate_enquiry";
}

function contactPreferenceRecord(payload: ContactFormPayload) {
  const hasContactConsent = payload.consent === "yes";
  const whatsappConsent = Boolean(
    payload.preferredContactMethod === "whatsapp" &&
    hasContactConsent &&
    (payload.type === "client" || payload.whatsappContactConsent === "yes"),
  );
  const phoneConsent = Boolean(
    payload.phone &&
    hasContactConsent &&
    ["phone", "no_preference"].includes(payload.preferredContactMethod),
  );
  const emailConsent = Boolean(payload.email && hasContactConsent);

  return {
    preferredContactMethod: payload.preferredContactMethod,
    whatsappConsent,
    phoneConsent,
    emailConsent,
    communicationNotes: [
      `Preferred contact method: ${payload.preferredContactMethod}.`,
      whatsappConsent
        ? "WhatsApp replies explicitly permitted for this enquiry."
        : "No WhatsApp reply consent captured.",
      "No broadcasts or marketing list consent implied.",
    ].join(" "),
  };
}

export async function saveContactEnquiryToOperations(
  payload: ContactFormPayload,
  meta: RequestMeta = {},
): Promise<OperationWriteResult> {
  const status = getOperationsBackendStatus();
  const required = status.enabled;

  if (!status.enabled) {
    return { ok: true, required: false, reason: status.state };
  }

  if (!status.configured) {
    return { ok: false, required, reason: status.state };
  }

  const retentionCategory = contactRetentionCategory(payload.type);
  const retentionDates = retentionDatesForCategory(retentionCategory);
  const contactPreferences = contactPreferenceRecord(payload);
  const record = {
    source: "website_contact_form",
    enquiryType: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    jobTitle: payload.jobTitle,
    jobSlug: payload.jobSlug,
    linkedInUrl: payload.linkedin,
    message: payload.message,
    serviceInterest: payload.briefType,
    preferredContactMethod: contactPreferences.preferredContactMethod,
    whatsappConsent: contactPreferences.whatsappConsent,
    phoneConsent: contactPreferences.phoneConsent,
    emailConsent: contactPreferences.emailConsent,
    communicationNotes: contactPreferences.communicationNotes,
    consentToContact: payload.consent === "yes",
    privacyNoticeAcknowledged: payload.privacyNoticeAcknowledgement === "yes",
    talentPoolConsent: payload.talentPoolConsent === "yes",
    marketingConsent: false,
    priority: payload.type === "client" ? "high" : "normal",
    ipHash: hashPrivateValue(meta.ip),
    userAgentHash: hashPrivateValue(meta.userAgent),
    consentSource: "website_contact_form",
    retentionCategory,
    dataRetentionUntil: dateOnly(retentionDates.retentionUntil),
    retentionReviewAt: dateOnly(retentionDates.reviewAt),
    retentionStatus: "active",
    privacyNoticeVersion:
      payload.type === "client"
        ? "operations-foundation-v1"
        : candidatePrivacyNoticeVersion,
  };

  try {
    const result = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into enquiries (
            source,
            enquiry_type,
            name,
            email,
            phone,
            company,
            job_title,
            message,
            service_interest,
            preferred_contact_method,
            whatsapp_contact_consent,
            phone_contact_consent,
            email_contact_consent,
            communication_notes,
            consent_to_contact,
            marketing_consent,
            priority,
            consent_source,
            retention_category,
            data_retention_until,
            retention_review_at,
            retention_status,
            metadata
          )
          select
            data->>'source',
            data->>'enquiryType',
            data->>'name',
            data->>'email',
            nullif(data->>'phone', ''),
            nullif(data->>'company', ''),
            nullif(data->>'jobTitle', ''),
            data->>'message',
            nullif(data->>'serviceInterest', ''),
            nullif(data->>'preferredContactMethod', ''),
            coalesce((data->>'whatsappConsent')::boolean, false),
            coalesce((data->>'phoneConsent')::boolean, false),
            coalesce((data->>'emailConsent')::boolean, false),
            nullif(data->>'communicationNotes', ''),
            coalesce((data->>'consentToContact')::boolean, false),
            coalesce((data->>'marketingConsent')::boolean, false),
            coalesce(nullif(data->>'priority', ''), 'normal'),
            data->>'consentSource',
            data->>'retentionCategory',
            (data->>'dataRetentionUntil')::date,
            (data->>'retentionReviewAt')::date,
            coalesce(nullif(data->>'retentionStatus', ''), 'active'),
            jsonb_build_object(
              'privacyNoticeVersion', data->>'privacyNoticeVersion',
              'privacyNoticeAcknowledged', coalesce((data->>'privacyNoticeAcknowledged')::boolean, false),
              'talentPoolConsent', coalesce((data->>'talentPoolConsent')::boolean, false),
              'contactPreferences', jsonb_build_object(
                'preferredContactMethod', nullif(data->>'preferredContactMethod', ''),
                'whatsappConsent', coalesce((data->>'whatsappConsent')::boolean, false),
                'phoneConsent', coalesce((data->>'phoneConsent')::boolean, false),
                'emailConsent', coalesce((data->>'emailConsent')::boolean, false)
              ),
              'linkedInUrl', nullif(data->>'linkedInUrl', ''),
              'jobSlug', nullif(data->>'jobSlug', '')
            )
          from payload
          returning id
        ),
        activity as (
          insert into activities (
            entity_type,
            entity_id,
            activity_type,
            title,
            description
          )
          select
            'enquiry',
            id,
            'enquiry_created',
            'Website enquiry received',
            'Created from the Essential Resourcing contact form.'
          from created
          returning id
        ),
        consent as (
          insert into consent_records (
            entity_type,
            entity_id,
            consent_type,
            status,
            source,
            privacy_notice_version,
            ip_hash,
            user_agent_hash
          )
          select
            'enquiry',
            created.id,
            'contact',
            'granted',
            'website_contact_form',
            payload.data->>'privacyNoticeVersion',
            nullif(payload.data->>'ipHash', ''),
            nullif(payload.data->>'userAgentHash', '')
          from created, payload
          returning id
        )
        select json_build_object('id', created.id)::text from created;
      `,
      record,
    );

    return { ok: true, required, id: result.id };
  } catch (error) {
    console.error("Operations database write failed", {
      reason: error instanceof Error ? error.message : "unknown",
      enquiryType: payload.type,
    });

    return { ok: false, required, reason: "database_write_failed" };
  }
}

export async function saveDataSubjectRequestToOperations(
  payload: DataSubjectRequestPayload,
  meta: DataSubjectRequestStorageMeta = {},
): Promise<OperationWriteResult> {
  const status = getOperationsBackendStatus();
  const required = status.enabled;

  if (!status.enabled) {
    return { ok: true, required: false, reason: status.state };
  }

  if (!status.configured) {
    return { ok: false, required, reason: status.state };
  }

  const retentionDates = retentionDatesForCategory("dsar_record");
  const record = {
    requestType: payload.requestType,
    requesterName: payload.name,
    requesterEmail: payload.email,
    requesterPhone: payload.phone,
    requesterEmailHash: hashPrivateValue(payload.email.toLowerCase()),
    message: payload.message,
    status: meta.emailVerification ? "verifying_identity" : "received",
    verificationStatus: "pending",
    source: "website_privacy_request",
    dueDays: dataSubjectRequestDueDays,
    ipHash: hashPrivateValue(meta.ip),
    userAgentHash: hashPrivateValue(meta.userAgent),
    privacyNoticeVersion: candidatePrivacyNoticeVersion,
    retentionCategory: "dsar_record",
    dataRetentionUntil: dateOnly(retentionDates.retentionUntil),
    retentionReviewAt: dateOnly(retentionDates.reviewAt),
    retentionStatus: "active",
    emailVerificationTokenHash: meta.emailVerification?.tokenHash,
    emailVerificationRequestedAt:
      meta.emailVerification?.requestedAt.toISOString(),
    emailVerificationExpiresAt: meta.emailVerification?.expiresAt.toISOString(),
  };

  try {
    const result = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into data_subject_requests (
            request_type,
            requester_name,
            requester_email,
            requester_phone,
            requester_email_hash,
            message,
            status,
            verification_status,
            source,
            due_at,
            ip_hash,
            user_agent_hash,
            retention_category,
            data_retention_until,
            retention_review_at,
            retention_status,
            email_verification_token_hash,
            email_verification_requested_at,
            email_verification_expires_at,
            metadata
          )
          select
            data->>'requestType',
            data->>'requesterName',
            data->>'requesterEmail',
            nullif(data->>'requesterPhone', ''),
            nullif(data->>'requesterEmailHash', ''),
            data->>'message',
            coalesce(nullif(data->>'status', ''), 'received'),
            coalesce(nullif(data->>'verificationStatus', ''), 'pending'),
            coalesce(nullif(data->>'source', ''), 'website_privacy_request'),
            now() + make_interval(days => coalesce((data->>'dueDays')::int, 30)),
            nullif(data->>'ipHash', ''),
            nullif(data->>'userAgentHash', ''),
            data->>'retentionCategory',
            (data->>'dataRetentionUntil')::date,
            (data->>'retentionReviewAt')::date,
            coalesce(nullif(data->>'retentionStatus', ''), 'active'),
            nullif(data->>'emailVerificationTokenHash', ''),
            nullif(data->>'emailVerificationRequestedAt', '')::timestamptz,
            nullif(data->>'emailVerificationExpiresAt', '')::timestamptz,
            jsonb_build_object(
              'privacyNoticeVersion', data->>'privacyNoticeVersion',
              'manualReviewRequired', true,
              'noPublicLookupPerformed', true,
              'emailVerification', jsonb_build_object(
                'required', nullif(data->>'emailVerificationTokenHash', '') is not null,
                'method', case
                  when nullif(data->>'emailVerificationTokenHash', '') is not null
                  then 'confirmation_link'
                  else 'manual'
                end,
                'requestedAt', nullif(data->>'emailVerificationRequestedAt', ''),
                'expiresAt', nullif(data->>'emailVerificationExpiresAt', ''),
                'confirmedAt', null,
                'tokenStored', nullif(data->>'emailVerificationTokenHash', '') is not null
              )
            )
          from payload
          returning id, request_type, status, verification_status, due_at, requester_email_hash
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
            'data_subject_request',
            id,
            'dsar_request_received',
            'Data/privacy request received',
            'Created from the public privacy request form. Identity verification is required before release, deletion or correction.',
            jsonb_build_object(
              'requestType', request_type,
              'verificationStatus', verification_status
            )
          from created
          returning id
        ),
        audit as (
          insert into audit_logs (
            action,
            entity_type,
            entity_id,
            entity_label,
            after
          )
          select
            'dsar_request_created',
            'data_subject_request',
            id,
            'Data/privacy request',
            jsonb_build_object(
              'requestType', request_type,
              'status', status,
              'verificationStatus', verification_status,
              'dueAt', due_at,
              'requesterEmailHash', requester_email_hash
            )
          from created
          returning id
        )
        select json_build_object('id', created.id)::text from created;
      `,
      record,
    );

    return { ok: true, required, id: result.id };
  } catch (error) {
    console.error("Operations data request write failed", {
      reason: error instanceof Error ? error.message : "unknown",
      requestType: payload.requestType,
    });

    return { ok: false, required, reason: "database_write_failed" };
  }
}

export async function verifyDataSubjectRequestEmailToken(
  tokenHash: string,
): Promise<DataSubjectRequestEmailVerificationResult> {
  const status = getOperationsBackendStatus();

  if (!status.enabled || !status.configured) {
    return { ok: false, reason: "backend_unavailable" };
  }

  try {
    return await runPsqlJson<DataSubjectRequestEmailVerificationResult>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        matched as (
          select
            id,
            request_type,
            requester_name,
            requester_email,
            requester_phone,
            email_verification_expires_at,
            email_verification_confirmed_at
          from data_subject_requests
          where email_verification_token_hash = (select data->>'tokenHash' from payload)
          limit 1
        ),
        updated as (
          update data_subject_requests r
          set
            status = case
              when r.status in ('received', 'verifying_identity') then 'in_review'
              else r.status
            end,
            verification_status = 'verified',
            verified_at = coalesce(r.verified_at, now()),
            email_verification_confirmed_at = now(),
            email_verification_token_hash = null,
            updated_at = now(),
            metadata = jsonb_set(
              coalesce(r.metadata, '{}'::jsonb),
              '{emailVerification}',
              coalesce(r.metadata->'emailVerification', '{}'::jsonb) ||
                jsonb_build_object(
                  'confirmedAt', now(),
                  'tokenCleared', true,
                  'manualReviewRequired', true
                ),
              true
            )
          from matched m
          where r.id = m.id
            and m.email_verification_expires_at >= now()
            and m.email_verification_confirmed_at is null
            and r.verification_status <> 'verified'
          returning
            r.id,
            r.request_type,
            r.requester_name,
            r.requester_email,
            r.requester_phone
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
            'data_subject_request',
            id,
            'dsar_email_verified',
            'Data/privacy request email verified',
            'The requester used the confirmation link. Admin review is still required before export, correction, deletion or anonymisation.',
            jsonb_build_object('requestType', request_type)
          from updated
          returning id
        ),
        audit as (
          insert into audit_logs (
            action,
            entity_type,
            entity_id,
            entity_label,
            after
          )
          select
            'dsar_email_verified',
            'data_subject_request',
            id,
            'Data/privacy request',
            jsonb_build_object(
              'requestType', request_type,
              'verificationStatus', 'verified',
              'manualReviewRequired', true
            )
          from updated
          returning id
        )
        select jsonb_build_object(
          'ok', exists(select 1 from updated),
          'reason', case
            when exists(select 1 from updated) then null
            when not exists(select 1 from matched) then 'token_not_found'
            when exists(
              select 1
              from matched
              where email_verification_expires_at < now()
                or email_verification_confirmed_at is not null
            ) then 'token_expired'
            else 'token_not_found'
          end,
          'request', (
            select jsonb_build_object(
              'id', id::text,
              'requestType', request_type,
              'requesterName', requester_name,
              'requesterEmail', requester_email,
              'requesterPhone', requester_phone
            )
            from updated
          )
        )::text;
      `,
      { tokenHash },
    );
  } catch (error) {
    console.error("Operations DSAR email verification failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return { ok: false, reason: "database_write_failed" };
  }
}

export async function getOperationsOverview(): Promise<OperationsOverview> {
  const status = getOperationsBackendStatus();

  if (!status.enabled || !status.configured) {
    return {
      status,
      enquiryCount: 0,
      newEnquiryCount: 0,
      candidateCount: 0,
      applicationCount: 0,
      openTaskCount: 0,
      dataRequestCount: 0,
      openDataRequestCount: 0,
      interimAvailableNowCount: 0,
      retentionReviewCount: 0,
      latestEnquiries: [],
      latestDataRequests: [],
      latestInterimAvailability: [],
      latestRetentionReviews: [],
    };
  }

  try {
    return await runPsqlJson<OperationsOverview>(`
      select json_build_object(
        'status', json_build_object(
          'enabled', true,
          'configured', true,
          'state', 'ready',
          'message', 'Private operations database is connected.'
        ),
        'enquiryCount', (select count(*)::int from enquiries),
        'newEnquiryCount', (select count(*)::int from enquiries where status = 'new'),
        'candidateCount', (select count(*)::int from candidates),
        'applicationCount', (select count(*)::int from applications),
        'openTaskCount', (select count(*)::int from tasks where status in ('open', 'in_progress', 'waiting')),
        'dataRequestCount', (select count(*)::int from data_subject_requests),
        'openDataRequestCount', (
          select count(*)::int
          from data_subject_requests
          where status not in ('completed', 'closed', 'rejected')
        ),
        'interimAvailableNowCount', (
          select count(*)::int
          from interim_candidate_availability
          where availability_status = 'available_now'
            and opted_out_at is null
        ),
        'retentionReviewCount', (
          select count(*)::int
          from retention_review_queue
          where recommended_action <> 'no_action'
        ),
        'latestEnquiries', coalesce((
          select json_agg(row_to_json(latest))
          from (
            select
              id::text,
              name,
              enquiry_type as "enquiryType",
              service_interest as "serviceInterest",
              status,
              priority,
              created_at as "createdAt"
            from enquiries
            order by created_at desc
            limit 8
          ) latest
        ), '[]'::json),
        'latestDataRequests', coalesce((
          select json_agg(row_to_json(latest_requests))
          from (
            select
              id::text,
              request_type as "requestType",
              requester_name as "requesterName",
              status,
              verification_status as "verificationStatus",
              due_at as "dueAt",
              created_at as "createdAt"
            from data_subject_requests
            order by created_at desc
            limit 8
          ) latest_requests
        ), '[]'::json),
        'latestInterimAvailability', coalesce((
          select json_agg(row_to_json(latest_interim))
          from (
            select
              c.id::text as "candidateId",
              c.name as "candidateName",
              a.availability_status as "availabilityStatus",
              a.available_from as "availableFrom",
              a.day_rate as "dayRate",
              a.last_updated_at as "lastUpdatedAt"
            from interim_candidate_availability a
            join candidates c on c.id = a.candidate_id
            order by a.last_updated_at desc
            limit 8
          ) latest_interim
        ), '[]'::json),
        'latestRetentionReviews', coalesce((
          select json_agg(row_to_json(latest_retention))
          from (
            select
              entity_type as "entityType",
              entity_id::text as "entityId",
              entity_label as "entityLabel",
              retention_category as "retentionCategory",
              retention_status as "retentionStatus",
              data_retention_until as "dataRetentionUntil",
              retention_review_at as "retentionReviewAt",
              recommended_action as "recommendedAction"
            from retention_review_queue
            where recommended_action <> 'no_action'
            order by
              case recommended_action
                when 'review_deletion_request' then 1
                when 'review_expired_retention' then 2
                when 'review_due' then 3
                else 4
              end,
              data_retention_until asc nulls last,
              retention_review_at asc nulls last
            limit 8
          ) latest_retention
        ), '[]'::json)
      )::text;
    `);
  } catch (error) {
    console.error("Operations database overview failed", {
      reason: error instanceof Error ? error.message : "unknown",
    });

    return {
      status: {
        ...status,
        state: "unavailable",
        message:
          "Private operations database is configured, but the app could not read it. Check Railway logs, psql and migrations.",
      },
      enquiryCount: 0,
      newEnquiryCount: 0,
      candidateCount: 0,
      applicationCount: 0,
      openTaskCount: 0,
      dataRequestCount: 0,
      openDataRequestCount: 0,
      interimAvailableNowCount: 0,
      retentionReviewCount: 0,
      latestEnquiries: [],
      latestDataRequests: [],
      latestInterimAvailability: [],
      latestRetentionReviews: [],
    };
  }
}
