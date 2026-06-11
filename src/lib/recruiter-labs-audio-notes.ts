import "server-only";

import { z } from "zod";
import { getOperationsBackendStatus } from "./operations/database";
import type { OperationsBackendStatus } from "./operations/types";
import {
  isRecruiterLabsClientPortalFeatureEnabled,
  isRecruiterLabsFeatureEnabled,
} from "./recruiter-labs";

type RecruiterLabsAudioEnv = Record<string, string | undefined>;

export const davidsAudioNotesFeatureFlag = "FEATURE_DAVIDS_AUDIO_NOTES" as const;

export const davidsAudioNotesStorageEnvVars = [
  "DAVIDS_AUDIO_NOTE_STORAGE_PROVIDER",
  "DAVIDS_AUDIO_NOTE_STORAGE_BUCKET",
  "DAVIDS_AUDIO_NOTE_STORAGE_SIGNING_SECRET",
] as const;

export const davidsAudioNoteLimits = {
  minimumDurationSeconds: 1,
  targetMinimumDurationSeconds: 30,
  maximumDurationSeconds: 60,
  maximumFileSizeBytes: 15 * 1024 * 1024,
} as const;

export const davidsAudioNoteAllowedMimeTypes = [
  "audio/mpeg",
  "audio/mp4",
  "audio/webm",
  "audio/wav",
  "audio/x-m4a",
] as const;

export const davidsAudioNotesManualBlockers = [
  "Choose and configure private object storage for audio files.",
  "Add an authenticated admin recording or upload surface.",
  "Add compression/transcoding before any client playback.",
  "Add signed playback URLs or authenticated streaming.",
  "Log every playback request in Postgres.",
  "Confirm retention, deletion and DSAR handling for audio notes.",
  "Get client portal and candidate privacy wording reviewed before launch.",
] as const;

export const davidsAudioNoteApprovalStatuses = [
  "draft",
  "david_review",
  "approved",
  "revoked",
] as const;

export const davidsAudioNoteTranscriptStatuses = [
  "not_provided",
  "draft",
  "approved",
] as const;

export const davidsAudioNoteCompressionStatuses = [
  "pending",
  "compressed",
  "failed",
  "manual_review",
] as const;

export const davidsAudioNoteMetadataSchema = z.object({
  shortlistCandidateId: z.string().uuid(),
  sourceFileId: z.string().uuid(),
  compressedFileId: z.string().uuid().optional(),
  title: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((value) => value || "David's take"),
  durationSeconds: z
    .number()
    .int()
    .min(davidsAudioNoteLimits.minimumDurationSeconds)
    .max(davidsAudioNoteLimits.maximumDurationSeconds),
  transcript: z
    .string()
    .trim()
    .max(5000)
    .optional()
    .transform((value) => (value ? value : undefined)),
  transcriptStatus: z
    .enum(davidsAudioNoteTranscriptStatuses)
    .default("not_provided"),
  compressionStatus: z
    .enum(davidsAudioNoteCompressionStatuses)
    .default("pending"),
  approvalStatus: z.enum(davidsAudioNoteApprovalStatuses).default("draft"),
});

export const davidsAudioNotePlaybackRequestSchema = z.object({
  token: z.string().trim().regex(/^[A-Za-z0-9_-]{32,256}$/),
  audioNoteId: z.string().uuid(),
});

export type DavidsAudioNoteMetadataInput = z.infer<
  typeof davidsAudioNoteMetadataSchema
>;

export type DavidsAudioNotesStatus = {
  featureFlag: typeof davidsAudioNotesFeatureFlag;
  featureFlagEnabled: boolean;
  portalEnabled: boolean;
  databaseStatus: OperationsBackendStatus;
  privateStorageConfigured: boolean;
  storageAdapterImplemented: boolean;
  adminUploadImplemented: boolean;
  compressionImplemented: boolean;
  signedPlaybackImplemented: boolean;
  canAcceptAdminAudio: boolean;
  canStreamClientAudio: boolean;
  status: "staged";
  message: string;
};

export function parseDavidsAudioNoteMetadata(input: unknown) {
  return davidsAudioNoteMetadataSchema.safeParse(input);
}

export function parseDavidsAudioNotePlaybackRequest(input: unknown) {
  return davidsAudioNotePlaybackRequestSchema.safeParse(input);
}

export function getDavidsAudioNotesStatus(
  env: RecruiterLabsAudioEnv = process.env,
): DavidsAudioNotesStatus {
  const featureFlagEnabled = isRecruiterLabsFeatureEnabled(
    davidsAudioNotesFeatureFlag,
    env,
  );
  const portalEnabled = isRecruiterLabsClientPortalFeatureEnabled(env);
  const databaseStatus: OperationsBackendStatus =
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
  const privateStorageConfigured = davidsAudioNotesStorageEnvVars.every((key) =>
    Boolean(env[key]),
  );

  return {
    featureFlag: davidsAudioNotesFeatureFlag,
    featureFlagEnabled,
    portalEnabled,
    databaseStatus,
    privateStorageConfigured,
    storageAdapterImplemented: false,
    adminUploadImplemented: false,
    compressionImplemented: false,
    signedPlaybackImplemented: false,
    canAcceptAdminAudio: false,
    canStreamClientAudio: false,
    status: "staged",
    message:
      "David's audio notes are staged but disabled until private storage, admin upload, compression, signed playback, retention and legal/privacy review are approved.",
  };
}
