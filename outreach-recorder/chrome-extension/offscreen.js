const tabVideo = document.querySelector("#tabVideo");
const webcamVideo = document.querySelector("#webcamVideo");
const canvas = document.querySelector("#recordingCanvas");
const context = canvas.getContext("2d", { alpha: false });

const STATE = {
  idle: "idle",
  preparing: "preparing",
  countdown: "countdown",
  recording: "recording",
  stopping: "stopping"
};

let state = STATE.idle;
let tabStream = null;
let webcamStream = null;
let micStream = null;
let mixedAudioContext = null;
let mixedAudioDestination = null;
let mediaRecorder = null;
let chunks = [];
let animationFrame = null;
let overlayPosition = null;
let activeSettings = null;
let activeMetadata = null;
let downloadUrlToRevoke = null;

const sendMessage = (message) =>
  chrome.runtime.sendMessage(message).catch(() => {});

const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

const sanitizePart = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

const buildFilename = (settings = {}) => {
  const parts = [
    sanitizePart(settings.prospectName),
    sanitizePart(settings.companyName),
    "david-walsh-essential-resourcing-video"
  ].filter(Boolean);

  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const stamp = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes())
  ].join("-");

  return `${parts.join("-") || "essential-resourcing-video"}-${stamp}.webm`;
};

const chooseMimeType = () => {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=opus",
    "video/webm"
  ];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) || "";
};

const stopStream = (stream) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const reset = async () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame);
  }
  animationFrame = null;

  stopStream(tabStream);
  stopStream(webcamStream);
  stopStream(micStream);
  tabStream = null;
  webcamStream = null;
  micStream = null;

  if (mixedAudioContext && mixedAudioContext.state !== "closed") {
    await mixedAudioContext.close().catch(() => {});
  }
  mixedAudioContext = null;
  mixedAudioDestination = null;

  tabVideo.srcObject = null;
  webcamVideo.srcObject = null;
  mediaRecorder = null;
  chunks = [];
  overlayPosition = null;
  activeSettings = null;
  activeMetadata = null;
  state = STATE.idle;
};

const waitForMetadata = async (video) => {
  if (video.videoWidth && video.videoHeight) {
    return;
  }

  await new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("Video metadata did not load.")), 8000);
    video.addEventListener(
      "loadedmetadata",
      () => {
        window.clearTimeout(timeout);
        resolve();
      },
      { once: true }
    );
  });
};

const getTabStream = async (streamId, includeTabAudio) => {
  const videoConstraints = {
    mandatory: {
      chromeMediaSource: "tab",
      chromeMediaSourceId: streamId,
      maxFrameRate: 30
    }
  };

  const audioConstraints = includeTabAudio
    ? {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId
        }
      }
    : false;

  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: audioConstraints,
      video: videoConstraints
    });
  } catch (error) {
    if (!includeTabAudio) {
      throw error;
    }

    await sendMessage({
      type: "offscreen:status",
      message: "Tab audio was not available, so the video will continue without it."
    });

    return navigator.mediaDevices.getUserMedia({
      audio: false,
      video: videoConstraints
    });
  }
};

const getWebcamStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user"
      }
    });
  } catch {
    await sendMessage({
      type: "offscreen:status",
      message: "Camera was not available, so the recording will continue without the webcam bubble."
    });
    return null;
  }
};

const getMicStream = async () => {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      },
      video: false
    });
  } catch {
    await sendMessage({
      type: "offscreen:status",
      message: "Microphone was not available, so the recording will continue without mic audio."
    });
    return null;
  }
};

