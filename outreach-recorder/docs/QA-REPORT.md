# Essential Resourcing Video Outreach QA Report

Date: 2026-07-10

## Verdict

Pass for MVP local web-app use.

Partial pass for the Chrome extension companion: the extension loads and renders
in Chrome for Testing, but real tab capture, camera and microphone permissions
must still be checked manually in normal Google Chrome after loading the
extension unpacked.

## What Works

- Local app starts through Vite.
- UI loads without console errors in the automated smoke path.
- Prospect name is required before recording/exporting.
- Prospect name, company name, role/title, notes and template insertion work.
- Screen/tab/window capture path uses `navigator.mediaDevices.getDisplayMedia`.
- Webcam and microphone path uses `navigator.mediaDevices.getUserMedia`.
- Final video is composed through canvas and `canvas.captureStream()`.
- MediaRecorder records the composed stream as WebM.
- Webcam bubble can be dragged and resized.
- Webcam bubble is burned into the final WebM when enabled.
- Webcam bubble is not present in the final WebM when hidden.
- Microphone audio is present in the final WebM.
- Countdown, timer, pause, resume, stop and Escape-to-stop are covered.
- WebM download works.
- Existing WebM import works and feeds preview/conversion.
- File naming sanitises prospect/company and uses the friendly
  `name-company-david-walsh-essential-resourcing-video-date-time` pattern.
- MP4 conversion works locally through installed `ffmpeg`.
- MP4 output is H.264 video plus AAC audio.
- Invalid MP4 conversion fails clearly.
- Imported WebM converts to MP4 with H.264/AAC.
- Permission-denied path cleans up already-open media tracks.
- Reset supports a second recording in the same session.
- Branded local landing-page export works.
- Local activity note works.

## What Does Not Count As Fully Proven Yet

- Real browser permission prompts require a human click.
- Real LinkedIn/Sales Navigator upload was not performed.
- Edge was not installed on this Mac, so Edge testing is documented but not run.
- Safari and Firefox are documented as lower-confidence browsers.
- Chrome extension real recording must be manually tested after `Load unpacked`.

## Automated Checks Run

```bash
npm run build
npm test
npm run extension:check
EXTENSION_SMOKE_HEADED=1 npm run extension:smoke
npm audit --audit-level=moderate
```

All passed.

`npm test` runs `scripts/qa-smoke.mjs`, which starts a temporary local Vite
server on port `5199` and uses Playwright fake media streams. It verifies WebM
download, MP4 conversion, H.264/AAC output, the webcam bubble being included in
the final recording, hidden-webcam mode, reset plus second recording, WebM
import plus imported-file conversion, responsive layout, bad conversion failure
and permission-denied cleanup.

## Chrome Extension QA

Extension path:

```text
/Users/walsh/Jobstodoincodex/outreach-recorder/chrome-extension
```

Automated extension checks:

- Manifest V3 static validation passed.
- Required extension files are present.
- Extension JavaScript syntax checks passed.
- Chrome for Testing loaded the unpacked extension.
- Extension popup rendered with the expected **Video Outreach** interface.
- Extension suggests the prospect name from the active tab title without
  scraping LinkedIn page content.

Normal Google Chrome on this Mac ignores command-line extension loading for
security, so the extension cannot be installed automatically into your everyday
Chrome profile from the terminal. Load it manually once through
`chrome://extensions` > **Developer mode** > **Load unpacked**.

## MP4 Conversion

Implemented method: local `ffmpeg` through Vite middleware.

- No paid API.
- No third-party upload.
- Local endpoint: `/api/convert-to-mp4`.
- Verified installed `ffmpeg`: `8.1.2`.
- Verified MP4 output:
  - video codec: H.264
  - audio codec: AAC
  - extension: `.mp4`

The README includes the required manual command:

```bash
ffmpeg -i input.webm -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k output.mp4
```

## Bug List And Fixes

### High: screen capture could remain alive after camera/mic denial

Area: media cleanup.

Steps to reproduce:

1. Start recording.
2. Accept or provide screen capture.
3. Deny camera or microphone.

