(() => {
  const ROOT_ID = "er-video-outreach-overlay-root";
  const DEFAULT_STATE = {
    recording: false,
    stopping: false,
    countdown: null,
    startedAt: null,
    error: ""
  };

  const state = {
    root: null,
    shadow: null,
    bubble: null,
    webcamPreview: null,
    countdown: null,
    recordingPill: null,
    timer: null,
    stopButton: null,
    message: null,
    previewStream: null,
    timerInterval: null,
    startedAt: null,
    drag: null,
    settings: {}
  };

  const styles = `
    :host {
      all: initial;
      color-scheme: light;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * {
      box-sizing: border-box;
    }

    .shell {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 2147483647;
    }

    .countdown {
      position: fixed;
      top: 50%;
      left: 50%;
      display: grid;
      width: 132px;
      height: 132px;
      place-items: center;
      transform: translate(-50%, -50%);
      border: 2px solid rgba(255, 255, 255, 0.9);
      border-radius: 999px;
      background: rgba(21, 19, 18, 0.82);
      color: #fffaf2;
      font-size: 64px;
      font-weight: 800;
      line-height: 1;
      box-shadow: 0 18px 60px rgba(0, 0, 0, 0.32);
    }

    .recording-pill {
      position: fixed;
      top: 18px;
      left: 50%;
      display: flex;
      gap: 10px;
      align-items: center;
      min-height: 42px;
      transform: translateX(-50%);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 999px;
      background: rgba(21, 19, 18, 0.86);
      color: #fffaf2;
      font-size: 13px;
      font-weight: 750;
      padding: 6px 8px 6px 14px;
      pointer-events: auto;
      box-shadow: 0 16px 44px rgba(0, 0, 0, 0.28);
    }

    .recording-dot {
      width: 10px;
      height: 10px;
      border-radius: 999px;
      background: #d83b30;
      box-shadow: 0 0 0 5px rgba(216, 59, 48, 0.22);
    }

    .stop-button {
      min-height: 30px;
      border: 0;
      border-radius: 999px;
      background: #fffaf2;
      color: #151312;
      cursor: pointer;
      font: inherit;
      font-size: 12px;
      font-weight: 800;
      padding: 0 12px;
    }

    .stop-button:disabled {
      cursor: wait;
      opacity: 0.72;
    }

    .webcam-bubble {
      position: fixed;
      right: 24px;
      bottom: 24px;
      overflow: hidden;
      border: 3px solid rgba(255, 250, 242, 0.96);
      border-radius: 999px;
      background: #151312;
      cursor: grab;
      pointer-events: auto;
      box-shadow: 0 18px 54px rgba(0, 0, 0, 0.34);
      user-select: none;
      touch-action: none;
    }

    .webcam-bubble:active {
      cursor: grabbing;
    }

    .webcam-bubble.size-small {
      width: 148px;
      height: 148px;
    }

    .webcam-bubble.size-medium {
      width: 190px;
      height: 190px;
    }

    .webcam-bubble.size-large {
      width: 242px;
      height: 242px;
    }

    .webcam-bubble[hidden] {
      display: none;
    }

    .webcam-preview {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transform: scaleX(-1);
    }

    .camera-fallback {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 18px;
      color: #fffaf2;
      font-size: 13px;
      font-weight: 750;
      line-height: 1.25;
      text-align: center;
    }

    .webcam-bubble.has-camera .camera-fallback {
      display: none;
    }

    .message {
      position: fixed;
      right: 20px;
      bottom: 20px;
      max-width: min(360px, calc(100vw - 40px));
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 8px;
      background: rgba(21, 19, 18, 0.88);
      color: #fffaf2;
      font-size: 13px;
      font-weight: 650;
      line-height: 1.35;
      padding: 11px 13px;
      pointer-events: none;
      box-shadow: 0 18px 54px rgba(0, 0, 0, 0.3);
    }

    [hidden] {
      display: none !important;
    }
  `;

  const sizeClass = (size) => {
    if (size === "small" || size === "large") {
      return `size-${size}`;
    }
    return "size-medium";
  };

  const formatTimer = (elapsedMs) => {
    const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const sendMessage = (message) =>
    chrome.runtime.sendMessage(message).catch(() => {});

  const showMessage = (text, timeout = 4200) => {
    if (!state.message) {
      return;
    }

    if (!text) {
      state.message.hidden = true;
      state.message.textContent = "";
      return;
    }

    state.message.textContent = text;
    state.message.hidden = false;

    if (timeout) {
      window.setTimeout(() => {
        if (state.message?.textContent === text) {
          state.message.hidden = true;
        }
      }, timeout);
    }
  };

  const publishPosition = () => {
    if (!state.bubble || state.bubble.hidden) {
      return;
    }

    const rect = state.bubble.getBoundingClientRect();
    const minViewport = Math.max(1, Math.min(window.innerWidth, window.innerHeight));
    sendMessage({
      type: "overlay-position",
      position: {
        x: rect.left / Math.max(1, window.innerWidth),
        y: rect.top / Math.max(1, window.innerHeight),
        size: rect.width / minViewport
      }
    });
  };

  const updateTimer = () => {
    if (!state.timer || !state.startedAt) {
      return;
    }
    state.timer.textContent = formatTimer(Date.now() - state.startedAt);
  };

  const placeDefaultBubble = () => {
    if (!state.bubble || state.bubble.hidden) {
      return;
    }

    const rect = state.bubble.getBoundingClientRect();
    state.bubble.style.left = `${Math.max(18, window.innerWidth - rect.width - 24)}px`;
    state.bubble.style.top = `${Math.max(18, window.innerHeight - rect.height - 24)}px`;
    state.bubble.style.right = "auto";
    state.bubble.style.bottom = "auto";
    publishPosition();
  };

  const startCameraPreview = async () => {
    if (!state.webcamPreview || state.previewStream || state.settings.showWebcam === false) {
      return;
    }

    try {
      state.previewStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 640 },
          facingMode: "user"
        },
        audio: false
      });
      state.webcamPreview.srcObject = state.previewStream;
      state.bubble?.classList.add("has-camera");
    } catch {
      showMessage("Camera preview is blocked here, but the recording engine will still try to use your webcam.");
    }
  };

  const stopCameraPreview = () => {
    state.previewStream?.getTracks().forEach((track) => track.stop());
    state.previewStream = null;
    if (state.webcamPreview) {
      state.webcamPreview.srcObject = null;
    }
    state.bubble?.classList.remove("has-camera");
  };

  const bindEvents = () => {
    state.stopButton?.addEventListener("click", () => {
      state.stopButton.disabled = true;
      sendMessage({ type: "overlay-stop" });
      showMessage("Stopping and saving the local recording...", 0);
    });

    state.bubble?.addEventListener("pointerdown", (event) => {
      if (state.bubble.hidden) {
        return;
      }

      const rect = state.bubble.getBoundingClientRect();
      state.drag = {
        pointerId: event.pointerId,
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top
      };
      state.bubble.setPointerCapture(event.pointerId);
    });

    state.bubble?.addEventListener("pointermove", (event) => {
      if (!state.drag || event.pointerId !== state.drag.pointerId) {
        return;
      }

      const rect = state.bubble.getBoundingClientRect();
      const nextLeft = Math.min(
        Math.max(12, event.clientX - state.drag.offsetX),
        window.innerWidth - rect.width - 12
      );
      const nextTop = Math.min(
        Math.max(12, event.clientY - state.drag.offsetY),
        window.innerHeight - rect.height - 12
      );

      state.bubble.style.left = `${nextLeft}px`;
      state.bubble.style.top = `${nextTop}px`;
      state.bubble.style.right = "auto";
      state.bubble.style.bottom = "auto";
      publishPosition();
    });

    state.bubble?.addEventListener("pointerup", (event) => {
      if (state.drag?.pointerId === event.pointerId) {
        state.bubble.releasePointerCapture(event.pointerId);
        state.drag = null;
        publishPosition();
      }
    });
  };

  const buildOverlay = () => {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      root.style.position = "fixed";
      root.style.inset = "0";
      root.style.zIndex = "2147483647";
      root.style.pointerEvents = "none";
      document.documentElement.appendChild(root);
    }

    state.root = root;
    state.shadow = root.shadowRoot || root.attachShadow({ mode: "open" });
    state.shadow.innerHTML = `
      <style>${styles}</style>
      <div class="shell" aria-live="polite">
        <div id="countdown" class="countdown" hidden>3</div>
        <section id="recordingPill" class="recording-pill" hidden>
          <span class="recording-dot"></span>
          <span id="timer">00:00</span>
          <button id="stopButton" class="stop-button" type="button" title="Stop recording">Stop</button>
        </section>
        <section id="bubble" class="webcam-bubble size-medium" aria-label="Webcam bubble">
          <video id="webcamPreview" class="webcam-preview" autoplay muted playsinline></video>
          <div class="camera-fallback">Camera preview</div>
        </section>
        <div id="message" class="message" hidden></div>
      </div>
    `;

    state.bubble = state.shadow.querySelector("#bubble");
    state.webcamPreview = state.shadow.querySelector("#webcamPreview");
    state.countdown = state.shadow.querySelector("#countdown");
    state.recordingPill = state.shadow.querySelector("#recordingPill");
    state.timer = state.shadow.querySelector("#timer");
    state.stopButton = state.shadow.querySelector("#stopButton");
    state.message = state.shadow.querySelector("#message");
    bindEvents();
  };

  const applySettings = (settings = {}) => {
    state.settings = settings;

    if (!state.bubble) {
      return;
    }

    state.bubble.classList.remove("size-small", "size-medium", "size-large");
    state.bubble.classList.add(sizeClass(settings.bubbleSize));
    state.bubble.hidden = settings.showWebcam === false;

    if (settings.showWebcam === false) {
      stopCameraPreview();
    } else {
      startCameraPreview();
      window.requestAnimationFrame(placeDefaultBubble);
    }
  };

  const applyOverlayState = (nextState = DEFAULT_STATE) => {
    if (nextState.error) {
      showMessage(nextState.error, 0);
    }

    if (nextState.countdown && state.countdown && state.recordingPill) {
      state.countdown.textContent = String(nextState.countdown);
      state.countdown.hidden = false;
      state.recordingPill.hidden = true;
    } else if (state.countdown) {
      state.countdown.hidden = true;
    }

    if (nextState.recording && state.recordingPill) {
      state.startedAt = nextState.startedAt || Date.now();
      updateTimer();
      state.recordingPill.hidden = false;
      if (!state.timerInterval) {
        state.timerInterval = window.setInterval(updateTimer, 1000);
      }
    }

    if (nextState.stopping && state.stopButton) {
      state.stopButton.disabled = true;
      showMessage("Stopping and saving the local recording...", 0);
    }
  };

  const ensureOverlay = (settings = {}) => {
    buildOverlay();
    applySettings(settings);
  };

  const removeOverlay = () => {
    if (state.timerInterval) {
      window.clearInterval(state.timerInterval);
    }
    state.timerInterval = null;
    stopCameraPreview();
    state.root?.remove();
    state.root = null;
  };

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "content:init-overlay") {
      ensureOverlay(message.settings);
    }

    if (message?.type === "content:overlay-state") {
      applyOverlayState(message.state);
    }

    if (message?.type === "content:remove-overlay") {
      removeOverlay();
    }
  });

  window.addEventListener("resize", publishPosition);
})();
