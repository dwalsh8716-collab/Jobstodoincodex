# Manual QA Checklist

Use Chrome or Edge first.

Open:

```txt
http://127.0.0.1:5174/
```

## A. Happy Path

- [ ] App opens without an error.
- [ ] Privacy warning is visible before recording.
- [ ] Start recording is disabled until prospect name is entered.
- [ ] Enter prospect name.
- [ ] Enter company name.
- [ ] Enter role/title.
- [ ] Add notes or a short script.
- [ ] Press Start recording.
- [ ] Choose a browser tab, window or screen.
- [ ] Allow camera and microphone.
- [ ] Wait for 3, 2, 1 countdown.
- [ ] Speak for 10 seconds.
- [ ] Stop recording.
- [ ] Preview appears.
- [ ] Preview plays.
- [ ] Download WebM backup.
- [ ] Convert to MP4.
- [ ] Download MP4.
- [ ] Open the downloaded MP4 in QuickTime, VLC or another normal player.

## A2. Import WebM From Extension

- [ ] Record a short video with the Chrome extension.
- [ ] Confirm Chrome downloads a WebM.
- [ ] Open the local app at `http://127.0.0.1:5174/`.
- [ ] In the Export panel, click Import WebM.
- [ ] Choose the extension WebM.
- [ ] Confirm the preview loads.
- [ ] Click Convert to MP4.
- [ ] Download MP4.
- [ ] Open the MP4 in QuickTime, VLC or another normal player.
- [ ] Generate a branded landing page using the imported video if needed.

## B. Webcam Bubble

- [ ] Webcam bubble appears by default.
- [ ] Bubble starts near the bottom-right.
- [ ] Drag the bubble to a different position.
- [ ] Set bubble size to small.
- [ ] Set bubble size to medium.
- [ ] Set bubble size to large.
- [ ] Turn webcam bubble off.
- [ ] Record with webcam bubble off.
- [ ] Record again with webcam bubble on.
- [ ] Confirm the final video includes the webcam bubble when enabled.
- [ ] Confirm the final video does not include the webcam bubble when hidden.

## C. Audio

- [ ] Record microphone only.
- [ ] Play preview and confirm voice is audible.
- [ ] Download WebM and confirm voice is audible.
- [ ] Convert/download MP4 and confirm voice is audible.
- [ ] Try system audio only if needed.
- [ ] If using tab audio, choose a browser tab and enable the browser's audio
  sharing option if shown.
- [ ] Confirm playback volume is acceptable.

## D. Error Handling

- [ ] Deny screen capture and confirm the app shows a clear error.
- [ ] Deny camera/microphone and confirm the app shows a clear error.
- [ ] Stop screen sharing using the browser's sharing control and confirm the
  app recovers.
- [ ] Record twice in a row.
- [ ] Refresh midway through a recording and confirm the browser stops sharing.
- [ ] Try with webcam disabled in the UI.
- [ ] Try with the camera unavailable if practical.

## E. File Handling

- [ ] Filename includes prospect name.
- [ ] Filename includes company name when entered.
- [ ] Filename includes `david-walsh-essential-resourcing-video`.
- [ ] Filename includes date/time.
- [ ] Special characters such as `&`, `/`, apostrophes and commas do not break
  the filename.
- [ ] WebM opens in a normal player.
- [ ] MP4 opens in a normal player.
- [ ] MP4 file extension is `.mp4`.
- [ ] Record a 2 to 3 minute video and confirm conversion still works.
- [ ] File size feels sensible for the length.

## F. Share Page

- [ ] Record a video.
- [ ] Convert to MP4.
- [ ] Add a short share-page message.
- [ ] Download branded landing page.
- [ ] Open the downloaded HTML file locally.
- [ ] Confirm the page is branded.
- [ ] Confirm the video plays.

## G. Local Activity

- [ ] Save local activity note after recording.
- [ ] Confirm the count updates.
- [ ] Clear local activity notes.
- [ ] Confirm no viewer or recipient analytics are shown.

## H. Privacy

- [ ] Close private messages and unrelated tabs before recording.
- [ ] Turn off notifications.
- [ ] Avoid candidate data and confidential client material.
- [ ] Confirm the app does not ask for login.
- [ ] Confirm no cloud upload is part of the workflow.
- [ ] Confirm no LinkedIn scraping is part of the workflow.
- [ ] Delete videos you no longer need.

## I. Chrome Extension Prototype

Use this only for the workflow where the bubble/countdown should appear on the
selected page itself.

- [ ] Open `chrome://extensions`.
- [ ] Turn on Developer mode.
- [ ] Click Load unpacked.
- [ ] Select `/Users/walsh/Jobstodoincodex/outreach-recorder/chrome-extension`.
- [ ] Pin **Essential Resourcing Video Outreach** to the Chrome toolbar.
- [ ] Open a normal website tab first.
- [ ] Click the extension icon.
- [ ] Confirm the prospect name is suggested from the tab title.
- [ ] Correct the prospect/company details if needed.
- [ ] Confirm Start is blocked if prospect name is empty.
- [ ] Keep webcam and microphone enabled.
- [ ] Click Start on this tab.
- [ ] Confirm countdown appears on the website tab.
- [ ] Confirm webcam bubble appears on the website tab.
- [ ] Drag the webcam bubble.
- [ ] Speak for 10 seconds.
- [ ] Click Stop in the on-page overlay.
- [ ] Confirm Chrome downloads a WebM file.
- [ ] Open the WebM locally and confirm it includes tab, webcam bubble and voice.
- [ ] Open the local app.
- [ ] Use Import WebM in the Export panel.
- [ ] Convert the imported WebM to MP4.
- [ ] Try a LinkedIn page only after the simple website test works.
