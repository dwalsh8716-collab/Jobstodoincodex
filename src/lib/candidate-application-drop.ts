import "server-only";

import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createHash, randomUUID } from "node:crypto";
import { essentialEmailHtml, essentialEmailSender } from "./branded-email";
import { isCandidateTransparencyFeatureEnabled } from "./candidate-transparency";
import {
  candidateConfirmationSubject,
  candidateNextSteps,
  candidatePrivacyPath,
  candidatePrivacyNoticeVersion,
  candidateRetentionStatement,
} from "./candidate-trust";
import { dataSubjectRequestPath } from "./dsar";
import { siteConfig } from "./site";
import { scanCvBuffer, type CvMalwareScanResult } from "./cv-malware-scan";
import {
  candidateApplicationDropSchema,
  maxCvFileBytes,
  type CandidateApplicationDropPayload,
  type CvFileMeta,
} from "@/validations/candidate-application-drop";

type CandidateApplicationDropEnv = Record<string, string | undefined>;
type RequestMeta = {
  ip?: string;
  userAgent?: string;
  now?: number;
};

export const candidateApplicationDropFeatureFlag =
  "FEATURE_CANDIDATE_APPLICATION_DROP" as const;

export const candidateApplicationDropStorageEnvVars = [
  "CANDIDATE_CV_STORAGE_PROVIDER",
  "CANDIDATE_CV_STORAGE_BUCKET",
  "CANDIDATE_CV_STORAGE_ENDPOINT",
  "CANDIDATE_CV_STORAGE_ACCESS_KEY_ID",
  "CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY",
] as const;

export const candidateApplicationDropManualBlockers = [
  "Choose and configure private object storage.",
  "Keep CV files out of Sanity, GitHub and the public folder.",
  "Add signed admin-only access for private downloads.",
  "Add virus scanning or a documented manual review process.",
  "Confirm retention, deletion and DSAR handling for CV files.",
  "Get legal/privacy wording reviewed before accepting uploads.",
] as const;

export type CandidateApplicationDropStatus = ReturnType<
  typeof getCandidateApplicationDropStatus
>;

export type CandidateApplicationDropResult = {
  ok: boolean;
  statusCode: number;
  message: string;
  status?: CandidateApplicationDropStatus["status"];
  reference?: string;
};

type StoredCvFile = CvFileMeta & {
  storageProvider?: string;
  storageBucket?: string;
  storageKey?: string;
  sha256: string;
  malwareScan: CvMalwareScanResult;
};

const allowedUploadExtensions = [".pdf", ".doc", ".docx"] as const;
const rateLimitWindowMs = 10 * 60 * 1000;
const rateLimitMax = 3;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function emailConfig(env: CandidateApplicationDropEnv = process.env) {
  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL || "david@essentialresourcing.co.uk";
  const from = env.CONTACT_FROM_EMAIL || "website@essentialresourcing.co.uk";
  const delivery = env.CANDIDATE_CV_EMAIL_DELIVERY;
  const baseConfigured = Boolean(apiKey && to && from);

  return {
    apiKey,
    to,
    from,
    delivery,
    configured: baseConfigured,
    attachmentDeliveryConfigured:
      baseConfigured && delivery === "resend_attachment",
  };
}

function storageConfig(env: CandidateApplicationDropEnv = process.env) {
  const provider = env.CANDIDATE_CV_STORAGE_PROVIDER;
  const bucket = env.CANDIDATE_CV_STORAGE_BUCKET;
  const endpoint = env.CANDIDATE_CV_STORAGE_ENDPOINT;
  const accessKeyId = env.CANDIDATE_CV_STORAGE_ACCESS_KEY_ID;
  const secretAccessKey = env.CANDIDATE_CV_STORAGE_SECRET_ACCESS_KEY;
  const region = env.CANDIDATE_CV_STORAGE_REGION || "auto";

  return {
    provider,
    bucket,
    endpoint,
    accessKeyId,
    secretAccessKey,
    region,
    configured: Boolean(
      provider && bucket && endpoint && accessKeyId && secretAccessKey,
    ),
    forcePathStyle: env.CANDIDATE_CV_STORAGE_FORCE_PATH_STYLE === "true",
  };
}

