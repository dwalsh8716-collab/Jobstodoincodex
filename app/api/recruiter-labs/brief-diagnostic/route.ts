import { NextResponse } from "next/server";
import {
  buildAiBriefDiagnosticReviewPack,
  getAiBriefDiagnosticStatus,
} from "@/lib/ai-brief-diagnostic";

export async function POST(request: Request) {
  const status = getAiBriefDiagnosticStatus();

  if (!status.canAcceptSubmissions) {
    return NextResponse.json(
      {
        ok: false,
        message: status.message,
        status: status.status,
      },
      { status: 503 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "That brief diagnostic could not be accepted." },
      { status: 400 },
    );
  }

  const result = buildAiBriefDiagnosticReviewPack(body);
  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: "Please check the brief diagnostic answers.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "AI brief diagnostic storage and David review are not connected yet.",
      status: status.status,
    },
    { status: 501 },
  );
}
