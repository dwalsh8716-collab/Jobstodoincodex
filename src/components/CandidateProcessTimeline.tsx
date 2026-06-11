import Link from "next/link";
import { candidatePrivacyPath } from "@/lib/candidate-trust";

type ProcessConfidence = "confirmed" | "indicative" | "to_be_confirmed";
type ProcessRequirement = "yes" | "no" | "possible" | "to_be_confirmed";

type CandidateProcessTimelineProps = {
  processConfirmed?: ProcessConfidence;
  overview?: string;
  steps?: readonly string[];
  expectedTimeline?: string;
  taskRequired?: ProcessRequirement;
  presentationRequired?: ProcessRequirement;
  firstStageFormat?: string;
  finalStageFormat?: string;
  feedbackExpectation?: string;
  applicationReviewTimeframe?: string;
  compact?: boolean;
};

const defaultSteps = [
  "Apply or send a LinkedIn/profile note.",
  "David reviews it directly.",
  "If there is a possible fit, David contacts you for a proper conversation.",
  "Nothing goes to a client without your permission.",
  "You get a clear next step where there is one.",
] as const;

const requirementCopy: Record<ProcessRequirement, string> = {
  yes: "Yes",
  no: "No",
  possible: "Possible",
  to_be_confirmed: "To be confirmed",
};

function processLabel(processConfirmed: ProcessConfidence) {
  if (processConfirmed === "confirmed") return "Confirmed process";
  if (processConfirmed === "indicative") {
    return "Typical process for this kind of role";
  }
  return "Typical process, exact client stages to confirm";
}

function hasText(value?: string) {
  return Boolean(value?.trim());
}

export function CandidateProcessTimeline({
  processConfirmed = "indicative",
  overview,
  steps,
  expectedTimeline,
  taskRequired = "to_be_confirmed",
  presentationRequired = "to_be_confirmed",
  firstStageFormat,
  finalStageFormat,
  feedbackExpectation,
  applicationReviewTimeframe,
  compact = false,
}: CandidateProcessTimelineProps) {
  const safeSteps = steps?.filter((step) => step.trim()) ?? [];
  const timelineSteps = safeSteps.length ? safeSteps : defaultSteps;

  return (
    <section
      className={`candidate-process-timeline${compact ? " compact" : ""}`}
      aria-label="Candidate process timeline"
    >
      <div className="candidate-process-heading">
        <p className="eyebrow">{processLabel(processConfirmed)}</p>
        <h2>{compact ? "What happens next." : "Interview process."}</h2>
        {hasText(overview) ? <p>{overview}</p> : null}
      </div>

      <ol className="candidate-process-steps">
        {timelineSteps.map((step, index) => (
          <li key={`${index}-${step}`}>
            <span aria-hidden="true">{index + 1}</span>
            <p>{step}</p>
          </li>
        ))}
      </ol>

      <dl className="candidate-process-facts">
        {hasText(applicationReviewTimeframe) ? (
          <div>
            <dt>Application review</dt>
            <dd>{applicationReviewTimeframe}</dd>
          </div>
        ) : null}
        {hasText(expectedTimeline) ? (
          <div>
            <dt>Expected timeline</dt>
            <dd>{expectedTimeline}</dd>
          </div>
        ) : null}
        <div>
          <dt>Task</dt>
          <dd>{requirementCopy[taskRequired]}</dd>
        </div>
        <div>
          <dt>Presentation</dt>
          <dd>{requirementCopy[presentationRequired]}</dd>
        </div>
        {hasText(firstStageFormat) ? (
          <div>
            <dt>First stage</dt>
            <dd>{firstStageFormat}</dd>
          </div>
        ) : null}
        {hasText(finalStageFormat) ? (
          <div>
            <dt>Final stage</dt>
            <dd>{finalStageFormat}</dd>
          </div>
        ) : null}
        {hasText(feedbackExpectation) ? (
          <div>
            <dt>Feedback</dt>
            <dd>{feedbackExpectation}</dd>
          </div>
        ) : null}
      </dl>

      <p className="form-note">
        Your details stay private.{" "}
        <Link href={candidatePrivacyPath}>Candidate Privacy Notice</Link>
      </p>
    </section>
  );
}
