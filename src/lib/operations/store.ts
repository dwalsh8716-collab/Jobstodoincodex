import "server-only";

import type { ContactFormPayload } from "@/validations/contact";
import type { DataSubjectRequestPayload } from "@/validations/data-subject-request";
import { candidatePrivacyNoticeVersion } from "@/lib/candidate-trust";
import { dataSubjectRequestDueDays } from "@/lib/dsar";
import {
  getOperationsBackendStatus,
  hashPrivateValue,
  runPsqlJson,
} from "./database";
import type {
  OperationsOverview,
  OperationWriteResult,
} from "./types";

type RequestMeta = {
  ip?: string;
  userAgent?: string;
};

export { getOperationsBackendStatus } from "./database";

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

  const record = {
    source: "website_contact_form",
    enquiryType: payload.type,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    jobTitle: payload.jobTitle,
    message: payload.message,
    serviceInterest: payload.briefType,
    preferredContactMethod: payload.preferredContactMethod,
    consentToContact: payload.consent === "yes",
    marketingConsent: false,
    priority: payload.type === "client" ? "high" : "normal",
    ipHash: hashPrivateValue(meta.ip),
    userAgentHash: hashPrivateValue(meta.userAgent),
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
            consent_to_contact,
            marketing_consent,
            priority,
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
            coalesce((data->>'consentToContact')::boolean, false),
            coalesce((data->>'marketingConsent')::boolean, false),
            coalesce(nullif(data->>'priority', ''), 'normal'),
            jsonb_build_object(
              'privacyNoticeVersion', data->>'privacyNoticeVersion'
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

  const record = {
    requestType: payload.requestType,
    requesterName: payload.name,
    requesterEmail: payload.email,
    requesterPhone: payload.phone,
    requesterEmailHash: hashPrivateValue(payload.email.toLowerCase()),
    message: payload.message,
    status: "received",
    verificationStatus: "pending",
    source: "website_privacy_request",
    dueDays: dataSubjectRequestDueDays,
    ipHash: hashPrivateValue(meta.ip),
    userAgentHash: hashPrivateValue(meta.userAgent),
    privacyNoticeVersion: candidatePrivacyNoticeVersion,
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
            jsonb_build_object(
              'privacyNoticeVersion', data->>'privacyNoticeVersion',
              'manualReviewRequired', true,
              'noPublicLookupPerformed', true
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
      latestEnquiries: [],
      latestDataRequests: [],
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
      latestEnquiries: [],
      latestDataRequests: [],
    };
  }
}
