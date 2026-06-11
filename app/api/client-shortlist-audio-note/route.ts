import { NextResponse } from "next/server";
import {
  getDavidsAudioNotesStatus,
  parseDavidsAudioNotePlaybackRequest,
} from "@/lib/recruiter-labs-audio-notes";

export async function POST(request: Request) {
  const status = getDavidsAudioNotesStatus();

  if (!status.canStreamClientAudio) {
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
      { ok: false, message: "That audio note request could not be accepted." },
      { status: 400 },
    );
  }

  const parsed = parseDavidsAudioNotePlaybackRequest(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: "That audio note request could not be accepted." },
      { status: 400 },
    );
  }

  return NextResponse.json(
    {
      ok: false,
      message:
        "Signed audio playback is not connected yet. David's written take remains the safe client view.",
      status: status.status,
    },
    { status: 501 },
  );
}