const createMixedAudio = async (settings) => {
  const audioTracks = [];
  const tabAudioTracks = tabStream?.getAudioTracks() || [];
  const micAudioTracks = micStream?.getAudioTracks() || [];

  if (!tabAudioTracks.length && !micAudioTracks.length) {
    return audioTracks;
  }

  mixedAudioContext = new AudioContext();
  mixedAudioDestination = mixedAudioContext.createMediaStreamDestination();

  if (tabAudioTracks.length) {
    const tabSource = mixedAudioContext.createMediaStreamSource(new MediaStream(tabAudioTracks));
    tabSource.connect(mixedAudioDestination);

    if (settings.includeTabAudio) {
      tabSource.connect(mixedAudioContext.destination);
    }
  }

  if (micAudioTracks.length) {
    const micSource = mixedAudioContext.createMediaStreamSource(new MediaStream(micAudioTracks));
    micSource.connect(mixedAudioDestination);
  }

  if (mixedAudioContext.state === "suspended") {
    await mixedAudioContext.resume().catch(() => {});
  }

  return mixedAudioDestination.stream.getAudioTracks();
};

const roundedImage = (video, x, y, width, height, radius) => {
  context.save();
  context.beginPath();
  context.moveTo(x + radius, y);
  context.arcTo(x + width, y, x + width, y + height, radius);
  context.arcTo(x + width, y + height, x, y + height, radius);
  context.arcTo(x, y + height, x, y, radius);
  context.arcTo(x, y, x + width, y, radius);
  context.closePath();
  context.clip();

  const sourceRatio = video.videoWidth / video.videoHeight;
  const targetRatio = width / height;
  let sourceWidth = video.videoWidth;
  let sourceHeight = video.videoHeight;
  let sourceX = 0;
  let sourceY = 0;

  if (sourceRatio > targetRatio) {
    sourceWidth = video.videoHeight * targetRatio;
    sourceX = (video.videoWidth - sourceWidth) / 2;
  } else {
    sourceHeight = video.videoWidth / targetRatio;
    sourceY = (video.videoHeight - sourceHeight) / 2;
  }

  context.drawImage(video, sourceX, sourceY, sourceWidth, sourceHeight, x, y, width, height);
  context.restore();
};

