import { NextResponse, type NextRequest } from "next/server";
import {
  getCandidateApplicationDropStatus,
  submitCandidateApplicationDrop,
} from "@/lib/candidate-application-drop";
import {
  formDataToCandidateApplicationDropInput,
  validateCvFile,
} from "@/validations/candidate-application-drop";

export async function POST(request: NextRequest) {
  const status = getCandidateApplicationDropStatus();

  if (!status.canSubmitCandidateNote) {
    return NextResponse.json(
      {
        ok: false,
        message: status.message,
        status: status.status,
      },
      { status: 503 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Please check the application form." },
      { status: 400 },
    );
  }

  const cvFile = validateCvFile(formData.get("cvFile"));

  if (!cvFile.ok) {
    return NextResponse.json(
      { ok: false, message: cvFile.message },
      { status: 400 },
    );
  }

  if (cvFile.file && !status.canAcceptCvUploads) {
    return NextResponse.json(
      {
        ok: false,
        message: "CV upload is not available right now.",
        status: status.status,
      },
      { status: 503 },
    );
  }

  const cvEntry = formData.get("cvFile");
  const result = await submitCandidateApplicationDrop({
    input: formDataToCandidateApplicationDropInput(formData),
    cvFile:
      cvEntry && typeof cvEntry !== "string" && cvEntry.size > 0
        ? cvEntry
        : null,
    meta: {
      ip:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    },
  });

  return NextResponse.json(result, { status: result.statusCode });
}
