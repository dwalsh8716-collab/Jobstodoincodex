import { NextResponse, type NextRequest } from "next/server";
import { getCandidateApplicationDropStatus } from "@/lib/candidate-application-drop";
import {
  candidateApplicationDropSchema,
  formDataToCandidateApplicationDropInput,
  validateCvFile,
} from "@/validations/candidate-application-drop";

export async function POST(request: NextRequest) {
  const status = getCandidateApplicationDropStatus();

  if (!status.canAcceptCvUploads) {
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

  const parsed = candidateApplicationDropSchema.safeParse(
    formDataToCandidateApplicationDropInput(formData),
  );
  const cvFile = validateCvFile(formData.get("cvFile"));

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message: parsed.error.errors[0]?.message || "Please check the form.",
      },
      { status: 400 },
    );
  }

  if (!cvFile.ok) {
    return NextResponse.json(
      { ok: false, message: cvFile.message },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "Private CV storage is not connected yet. Use the note or LinkedIn route for now.",
    },
    { status: 501 },
  );
}
