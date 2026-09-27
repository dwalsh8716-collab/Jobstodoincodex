# Essential Resourcing Video Outreach Chrome Extension

This is a lightweight prototype extension for recording the current Chrome tab with a visible webcam bubble and countdown on that same tab.

It is deliberately local-first:

- No login.
- No database.
- No LinkedIn scraping.
- No auto-sending.
- No paid APIs.
- No cloud upload.
- The first extension version downloads a local WebM file.

## What It Does

1. Open a LinkedIn profile, company website, job advert or other normal web page.
2. Click the Essential Resourcing Video Outreach extension.
3. Check the prospect name suggested from the tab title.
4. Add or correct company details if useful.
5. Click **Start on this tab**.
6. The countdown, webcam bubble, timer and stop button appear on the selected tab.
7. Stop from the overlay.
8. Chrome downloads a local `.webm` recording.

The final recording includes the selected tab, the webcam bubble if enabled, and microphone audio if permitted.
The extension uses the browser tab title to suggest a filename-friendly prospect
name. It does not scrape LinkedIn profile content.

## What It Does Not Do Yet

- It does not record arbitrary windows or your whole screen.
- It does not convert to MP4 inside the extension yet.
- It does not upload or host videos.
- It does not track opens, clicks or analytics.
- It does not read, scrape or save LinkedIn page data.

For MP4, use the main local recorder app:

1. Open `http://127.0.0.1:5174`.
2. Click **Import WebM** in the Export panel.
3. Choose the extension WebM.
4. Click **Convert to MP4**.
5. Click **Download MP4**.

Or use this local command:

```bash
ffmpeg -i input.webm -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k output.mp4
```

## Load It In Chrome

Normal Google Chrome blocks command-line extension loading on this Mac, so load
the extension manually once:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select this folder:

```text
/Users/walsh/Jobstodoincodex/outreach-recorder/chrome-extension
```

5. Pin **Essential Resourcing Video Outreach** to your Chrome toolbar.

The automated QA check loads the extension in Chrome for Testing, but your
everyday Chrome profile still needs the manual Load unpacked step above.

## First Test

1. Open a simple website tab first, such as your own site or a blank test page.
2. Click the extension icon.
3. Keep **Show webcam bubble** and **Record microphone** enabled.
4. Click **Start on this tab**.
5. Allow camera and microphone permissions when Chrome asks.
6. Drag the bubble if needed.
7. Click **Stop** in the overlay.
8. Check your Downloads folder for the WebM file.

## Browser Notes

- Use Google Chrome 116 or newer.
- The extension cannot run on browser-internal pages such as `chrome://extensions`, Chrome Web Store pages, or some restricted system pages.
- Some websites may block embedded camera previews. If that happens, the overlay may show a camera preview warning. The recording engine still tries to capture the webcam in the extension's offscreen recorder.
- If tab audio is enabled, Chrome may handle playback differently. This prototype reconnects tab audio to local playback where Chrome allows it.

## Privacy Notes

- Record only pages you are comfortable saving locally.
- Avoid candidate personal data, private messages, inboxes, passwords, internal systems and confidential client details.
- LinkedIn pages can include personal data. Keep videos short, specific and proportionate.
- This prototype does not scrape LinkedIn, automate LinkedIn, or send anything to LinkedIn.

## Known Limitations

- Output is WebM first. Convert to MP4 locally when needed for LinkedIn upload.
- The selected tab is captured after you click the extension. If you switch tabs before starting, the new active tab is the one recorded.
- The overlay can disappear if the tab is refreshed or navigates during recording.
- Real recording permissions must be tested manually in Chrome because Chrome's camera, microphone and tab capture prompts cannot be fully tested by a normal build script.