export function getCandidateApplicationDropStatus(
  env: CandidateApplicationDropEnv = process.env,
) {
  const featureFlagEnabled = isCandidateTransparencyFeatureEnabled(
    candidateApplicationDropFeatureFlag,
    env,
  );
  const privateStorageConfigured = storageConfig(env).configured;
  const email = emailConfig(env);
  const resendConfigured = email.configured;
  const canSubmitCandidateNote = featureFlagEnabled && resendConfigured;
  const canAcceptCvUploads =
    canSubmitCandidateNote &&
    privateStorageConfigured &&
    email.attachmentDeliveryConfigured;
  const automatedMalwareScanConfigured =
    env.CANDIDATE_CV_MALWARE_SCAN_ENABLED === "true" &&
    Boolean(env.CANDIDATE_CV_MALWARE_SCAN_HOST);

  return {
    featureFlag: candidateApplicationDropFeatureFlag,
    featureFlagEnabled,
    privateStorageConfigured,
    resendConfigured,
    canSubmitCandidateNote,
    storageAdapterImplemented: true,
    canAcceptCvUploads,
    automatedMalwareScanConfigured,
    status: canSubmitCandidateNote ? ("live" as const) : ("staged" as const),
    message: canSubmitCandidateNote
      ? canAcceptCvUploads
        ? "Candidate notes and optional CV upload are live. Files are sent privately to David and stored in private object storage for manual review."
        : "Candidate notes are live. CV upload is hidden until private storage and attachment delivery are configured."
      : "Candidate contact is staged until the feature flag and Resend delivery are configured.",
  };
}

function safeFailure(
  message = "The application could not be sent right now. Please email David directly.",
  statusCode = 400,
): CandidateApplicationDropResult {
  return {
    ok: false,
    statusCode,
    message,
  };
}

function cleanFilename(filename: string) {
  const fallback = "candidate-cv.pdf";
  const cleaned = filename
    .normalize("NFKD")
    .replace(/[^\w.\- ]+/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 90)
    .replace(/^\.+/, "")
    .toLowerCase();

  return cleaned || fallback;
}

function fileExtension(filename: string) {
  const lower = filename.toLowerCase();
  return allowedUploadExtensions.find((extension) => lower.endsWith(extension));
}

function looksLikeCvFile(buffer: Buffer, filename: string) {
  const extension = fileExtension(filename);
  if (!extension) return false;

  if (extension === ".pdf") {
    return buffer.subarray(0, 5).toString("utf8") === "%PDF-";
  }

  if (extension === ".docx") {
    return buffer[0] === 0x50 && buffer[1] === 0x4b;
  }

  if (extension === ".doc") {
    return (
      buffer[0] === 0xd0 &&
      buffer[1] === 0xcf &&
      buffer[2] === 0x11 &&
      buffer[3] === 0xe0 &&
      buffer[4] === 0xa1 &&
      buffer[5] === 0xb1 &&
      buffer[6] === 0x1a &&
      buffer[7] === 0xe1
    );
  }

  return false;
}

function rateLimitKey(
  payload: CandidateApplicationDropPayload,
  meta: RequestMeta,
) {
  return createHash("sha256")
    .update(`${meta.ip || "unknown"}:${payload.email.toLowerCase()}`)
    .digest("hex");
}

function checkRateLimit(key: string, now: number) {
  const current = rateLimitStore.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rateLimitWindowMs });
    return true;
  }

  if (current.count >= rateLimitMax) return false;
  current.count += 1;
  return true;
}

function formatBytes(bytes: number) {
  return `${Math.ceil(bytes / 1024)}KB`;
}

function applicationReference() {
  return `ER-CV-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${randomUUID().slice(0, 8)}`;
}

