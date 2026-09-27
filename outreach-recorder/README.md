# Essential Resourcing Video Outreach

Local video outreach recorder for Essential Resourcing.

It records a screen, browser tab or window, adds a webcam bubble, captures
microphone audio, previews the recording, downloads a WebM backup and can convert
to MP4 locally when `ffmpeg` is installed.

Important: `ffmpeg` is installed on the Mac, not inside the browser. The local
Vite app talks to that installed `ffmpeg` while `npm run dev` is running.

## What It Does

- Records a screen, window or browser tab chosen by you.
- Records your webcam as a draggable rounded bubble.
- Records microphone audio.
- Optionally includes system or tab audio where the browser supports it.
- Saves the original recording as WebM.
- Imports an existing WebM, including one recorded by the Chrome extension.
- Converts WebM to MP4 locally with H.264 video and AAC audio when `ffmpeg` is
  available.
- Requires the prospect name before recording or exporting.
- Names downloads in a friendly format such as
  `claire-marley-dfs-david-walsh-essential-resourcing-video-2026-07-10-15-44.mp4`.
- Generates a branded local landing page file with the video embedded.
- Provides simple talk-track templates.
- Keeps an optional local-only activity log in this browser.

## What It Deliberately Does Not Do

- No login.
- No database.
- No cloud upload.
- No CRM integration.
- No AI.
- No recipient or viewer tracking.
- No auto-sending.
- No LinkedIn scraping.
- No paid conversion APIs.
- No third-party upload for conversion.

## Install

```bash
npm install
```

## Run Locally

```bash
npm run dev
```

Open the local URL shown in the terminal, usually:

```txt
http://127.0.0.1:5174
```

Use Chrome or Edge for the best screen, camera and audio support.

## Run Automatically On This Mac

This Mac has a LaunchAgent installed so the local app starts in the background
when you log in:

```txt
/Users/walsh/Library/LaunchAgents/com.essentialresourcing.videooutreach.plist
```

It runs:

```txt
/Users/walsh/Jobstodoincodex/outreach-recorder/scripts/start-local-app.sh
```

The app is built and served from the local production preview output. If the
process exits, macOS restarts it.

There is also a watchdog LaunchAgent that checks the local URL every minute and
restarts the app if the URL stops responding:

```txt
/Users/walsh/Library/LaunchAgents/com.essentialresourcing.videooutreach.watchdog.plist
/Users/walsh/Jobstodoincodex/outreach-recorder/scripts/watch-local-app.sh
```

Open:

```txt
http://127.0.0.1:5174/
```

Useful commands:

```bash
launchctl print gui/$(id -u)/com.essentialresourcing.videooutreach
launchctl print gui/$(id -u)/com.essentialresourcing.videooutreach.watchdog
launchctl kickstart -k gui/$(id -u)/com.essentialresourcing.videooutreach
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.essentialresourcing.videooutreach.plist
```

The Mac must be switched on, awake enough to run background services, and logged
into this user account. The app only runs locally on this Mac.

For the closest thing to "always on", keep the Mac awake in System Settings
while plugged in. A fully asleep or powered-off Mac cannot serve
`127.0.0.1`.

## Optional Chrome Extension Prototype

The local web app is the main MVP. A companion Chrome extension is also included
for the workflow where the countdown, stop button and webcam bubble should
appear on the selected tab itself.

Extension folder:

```txt
/Users/walsh/Jobstodoincodex/outreach-recorder/chrome-extension
```

Load it manually in Google Chrome:

1. Open `chrome://extensions`.
2. Turn on **Developer mode**.
3. Click **Load unpacked**.
4. Select the extension folder above.
5. Pin **Essential Resourcing Video Outreach** to the toolbar.

Chrome blocks command-line extension loading in normal Google Chrome on this
machine, so the terminal cannot safely install it into your everyday Chrome
profile automatically. The automated QA smoke test loads it in Chrome for
Testing instead.

The extension records the current tab only and downloads WebM. Convert that WebM
to MP4 with **Import WebM** in the main local app.

When opened from a normal page, the extension suggests the prospect name from
the current tab title. It does not scrape LinkedIn page content; check the
suggestion before recording.

## Record The First Video

1. Enter the prospect name. This is required for friendly filenames.
2. Add company details if useful.
3. Paste a short reminder in Notes.
4. Choose whether to show the webcam bubble.
5. Choose webcam size.
6. Turn system audio on only if you need browser/tab sound.
7. Press Start recording.
8. Pick the screen, window or tab in the browser prompt.
9. Allow camera and microphone access.
10. Wait for the 3, 2, 1 countdown.
11. Press Stop when finished.
12. Preview the recording.
13. Download the WebM backup.
14. Convert to MP4 and download the MP4 when local conversion is available.
15. Optionally download a branded local landing page.
16. Optionally save a local activity note.

The Escape key also stops a live recording.

## Convert A WebM From The Chrome Extension

The Chrome extension records the selected tab and downloads a WebM. To turn that
into an MP4:

1. Keep the local app running at `http://127.0.0.1:5174`.
2. Open the local app.
3. In the Export panel, click **Import WebM**.
4. Choose the WebM downloaded by the Chrome extension.
5. Preview it in the app.
6. Click **Convert to MP4**.
7. Click **Download MP4**.