Expected: any already-open screen stream is stopped.

Actual before fix: the screen stream could remain active because it was not
stored for cleanup until after `getUserMedia()` succeeded.

Recommended fix: store media streams as soon as each browser API resolves.

Fixed: yes.

Files changed:

- `src/hooks/useScreenRecorder.ts`
- `scripts/qa-smoke.mjs`

### Medium: long MP4 conversion response loaded the whole file into memory

Area: MP4 conversion server.

Steps to reproduce:

1. Convert a longer WebM to MP4.
2. Observe server memory behaviour.

Expected: MP4 response can be streamed.

Actual before fix: the generated MP4 was read fully into memory before response.

Recommended fix: stream MP4 response from disk.

Fixed: yes.

File changed:

- `vite.config.ts`

### Medium: Chrome extension initially requested broad site access

Area: privacy and permissions.

Steps to reproduce:

1. Inspect the extension manifest.

Expected: use temporary access to the active tab only.

Actual before fix: manifest included broad `<all_urls>` host permission.

Recommended fix: remove broad host permission and rely on `activeTab` plus user
invocation.

Fixed: yes.

File changed:

- `chrome-extension/manifest.json`

### Low: hidden-webcam and second-recording path lacked automated coverage

Area: QA automation.

Steps to reproduce:

1. Run the original smoke test.

Expected: test covers hidden webcam mode and record-twice reliability.

Actual before fix: happy path only proved enabled webcam mode.

Recommended fix: add hidden-webcam recording after reset and verify final file.

Fixed: yes.

File changed:

- `scripts/qa-smoke.mjs`

### Low: extension smoke test assumed Manifest V3 service worker would wake

Area: QA automation.

Steps to reproduce:

1. Run extension smoke in Chrome.

Expected: extension load check should not depend on a sleeping service worker.

Actual before fix: the smoke test timed out waiting for the service worker.

Recommended fix: discover the unpacked extension ID from Chrome for Testing's
temporary profile, then open the popup page directly.

Fixed: yes.

File changed:

- `scripts/extension-smoke.mjs`

## Residual Risks

- The real Chrome screen picker cannot be automated safely; it must be tested by
  a human.
- The Chrome extension records the current tab only, not arbitrary windows or
  screens.
- Extension MP4 conversion is not built in yet; extension output is WebM first.
- Use the local app's **Import WebM** control to convert extension recordings to
  MP4.
- System/tab audio depends on browser, OS and chosen capture surface.
- Long recordings create larger Blobs in browser memory before download.
- Self-contained landing pages can become large because the video is embedded in
  the HTML file.
- Any upload to LinkedIn/Sales Navigator should be tested with a short, low-risk
  sample before real prospect use.

## Browser Notes

- Chrome: recommended for the local app and required for the extension.
- Edge: likely suitable for the local web app because it is Chromium-based, but
  Edge was not installed on this Mac for live testing.
- Firefox: core APIs exist, but WebM/codec and system-audio behaviour may vary.
- Safari: not recommended as the main browser for this MVP because screen/audio
  capture and MediaRecorder codec behaviour differ from Chromium.

References checked:

- [MDN `getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia)
- [MDN `getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [MDN `MediaRecorder`](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)
- [MDN `canvas.captureStream()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream)
- [Chrome `tabCapture`](https://developer.chrome.com/docs/extensions/reference/api/tabCapture)
- [Chrome offscreen documents](https://developer.chrome.com/docs/extensions/reference/api/offscreen)

## Acceptance Criteria

- Record locally: passed in automated fake-media path; real picker requires
  manual user selection.
- Final video includes screen capture: passed.
- Final video includes webcam bubble overlay: passed.
- Final video includes microphone audio: passed.
- Preview recording: passed.
- Download usable WebM: passed.
- Download usable MP4: passed for local web app with ffmpeg.
- Clear MP4 fallback path: passed.
- Permission denial does not crash and cleans up: passed.
- README explains usage: passed.
- Extension overlay on selected tab: shell passed; real permission test pending.