async function storeCvFile({
  file,
  buffer,
  reference,
  malwareScan,
}: {
  file: File;
  buffer: Buffer;
  reference: string;
  malwareScan: CvMalwareScanResult;
}): Promise<StoredCvFile> {
  const config = storageConfig();
  if (!config.configured) {
    throw new Error("CV storage is not configured.");
  }

  const originalFilename = cleanFilename(file.name);
  const extension = fileExtension(originalFilename) || ".pdf";
  const sha256 = createHash("sha256").update(buffer).digest("hex");
  const storageKey = `candidate-cvs/${new Date().toISOString().slice(0, 10)}/${reference}-${randomUUID()}${extension}`;
  const retentionMonths = Math.max(
    1,
    Number(process.env.RETENTION_CV_FILE_MONTHS || "6"),
  );
  const retentionUntil = new Date();
  retentionUntil.setUTCMonth(retentionUntil.getUTCMonth() + retentionMonths);
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId || "",
      secretAccessKey: config.secretAccessKey || "",
    },
    forcePathStyle: config.forcePathStyle,
  });

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
      Metadata: {
        reference,
        "original-filename": originalFilename,
        sha256,
        "privacy-notice-version": candidatePrivacyNoticeVersion,
        "access-level": "private",
        "review-status": "manual-review-required",
        "malware-scan-status": malwareScan.status,
        "malware-scan-engine": malwareScan.engine,
        "retention-until": retentionUntil.toISOString(),
      },
    }),
  );

  return {
    name: originalFilename,
    type: file.type || "application/octet-stream",
    size: file.size,
    storageProvider: config.provider,
    storageBucket: config.bucket,
    storageKey,
    sha256,
    malwareScan,
  };
}

async function deleteStoredCvFile(file: StoredCvFile | null) {
  if (!file?.storageKey) return;
  const config = storageConfig();
  if (!config.configured) return;

  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId || "",
      secretAccessKey: config.secretAccessKey || "",
    },
    forcePathStyle: config.forcePathStyle,
  });
  await client.send(
    new DeleteObjectCommand({ Bucket: config.bucket, Key: file.storageKey }),
  );
}

async function sendResendEmail({
  to,
  subject,
  text,
  attachments,
}: {
  to: string;
  subject: string;
  text: string;
  attachments?: Array<{ filename: string; content: string }>;
}) {
  const { apiKey, from, delivery } = emailConfig();
  if (!apiKey) {
    throw new Error("Resend delivery is not configured.");
  }

  if (attachments?.length && delivery !== "resend_attachment") {
    throw new Error("Resend attachment delivery is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: essentialEmailSender(from),
      to,
      subject,
      text,
      html: essentialEmailHtml(text),
      attachments,
    }),
  });

  if (!response.ok) {
    throw new Error("Email provider rejected the application message.");
  }
}

function adminEmailText({
  payload,
  reference,
  cv,
}: {
  payload: CandidateApplicationDropPayload;
  reference: string;
  cv: StoredCvFile | null;
}) {
  return [
    "A candidate/application has been submitted through Essential Resourcing.",
    "",
    `Reference: ${reference}`,
    `Route: ${payload.type}`,
    payload.jobTitle ? `Job: ${payload.jobTitle}` : "",
    payload.jobSlug ? `Job slug: ${payload.jobSlug}` : "",
    payload.sourcePage ? `Source page: ${payload.sourcePage}` : "",
    payload.utm_source ? `Referral source: ${payload.utm_source}` : "",
    payload.utm_medium ? `Referral medium: ${payload.utm_medium}` : "",
    payload.utm_campaign ? `Referral campaign: ${payload.utm_campaign}` : "",
    payload.referrerHost ? `Referrer site: ${payload.referrerHost}` : "",
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : "",
    payload.linkedin ? `LinkedIn/profile: ${payload.linkedin}` : "",
    `Preferred contact method: ${payload.preferredContactMethod}`,
    `WhatsApp reply consent: ${payload.whatsappContactConsent === "yes" ? "yes" : "no"}`,
    `Talent pool consent: ${payload.talentPoolConsent === "yes" ? "yes" : "no"}`,
    `Candidate Privacy Notice acknowledged: yes`,
    "",
    payload.note ? payload.note : "No separate note supplied.",
    "",
    cv
      ? [
          "CV/file:",
          `Filename: ${cv.name}`,
          `Size: ${formatBytes(cv.size)}`,
          `MIME type: ${cv.type}`,
          `SHA-256: ${cv.sha256}`,
          `Malware scan: ${cv.malwareScan.status} (${cv.malwareScan.engine})`,
          cv.storageProvider ? `Storage provider: ${cv.storageProvider}` : "",
          cv.storageBucket ? `Storage bucket: ${cv.storageBucket}` : "",
          cv.storageKey ? `Private storage key: ${cv.storageKey}` : "",
          "Review the CV manually before forwarding or using it in any client-facing process.",
        ]
          .filter(Boolean)
          .join("\n")
      : "No CV file uploaded.",
  ]
    .filter(Boolean)
    .join("\n");
}