The imported WebM can also be used by the branded local Share page panel.

## Download WebM

WebM is the browser-native backup format. It is the safest first recording
target because browser support is much more reliable than direct MP4 recording.

Use Download WebM backup after recording.

## Convert And Download MP4

The app records WebM first, then sends the WebM to the local Vite development
server on your own machine. The local server runs `ffmpeg` and returns an MP4.
Nothing is uploaded to a third-party conversion service.

The MP4 conversion uses:

```bash
ffmpeg -i input.webm -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k output.mp4
```

The in-app converter also adds `-movflags +faststart`, which helps MP4 playback
start quickly after upload.

If the Convert to MP4 button is disabled, install `ffmpeg`, restart the local
app and try again.

## Branded Landing Page

After recording, the Share page panel can download a self-contained branded
HTML file with the video embedded.

This is not a hosted page and it does not upload the video anywhere. It is a
local file. If you later choose to host it, use private storage, noindex pages,
clear deletion rules and avoid public folders.

MP4 is preferred for the landing page when available. If MP4 has not been
created, the page uses the WebM backup.

## Templates

The Templates panel gives simple starter talk tracks for:

- LinkedIn profile outreach
- company website outreach
- job advert outreach
- founder / CEO outreach
- agency leader outreach

Templates are inserted into the Notes box. They are not generated by AI and are
not sent anywhere.

## Local Activity Log

The Local activity panel can save a short browser-local note that a recording,
MP4 or landing page was created.

This uses browser local storage on your machine. It is not recipient analytics,
does not track opens or views and does not send anything to a server.

Use Clear if you want to remove the local activity notes from this browser.

## Install ffmpeg

### Mac

With Homebrew:

```bash
brew install ffmpeg
```

Check it:

```bash
ffmpeg -version
```

### Windows

With Winget:

```powershell
winget install Gyan.FFmpeg
```

Then close and reopen your terminal and check:

```powershell
ffmpeg -version
```

Alternative: download a Windows build from `https://www.ffmpeg.org/download.html`
and add the `bin` folder to your PATH.

### Linux

Ubuntu or Debian:

```bash
sudo apt update
sudo apt install ffmpeg
```

Fedora:

```bash
sudo dnf install ffmpeg
```

Check it:

```bash
ffmpeg -version
```

## Browser Recommendations

- Chrome: recommended.
- Edge: recommended.
- Firefox: screen recording works, but system audio and codec support may vary.
- Safari: screen recording and MediaRecorder support can be more limited.

The app must run on localhost or HTTPS. Plain non-local HTTP will not get the
browser permissions needed for recording.

## Known Limitations

- The browser always shows its own screen-share picker. The app cannot choose a
  LinkedIn tab or window automatically.
- System audio depends on browser and operating system support.
- MP4 recording directly in the browser is not reliable enough for the core
  workflow, so WebM is recorded first.
- Local MP4 conversion requires `ffmpeg` on the machine running the app.
- The browser-based app cannot run installed `ffmpeg` by itself; the Vite dev
  server provides the local-only bridge while `npm run dev` is running.
- Very long videos may take time to convert.
- Self-contained landing pages can become large because the video is embedded
  inside the HTML file.
- The local activity log is only available in the browser where it was saved.

## Privacy Notes

Videos may include LinkedIn profiles, company pages, job adverts or personal
data. Keep recordings local unless you deliberately decide to upload or share
them.

Before recording:

- Close private messages and unrelated tabs.
- Turn off desktop notifications.
- Avoid capturing candidate data or confidential client material.
- Record only what is necessary for the outreach message.
- Delete recordings you no longer need.
- Clear the local activity log when it is no longer useful.

This tool does not scrape LinkedIn, automate LinkedIn, send messages or extract
profile data.

## Troubleshooting

### Permission denied

Allow screen, camera and microphone access in the browser prompt. If you blocked
access, open browser site settings for `127.0.0.1` and reset permissions.

### No camera or microphone

Check the device is connected, not muted at operating-system level and not
already being used by another app.

### Screen capture stopped unexpectedly

The browser's screen-sharing control may have been stopped. Start a new
recording.

### MP4 conversion failed

Check `ffmpeg -version` works in a new terminal. If it does not, reinstall
`ffmpeg`, restart the local app and try again.

### Convert button is disabled

Install `ffmpeg`, restart `npm run dev`, then press the refresh button in the
Export panel.

## Build Check

```bash
npm run typecheck
npm run build
npm test
npm run extension:check
EXTENSION_SMOKE_HEADED=1 npm run extension:smoke
```

`npm test` runs a local fake-media QA smoke test. It verifies WebM download,
MP4 conversion, H.264/AAC output, the webcam bubble being included in the final
recording, hidden webcam mode, reset plus second recording, importing a WebM and
converting the imported file, responsive layout, bad conversion failure and a
permission-denied cleanup path.

Manual QA checklist:

```txt
docs/MANUAL-QA-CHECKLIST.md
```

QA report:

```txt
docs/QA-REPORT.md
```
