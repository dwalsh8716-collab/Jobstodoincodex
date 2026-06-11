import { NextResponse } from "next/server";
import { saveRecruiterLabsClientFeedback } from "@/lib/recruiter-labs-feedback";

const responseMessages = {
  ok: "Feedback received. David will review it.",
  request_interview_ok:
    "Thanks - David has the request and will coordinate the next step.",
  invalid_payload: "That feedback could not be accepted.",
  feedback_disabled: "Client portal feedback is not live yet.",
  database_unavailable: "Client portal feedback is not connected yet.",
  portal_access_denied: "This shortlist feedback link cannot be used.",
  candidate_not_scoped: "This candidate is not available for this shortlist.",
  database_write_failed: "Feedback could not be saved.",
  audit_log_failed: "Feedback could not be fully audited.",
} as const;

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: responseMessages.invalid_payload,
      },
      { status: 400 },
    );
  }

  const result = await saveRecruiterLabsClientFeedback(body);
  const message =
    result.code === "ok" && result.action === "request_interview"
      ? responseMessages.request_interview_ok
      : responseMessages[result.code];

  return NextResponse.json(
    {
      ok: result.ok,
      message,
      code: result.code,
    },
    { status: result.status },
  );
}
