import "server-only";

import { createHash } from "node:crypto";

import { logAuditEvent } from "@/lib/operations/audit";
import {
  getOperationsBackendStatus,
  runPsqlJson,
} from "@/lib/operations/database";
import type { OperationsBackendStatus } from "@/lib/operations/types";

type CvAnonymizationEnv = Record<string, string | undefined>;

export type CvAnonymizationStatus =
  | "blocked"
  | "draft"
  | "david_review"
  | "approved"
  | "rejected"
  | "deleted";

export type CvAnonymizationDraftInput = {
  originalCvFileId: string;
  extractedText: string;
  candidateName?: string;
  employerNames?: string[];
  redactEmployerNames?: boolean;
  reviewedBy?: string;
};

export type CvAnonymizationDraft = {
  originalCvFileId: string;
  anonymizedText: string;
  anonymizationStatus: Extract<CvAnonymizationStatus, "david_review">;
  reviewedBy?: string;
  reviewedAt?: string;
  approvedForClientUse: false;
  aiGenerationEventId?: string;
  removedItems: string[];
  redactionNotes: string;
};

export type CvAnonymizationWorkerResult =
  | {
      ok: true;
      id?: string;
      draft: CvAnonymizationDraft;
      auditEventId?: string;
    }
  | {
      ok: false;
      status: Extract<CvAnonymizationStatus, "blocked">;
      reason:
        | "feature_disabled"
        | "recruiter_labs_disabled"
        | "database_unavailable"
        | "missing_cv_file_reference"
        | "missing_extracted_text"
        | "draft_write_failed";
      message: string;
    };

export const cvAnonymizationFeatureFlag = "FEATURE_CV_ANONYMIZATION";

export const cvAnonymizationRemovedItemLabels = [
  "name",
  "email",
  "phone",
  "address",
  "LinkedIn URL",
  "personal website",
  "references",
  "identifiable personal details",
  "employer names when anonymised mode is selected",
] as const;

export const cvAnonymizationBannedUses = [
  "alter experience",
  "invent skills",
  "rank candidates",
  "score suitability",
  "make decisions",
  "publish without David approval",
] as const;

export const cvAnonymizationManualBlockers = [
  "Private CV storage, malware scanning and signed access need approval before real CV ingestion.",
  "Candidate consent for client presentation and anonymised use must be approved.",
  "David review, edit, reject, delete and approval workflow must be live before client use.",
  "AI/provider terms are still blocked if any external AI provider is introduced later.",
  "This deterministic draft redactor is not a legal guarantee of full anonymisation.",
] as const;

function hashReference(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function replaceAndTrack(
  text: string,
  pattern: RegExp,
  replacement: string,
  label: string,
  removedItems: Set<string>,
) {
  if (!pattern.test(text)) return text;
  removedItems.add(label);
  return text.replace(pattern, replacement);
}

export function getCvAnonymizationGate(
  env: CvAnonymizationEnv = process.env,
  databaseStatus: OperationsBackendStatus = getOperationsBackendStatus(),
) {
  const featureFlagEnabled = env.FEATURE_CV_ANONYMIZATION === "true";
  const recruiterLabsEnabled = env.FEATURE_RECRUITER_LABS_ENABLED === "true";
  const databaseReady = databaseStatus.enabled && databaseStatus.configured;

  return {
    featureFlagEnabled,
    recruiterLabsEnabled,
    databaseReady,
    databaseState: databaseStatus.state,
    canCreateDraft: featureFlagEnabled && recruiterLabsEnabled && databaseReady,
    safeForRealCvFiles: false,
    safeForClientUse: false,
    manualBlockers: cvAnonymizationManualBlockers,
  };
}

export function createDraftAnonymizedText(
  input: Pick<
    CvAnonymizationDraftInput,
    "extractedText" | "candidateName" | "employerNames" | "redactEmployerNames"
  >,
) {
  const removedItems = new Set<string>();
  let anonymizedText = input.extractedText;

  if (input.candidateName?.trim()) {
    anonymizedText = replaceAndTrack(
      anonymizedText,
      new RegExp(`\\b${escapeRegExp(input.candidateName.trim())}\\b`, "gi"),
      "[name redacted]",
      "name",
      removedItems,
    );
  }

  anonymizedText = replaceAndTrack(
    anonymizedText,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    "[email redacted]",
    "email",
    removedItems,
  );
  anonymizedText = anonymizedText.replace(
    /(?:\+?\d[\d\s().-]{7,}\d)/g,
    (match) => {
      const digitCount = match.replace(/\D/g, "").length;
      if (digitCount < 10) return match;
      removedItems.add("phone");
      return "[phone redacted]";
    },
  );
  anonymizedText = replaceAndTrack(
    anonymizedText,
    /https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/gi,
    "[LinkedIn URL redacted]",
    "LinkedIn URL",
    removedItems,
  );
  anonymizedText = replaceAndTrack(
    anonymizedText,
    /https?:\/\/[^\s)]+/gi,
    "[website redacted]",
    "personal website",
    removedItems,
  );
  anonymizedText = replaceAndTrack(
    anonymizedText,
    /^.*\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b.*$/gim,
    "[address line redacted]",
    "address",
    removedItems,
  );
  anonymizedText = replaceAndTrack(
    anonymizedText,
    /^references?:.*$/gim,
    "[references redacted]",
    "references",
    removedItems,
  );

  if (input.redactEmployerNames) {
    for (const employerName of input.employerNames || []) {
      if (!employerName.trim()) continue;
      anonymizedText = replaceAndTrack(
        anonymizedText,
        new RegExp(`\\b${escapeRegExp(employerName.trim())}\\b`, "gi"),
        "[employer redacted]",
        "employer names",
        removedItems,
      );
    }
  }

  return {
    anonymizedText: anonymizedText.trim(),
    removedItems: [...removedItems],
    redactionNotes:
      "Draft removes obvious direct identifiers only. David must review before any client use.",
  };
}

