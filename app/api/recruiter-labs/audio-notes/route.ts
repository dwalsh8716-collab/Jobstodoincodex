import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  CMS_SESSION_COOKIE,
  isCmsSessionValid,
} from "@/lib/cms-auth";
import {
  getDavidsAudioNotesStatus,
  parseDavidsAudioNoteMetadata,
} from "@/lib/recruiter-labs-audio-notes";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(sessionCookie);

  if (!loggedIn) {
    return NextResponse.json(
      {
        ok: false,
        message: "Sign in before managing Recruiter Labs audio notes.",
      },
      { status: 401 },
    );
  }

  const status = getDavidsAudioNotesStatus();

  if (!status.canAcceptAdminAudio) {
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
      { ok: false, message: "Check the audio note details." },
      { status: 400 },
    );
  }

  const parsed = parseDavidsAudioNoteMetadata(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        message:
          parsed.error.errors[0]?.message || "Check the audio note details.",
      },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "Private audio-note storage is not connected yet. Keep this as an admin-only staged workflow.",
      status: status.status,
    },
    { status: 501 },
  );
}
