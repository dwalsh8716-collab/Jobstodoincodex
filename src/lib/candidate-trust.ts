export const candidatePrivacyPath = "/candidate-privacy";

export const candidatePrivacyNoticeVersion = "candidate-privacy-v1";

export const candidateRetentionStatement =
  "We'll only keep your details for as long as there is a genuine recruitment reason to do so. If you apply for a role or send us your CV, we may keep your details so David can contact you about relevant opportunities. You can ask us to delete your details at any time.";

export const candidateNextSteps = [
  "David reviews your note or application directly.",
  "If it looks like a possible fit, he will contact you without turning it into a sales sequence.",
  "Your details are handled privately and only used for recruitment purposes.",
  "You can ask for your details to be deleted or exported at any time.",
] as const;

export function candidateConsentCopy(type: "candidate" | "job") {
  return type === "job"
    ? "I'm happy for Essential Resourcing to store and use my details to contact me about this role and relevant opportunities. I understand I can ask for my details to be deleted at any time."
    : "I'm happy for Essential Resourcing to store and use my details to contact me about relevant opportunities. I understand I can ask for my details to be deleted at any time.";
}

export function candidateConfirmationSubject(type: "candidate" | "job") {
  return type === "job"
    ? "We've received your application"
    : "We've received your note";
}
