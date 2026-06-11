import { NextResponse } from "next/server";
import { saveRecruiterLabsPortalEngagement } from "@/lib/recruiter-labs-engagement";

const responseMessages = {
  ok: "Engagement recorded.",
  duplicate_ignored: "Engagement accepted.",
  invalid_payload: "That engagement event could not be accepted.",
  tracking_disabled: "Client portal engagement tracking is not live yet.",
  database_unavailable: "Client portal engagement tracking is not connected yet.",
  portal_access_denied: "This shortlist link cannot be used.",
  candidate_not_scoped: "This candidate is not available for this shortlist.",
  database_write_failed: "Engagement could not be recorded.",
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

  const result = await saveRecruiterLabsPortalEngagement(body);

  return NextResponse.json(
    {
      ok: result.ok,
      message: responseMessages[result.code],
      code: result.code,
    },
    { status: result.status },
  );
}
