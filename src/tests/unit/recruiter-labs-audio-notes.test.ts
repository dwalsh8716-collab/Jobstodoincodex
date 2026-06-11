import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { POST } from "../../../app/api/client-shortlist-audio-note/route";
import {
  davidsAudioNoteAllowedMimeTypes,
  davidsAudioNotesManualBlockers,
  getDavidsAudioNotesStatus,
  parseDavidsAudioNoteMetadata,
  parseDavidsAudioNotePlaybackRequest,
} from "@/lib/recruiter-labs-audio-notes";
import { recruiterLabsFlagDefinitions } from "@/lib/recruiter-labs";

vi.mock("server-only", () => ({}));

const validToken = "abcdefghijklmnopqrstuvwxyzABCDEF";
const validAudioNoteId = "00000000-0000-4000-8000-000000000010";
const validShortlistCandidateId = "00000000-0000-4000-8000-000000000001";
const validFileId = "00000000-0000-4000-8000-000000000002";

describe("Recruiter Labs David's Take audio notes", () => {
  it("keeps audio notes staged even if the flag and storage envs are set", () => {
    const status = getDavidsAudioNotesStatus({
      FEATURE_DAVIDS_AUDIO_NOTES: "true",
      FEATURE_CLIENT_PRESENTATION_PORTAL: "true",
      OPERATIONS_DB_ENABLED: "true",
      DATABASE_URL: "postgres://example",
      DAVIDS_AUDIO_NOTE_STORAGE_PROVIDER: "r2",
      DAVIDS_AUDIO_NOTE_STORAGE_BUCKET: "private-audio",
      DAVIDS_AUDIO_NOTE_STORAGE_SIGNING_SECRET: "secret",
    });

    expect(status).toMatchObject({
      featureFlagEnabled: true,
      portalEnabled: true,
      privateStorageConfigured: true,
      storageAdapterImplemented: false,
      adminUploadImplemented: false,
      compressionImplemented: false,
      signedPlaybackImplemented: false,
      canAcceptAdminAudio: false,
      canStreamClientAudio: false,
      status: "staged",
    });
    expect(davidsAudioNotesManualBlockers.join(" ")).toMatch(
      /signed playback/i,
    );
  });

  it("validates audio-note metadata without allowing overlong notes", () => {
    expect(davidsAudioNoteAllowedMimeTypes).toContain("audio/mpeg");

    expect(
      parseDavidsAudioNoteMetadata({
        shortlistCandidateId: validShortlistCandidateId,
        sourceFileId: validFileId,
        compressedFileId: validFileId,
        durationSeconds: 60,
        transcript: "Short approved note.",
        approvalStatus: "david_review",
      }).success,
    ).toBe(true);

    expect(
      parseDavidsAudioNoteMetadata({
        shortlistCandidateId: validShortlistCandidateId,
        sourceFileId: validFileId,
        durationSeconds: 61,
      }).success,
    ).toBe(false);
  });

  it("keeps playback requests token-scoped and off URL paths", () => {
    expect(
      parseDavidsAudioNotePlaybackRequest({
        token: validToken,
        audioNoteId: validAudioNoteId,
      }).success,
    ).toBe(true);
    expect(
      parseDavidsAudioNotePlaybackRequest({
        token: "bad",
        audioNoteId: validAudioNoteId,
      }).success,
    ).toBe(false);
  });

  it("stages private database tables without public audio URLs or Sanity storage", () => {
    const migration = readFileSync(
      "database/migrations/020_recruiter_labs_audio_notes.sql",
      "utf8",
    );

    expect(migration).toContain("recruiter_lab_candidate_audio_notes");
    expect(migration).toContain("recruiter_lab_candidate_audio_note_access_logs");
    expect(migration).toContain("duration_seconds >= 1");
    expect(migration).toContain("duration_seconds <= 60");
    expect(migration).toContain("approval_status");
    expect(migration).toContain("compressed_file_id");
    expect(migration).not.toMatch(/public_url|audio_url|raw_token|token text|sanity/i);
  });

  it("keeps the client playback API locked and avoids echoing token or note ids", async () => {
    const response = await POST(
      new Request("http://localhost/api/client-shortlist-audio-note", {
        method: "POST",
        body: JSON.stringify({
          token: validToken,
          audioNoteId: validAudioNoteId,
        }),
      }),
    );
    const text = await response.text();

    expect(response.status).toBe(503);
    expect(text).toContain("David's audio notes are staged");
    expect(text).not.toContain(validToken);
    expect(text).not.toContain(validAudioNoteId);
  });

  it("documents the feature flag, privacy boundary and manual blockers", () => {
    const docs = readFileSync(
      "docs/recruiter-labs-davids-audio-notes.md",
      "utf8",
    );
    const env = readFileSync(".env.example", "utf8");
    const dataBoundaries = readFileSync("src/lib/data-boundaries.ts", "utf8");

    expect(env).toContain("FEATURE_DAVIDS_AUDIO_NOTES=false");
    expect(docs).toContain("No audio in Sanity");
    expect(docs).toContain("No public audio URLs");
    expect(docs).toContain("/api/client-shortlist-audio-note");
    expect(dataBoundaries).toContain("davidsTakeAudio");
    expect(
      recruiterLabsFlagDefinitions.some(
        (flag) => flag.name === "FEATURE_DAVIDS_AUDIO_NOTES",
      ),
    ).toBe(true);
  });
});
