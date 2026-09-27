export const candidatePrivacyPath = "/candidate-privacy";

export const candidatePrivacyNoticeVersion = "candidate-privacy-v2-2026-09";

export const candidateRetentionStatement =
  "Candidate records are reviewed no later than 24 months after the last meaningful contact. They may be kept longer where the recruitment relationship remains active, you have asked David to keep you in mind, or a legal or regulatory reason requires it. You can ask David to delete your details at any time, subject to those obligations.";

export const candidateNextSteps = [
  "David reviews your note directly.",
  "If there's a sensible fit or conversation, he'll contact you.",
  "Your information is handled privately and used for recruitment purposes.",
  "You can ask for your information to be deleted or exported at any time.",
] as const;

export function candidateConsentCopy(type: "candidate" | "job") {
  return type === "job"
    ? "I understand Essential Resourcing will use my details to respond to this application and provide recruitment services as explained in the Candidate Privacy Notice."
    : "I understand Essential Resourcing will use my details to respond and provide recruitment services as explained in the Candidate Privacy Notice.";
}

export function candidateConfirmationSubject(type: "candidate" | "job") {
  return type === "job"
    ? "We've received your application"
    : "We've received your note";
}