export async function createCvAnonymizationDraft(
  input: CvAnonymizationDraftInput,
  env: CvAnonymizationEnv = process.env,
): Promise<CvAnonymizationWorkerResult> {
  const gate = getCvAnonymizationGate(env);

  if (!gate.featureFlagEnabled) {
    return {
      ok: false,
      status: "blocked",
      reason: "feature_disabled",
      message: "CV anonymization is feature-flagged off.",
    };
  }

  if (!gate.recruiterLabsEnabled) {
    return {
      ok: false,
      status: "blocked",
      reason: "recruiter_labs_disabled",
      message: "Recruiter Labs must stay enabled and private before use.",
    };
  }

  if (!gate.databaseReady) {
    return {
      ok: false,
      status: "blocked",
      reason: "database_unavailable",
      message:
        "Private operations database must be enabled before CV anonymization drafts can be stored.",
    };
  }

  if (!input.originalCvFileId.trim()) {
    return {
      ok: false,
      status: "blocked",
      reason: "missing_cv_file_reference",
      message: "A private CV file reference is required.",
    };
  }

  if (!input.extractedText.trim()) {
    return {
      ok: false,
      status: "blocked",
      reason: "missing_extracted_text",
      message: "Server-side extracted CV text is required.",
    };
  }

  const anonymized = createDraftAnonymizedText(input);
  const audit = await logAuditEvent({
    action: "recruiter_labs_cv_anonymization_draft_created",
    entityType: "recruiter_labs_cv_anonymization_draft",
    entityLabel: "CV anonymization draft",
    metadata: {
      originalCvFileIdHash: hashReference(input.originalCvFileId),
      removedItems: anonymized.removedItems,
      employerNamesRedacted: Boolean(input.redactEmployerNames),
      anonymizationStatus: "david_review",
    },
  });

  const draft: CvAnonymizationDraft = {
    originalCvFileId: input.originalCvFileId,
    anonymizedText: anonymized.anonymizedText,
    anonymizationStatus: "david_review",
    reviewedBy: input.reviewedBy,
    approvedForClientUse: false,
    aiGenerationEventId: audit.id,
    removedItems: anonymized.removedItems,
    redactionNotes: anonymized.redactionNotes,
  };

  try {
    const record = await runPsqlJson<{ id: string }>(
      `
        with payload as (
          select convert_from(decode(:'payload', 'base64'), 'utf8')::jsonb as data
        ),
        created as (
          insert into recruiter_lab_cv_anonymization_drafts (
            original_cv_file_id,
            anonymized_text,
            anonymization_status,
            reviewed_by,
            reviewed_at,
            approved_for_client_use,
            ai_generation_event_id,
            redaction_notes,
            removed_items,
            employer_names_redacted,
            metadata
          )
          select
            (data->>'originalCvFileId')::uuid,
            data->>'anonymizedText',
            data->>'anonymizationStatus',
            nullif(data->>'reviewedBy', '')::uuid,
            null::timestamptz,
            false,
            nullif(data->>'aiGenerationEventId', '')::uuid,
            data->>'redactionNotes',
            coalesce(data->'removedItems', '[]'::jsonb),
            coalesce((data->>'employerNamesRedacted')::boolean, false),
            jsonb_build_object(
              'source', 'cv_anonymization_worker',
              'rawCvStored', false,
              'clientUseBlocked', true
            )
          from payload
          returning id
        )
        select json_build_object('id', created.id)::text from created;
      `,
      {
        ...draft,
        employerNamesRedacted: Boolean(input.redactEmployerNames),
      },
    );

    return {
      ok: true,
      id: record.id,
      draft,
      auditEventId: audit.id,
    };
  } catch {
    return {
      ok: false,
      status: "blocked",
      reason: "draft_write_failed",
      message: "CV anonymization draft could not be stored.",
    };
  }
}
