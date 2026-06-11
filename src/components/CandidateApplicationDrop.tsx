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
          No account needed. Add your details and either a LinkedIn/profile URL
          or a short note. CV upload stays off until private storage is properly
          ready.
        </p>
        <div
          className="candidate-dropzone"
          aria-describedby={`${inputId}-note ${inputId}-progress`}
          aria-disabled="true"
          role="group"
        >
          <label htmlFor={inputId}>CV drop</label>
          <p>
            Drag-and-drop and click upload are staged for PDF, DOC and DOCX
            files up to 10MB.
          </p>
          <input
            id={inputId}
            name="cvFile"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            disabled
            aria-describedby={`${inputId}-note`}
          />
          <span id={`${inputId}-progress`} className="candidate-upload-status">
            Upload progress unavailable until private storage is approved.
          </span>
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