function candidateConfirmationText(payload: CandidateApplicationDropPayload) {
  return [
    `Hi ${payload.name},`,
    "",
    payload.type === "job"
      ? `Thanks for applying through Essential Resourcing${payload.jobTitle ? ` for ${payload.jobTitle}` : ""}.`
      : "Thanks for sending your details to Essential Resourcing.",
    "",
    "What happens next:",
    ...candidateNextSteps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "If you uploaded a CV, it has gone privately to David for review. It is not published, added to the CMS or sent to clients without permission.",
    "",
    candidateRetentionStatement,
    "",
    `Candidate Privacy Notice: ${siteConfig.url}${candidatePrivacyPath}`,
    `To ask for deletion or a copy of your details: ${siteConfig.url}${dataSubjectRequestPath}`,
    "",
    "No black hole. No nonsense. If it looks relevant, David will come back to you.",
    "",
    "Essential Resourcing",
  ].join("\n");
}

export async function submitCandidateApplicationDrop({
  input,
  cvFile,
  meta = {},
}: {
  input: unknown;
  cvFile: File | null;
  meta?: RequestMeta;
}): Promise<CandidateApplicationDropResult> {
  const status = getCandidateApplicationDropStatus();

  if (!status.canSubmitCandidateNote) {
    return {
      ok: false,
      statusCode: 503,
      message: status.message,
      status: status.status,
    };
  }

  const parsed = candidateApplicationDropSchema.safeParse(input);
  if (!parsed.success) {
    return safeFailure(
      parsed.error.errors[0]?.message || "Please check the form.",
    );
  }

  const payload = parsed.data;
  const now = meta.now || Date.now();

  if (payload.website) {
    return safeFailure("The application could not be sent.");
  }

  if (now - payload.startedAt < 3000) {
    return safeFailure("Please take a moment and try again.");
  }

  if (!checkRateLimit(rateLimitKey(payload, meta), now)) {
    return safeFailure(
      "Too many applications have been sent. Please try again later.",
      429,
    );
  }

  const reference = applicationReference();
  let storedCv: StoredCvFile | null = null;

  try {
    let buffer: Buffer | null = null;

    if (cvFile) {
      if (!status.canAcceptCvUploads) {
        return safeFailure("CV upload is not available right now.", 503);
      }

      buffer = Buffer.from(await cvFile.arrayBuffer());
      if (buffer.length > maxCvFileBytes) {
        return safeFailure("CV file is too large. Maximum size is 10MB.");
      }

      if (!looksLikeCvFile(buffer, cvFile.name)) {
        return safeFailure("CV file must be a valid PDF, DOC or DOCX.");
      }

      const malwareScan = await scanCvBuffer(buffer);
      if (malwareScan.status === "infected") {
        return safeFailure(
          "The CV could not be accepted because it failed the security scan.",
        );
      }

      storedCv = await storeCvFile({
        file: cvFile,
        buffer,
        reference,
        malwareScan,
      });
    }

    const { to } = emailConfig();

    await sendResendEmail({
      to,
      subject: `Essential Resourcing CV/application from ${payload.name}`,
      text: adminEmailText({ payload, reference, cv: storedCv }),
      attachments:
        storedCv && buffer
          ? [
              {
                filename: storedCv.name,
                content: buffer.toString("base64"),
              },
            ]
          : undefined,
    });

    await sendResendEmail({
      to: payload.email,
      subject: candidateConfirmationSubject(payload.type),
      text: candidateConfirmationText(payload),
    });

    return {
      ok: true,
      statusCode: 200,
      message: cvFile
        ? "Thanks. Your CV has been sent privately to David. If it looks relevant, he will come back to you directly."
        : "Thanks. Your note has gone privately to David. If there is a sensible conversation to have, he will come back to you directly.",
      status: "live",
      reference,
    };
  } catch (error) {
    await deleteStoredCvFile(storedCv).catch(() => undefined);
    console.error("Candidate CV upload delivery failed", {
      reason: error instanceof Error ? error.message : "unknown",
      hasResendKey: Boolean(process.env.RESEND_API_KEY),
      hasStorage: storageConfig().configured,
    });

    return safeFailure(
      "The CV could not be sent safely right now. Please email David directly.",
      502,
    );
  }
}