const drawFrame = () => {
  if (!tabVideo.videoWidth || !tabVideo.videoHeight) {
    animationFrame = requestAnimationFrame(drawFrame);
    return;
  }

  context.fillStyle = "#151312";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(tabVideo, 0, 0, canvas.width, canvas.height);

  if (
    activeSettings?.showWebcam !== false &&
    webcamVideo.srcObject &&
    webcamVideo.videoWidth &&
    webcamVideo.videoHeight
  ) {
    const minSide = Math.min(canvas.width, canvas.height);
    const defaultSizeMap = {
      small: 0.18,
      medium: 0.23,
      large: 0.3
    };
    const defaultSize = defaultSizeMap[activeSettings?.bubbleSize] || defaultSizeMap.medium;
    const size = Math.round((overlayPosition?.size || defaultSize) * minSide);
    const margin = Math.round(minSide * 0.035);
    const x = overlayPosition
      ? Math.round(overlayPosition.x * canvas.width)
      : canvas.width - size - margin;
    const y = overlayPosition
      ? Math.round(overlayPosition.y * canvas.height)
      : canvas.height - size - margin;
    const safeX = Math.min(Math.max(margin, x), canvas.width - size - margin);
    const safeY = Math.min(Math.max(margin, y), canvas.height - size - margin);

    context.save();
    context.shadowColor = "rgba(0, 0, 0, 0.34)";
    context.shadowBlur = Math.round(size * 0.14);
    context.shadowOffsetY = Math.round(size * 0.04);
    context.fillStyle = "#151312";
    context.beginPath();
    context.arc(safeX + size / 2, safeY + size / 2, size / 2, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.translate(safeX + size, safeY);
    context.scale(-1, 1);
    roundedImage(webcamVideo, 0, 0, size, size, size / 2);
    context.restore();

    context.save();
    context.lineWidth = Math.max(4, Math.round(size * 0.028));
    context.strokeStyle = "rgba(255, 250, 242, 0.96)";
    context.beginPath();
    context.arc(safeX + size / 2, safeY + size / 2, size / 2 - context.lineWidth / 2, 0, Math.PI * 2);
    context.stroke();
    context.restore();
  }

  animationFrame = requestAnimationFrame(drawFrame);
};

const runCountdown = async () => {
  state = STATE.countdown;
  for (const count of [3, 2, 1]) {
    await sendMessage({ type: "offscreen:countdown", count });
    await sleep(1000);
  }
};

const startRecording = async ({ streamId, tabId, tabTitle, settings }) => {
  if (state !== STATE.idle) {
    throw new Error("The recorder is already busy.");
  }

  activeSettings = settings || {};
  activeMetadata = { tabId, tabTitle };
  state = STATE.preparing;

  try {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      throw new Error("This Chrome version does not support the required recording APIs.");
    }

    await sendMessage({ type: "offscreen:status", message: "Getting tab, camera and microphone ready..." });

    tabStream = await getTabStream(streamId, activeSettings.includeTabAudio);
    if (activeSettings.showWebcam !== false) {
      webcamStream = await getWebcamStream();
    }
    if (activeSettings.includeMic !== false) {
      micStream = await getMicStream();
    }

    tabVideo.srcObject = tabStream;
    if (webcamStream) {
      webcamVideo.srcObject = webcamStream;
    }

    await tabVideo.play();
    await waitForMetadata(tabVideo);
    if (webcamStream) {
      await webcamVideo.play().catch(() => {});
      await waitForMetadata(webcamVideo).catch(() => {});
    }

    canvas.width = tabVideo.videoWidth || 1280;
    canvas.height = tabVideo.videoHeight || 720;
    drawFrame();

    await runCountdown();

    const canvasStream = canvas.captureStream(30);
    const audioTracks = await createMixedAudio(activeSettings);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks
    ]);

    const mimeType = chooseMimeType();
    chunks = [];
    mediaRecorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : undefined);

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) {
        chunks.push(event.data);
      }
    });

    mediaRecorder.addEventListener("stop", async () => {
      const blob = new Blob(chunks, { type: mediaRecorder.mimeType || "video/webm" });
      const url = URL.createObjectURL(blob);
      downloadUrlToRevoke = url;

      await sendMessage({
        type: "offscreen:download-ready",
        url,
        filename: buildFilename(activeSettings),
        size: blob.size,
        tabTitle: activeMetadata?.tabTitle
      });
    });

    for (const track of tabStream.getTracks()) {
      track.addEventListener("ended", () => {
        if (state === STATE.recording) {
          stopRecording();
        }
      });
    }

    mediaRecorder.start(1000);
    state = STATE.recording;
    await sendMessage({ type: "offscreen:recording-started" });
  } catch (error) {
    await sendMessage({
      type: "offscreen:error",
      error: error.message || "Recording could not start."
    });
    await reset();
  }
};

const stopRecording = async () => {
  if (state === STATE.idle || state === STATE.stopping) {
    return;
  }

  state = STATE.stopping;

  if (mediaRecorder && mediaRecorder.state !== "inactive") {
    mediaRecorder.stop();
    return;
  }

  await reset();
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const run = async () => {
    switch (message?.type) {
      case "offscreen:start-recording":
        await startRecording(message);
        return { ok: true };

      case "offscreen:stop-recording":
        await stopRecording();
        return { ok: true };

      case "offscreen:update-overlay-position":
        overlayPosition = message.position;
        return { ok: true };

      case "offscreen:download-started":
        if (downloadUrlToRevoke === message.url) {
          window.setTimeout(() => URL.revokeObjectURL(downloadUrlToRevoke), 15000);
          downloadUrlToRevoke = null;
        }
        await reset();
        return { ok: true };

      default:
        return { ok: false, error: "Unknown offscreen message." };
    }
  };

  run()
    .then((response) => sendResponse(response))
    .catch(async (error) => {
      await sendMessage({
        type: "offscreen:error",
        error: error.message || "Recorder failed."
      });
      await reset();
      sendResponse({ ok: false, error: error.message || "Recorder failed." });
    });

  return true;
});
