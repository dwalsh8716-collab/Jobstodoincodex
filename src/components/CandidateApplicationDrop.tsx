import Link from "next/link";
import { getCandidateApplicationDropStatus } from "@/lib/candidate-application-drop";
import { candidatePrivacyPath } from "@/lib/candidate-trust";
import { ContactForm } from "./ContactForm";

type CandidateApplicationDropProps = {
  type?: "candidate" | "job";
  jobTitle?: string;
  jobSlug?: string;
};

export function CandidateApplicationDrop({
  type = "candidate",
  jobTitle,
  jobSlug,
}: CandidateApplicationDropProps) {
  const status = getCandidateApplicationDropStatus();
  const inputId = `candidate-application-drop-${type}-${jobSlug || "general"}`;

  return (
    <div className="candidate-application-drop">
      <div className="form-trust-panel">
        <h3>Passwordless application</h3>
        <p>
          No account needed. Add your details, a LinkedIn/profile URL and a
          short note. CV upload stays off until private storage is properly
          ready.
        </p>
        <div className="form-row">
          <label htmlFor={inputId}>
            CV upload <span className="optional-label">staged</span>
          </label>
          <input
            id={inputId}
            name="cvFile"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled
            aria-describedby={`${inputId}-note`}
          />
          <p className="form-note" id={`${inputId}-note`}>
            {status.message} Use the form below for now; David can ask for a CV
            through an approved private route when needed.
          </p>
        </div>
        <p className="form-note">
          CVs must never go in Sanity, GitHub, analytics or the public folder.{" "}
          <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link>
        </p>
      </div>
      <ContactForm type={type} jobTitle={jobTitle} jobSlug={jobSlug} />
    </div>
  );
}
