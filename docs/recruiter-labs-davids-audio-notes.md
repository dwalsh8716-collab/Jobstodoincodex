# David's Take Audio Notes

This is a staged Recruiter Labs feature for future private client shortlist
profiles.

It is not live. It must not be used for real clients until private storage,
compression, signed playback, retention and privacy wording are approved.

## Why It Exists

David may eventually record a short 30-60 second note for a candidate profile:

- why they are included
- what the client should notice
- watch-outs
- fit against the brief

Used well, this could feel premium and founder-led. Used badly, it could leak
private candidate data. So the safe default is off.

## Feature Flag

```txt
FEATURE_DAVIDS_AUDIO_NOTES=false
```

The flag is server-side only. It is not a public launch switch.

Storage placeholders:

```txt
DAVIDS_AUDIO_NOTE_STORAGE_PROVIDER=
DAVIDS_AUDIO_NOTE_STORAGE_BUCKET=
DAVIDS_AUDIO_NOTE_STORAGE_SIGNING_SECRET=
```

Do not put secrets in GitHub. Do not put audio files in `/public`.

## What Has Been Staged

Migration:

```txt
database/migrations/020_recruiter_labs_audio_notes.sql
```

Private tables:

- `recruiter_lab_candidate_audio_notes`
- `recruiter_lab_candidate_audio_note_access_logs`

The audio-note table stores metadata only:

- shortlist candidate link
- private source file reference
- compressed file reference
- duration limit
- transcript status
- compression status
- approval status
- client visibility timestamp
- retention and deletion state
- access counters

It does not store public audio URLs.

## Locked Routes

Admin metadata/upload route:

```txt
/api/recruiter-labs/audio-notes
```

Client playback request route:

```txt
/api/client-shortlist-audio-note
```

Both routes currently fail closed. That is intentional.

## Launch Blockers

Before this can be used:

- choose private object storage
- build authenticated admin recording/upload
- add compression/transcoding
- add malware/manual file review where appropriate
- issue short-lived signed playback or authenticated streaming
- log every playback request in Postgres
- approve transcript handling
- confirm retention and deletion rules
- update client portal terms and candidate privacy wording
- decide who in admin can create, approve, revoke and delete notes

## Client Portal Rules

No client should see or hear an audio note unless:

- the portal magic link is valid
- the shortlist candidate is approved for sharing
- candidate consent and retention checks have passed
- the audio note is compressed
- David has approved the exact note
- playback is signed/authenticated
- the access request is logged

No audio in Sanity. No public audio URLs. No token in audio URLs. No faff.
