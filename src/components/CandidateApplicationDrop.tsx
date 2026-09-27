import { getCandidateApplicationDropStatus } from "@/lib/candidate-application-drop";
import { CandidateApplicationDropForm } from "./CandidateApplicationDropForm";

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
  const disabledMessage = status.canSubmitCandidateNote
    ? ""
    : "Candidate contact is currently unavailable. Please email David directly.";

  return (
    <div className="candidate-application-drop">
      <CandidateApplicationDropForm
        type={type}
        jobTitle={jobTitle}
        jobSlug={jobSlug}
        canSubmitCandidateNote={status.canSubmitCandidateNote}
        canAcceptCvUploads={status.canAcceptCvUploads}
        disabledMessage={disabledMessage}
      />
    </div>
  );
}
