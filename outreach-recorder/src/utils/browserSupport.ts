export type BrowserSupportResult = {
  supported: boolean;
  issues: string[];
};

export function getBrowserSupport(): BrowserSupportResult {
  const issues: string[] = [];

  if (!window.isSecureContext) {
    issues.push("Use localhost or HTTPS so the browser can allow recording.");
  }

  if (!navigator.mediaDevices?.getDisplayMedia) {
    issues.push("Screen capture is not supported in this browser.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    issues.push("Camera and microphone capture are not supported here.");
  }

  if (!window.MediaRecorder) {
    issues.push("MediaRecorder is not available in this browser.");
  }

  if (!HTMLCanvasElement.prototype.captureStream) {
    issues.push("Canvas recording is not supported in this browser.");
  }

  return {
    supported: issues.length === 0,
    issues,
  };
}

export function getPreferredMimeType(): string {
  const candidates = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm;codecs=h264,opus",
    "video/webm",
  ];

  return (
    candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate)) ||
    ""
  );
}

export function explainMediaError(error: unknown): string {
  if (!(error instanceof DOMException)) {
    return error instanceof Error
      ? error.message
      : "Something stopped the recording setup.";
  }

  if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
    return "Permission was denied. Allow screen, camera and microphone access, then try again.";
  }

  if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
    return "No camera or microphone was found. Check the device is connected and not blocked.";
  }

  if (error.name === "NotReadableError" || error.name === "TrackStartError") {
    return "The camera, microphone or screen could not be read. Another app may already be using it.";
  }

  if (error.name === "OverconstrainedError") {
    return "The browser could not satisfy the requested camera or screen settings.";
  }

  if (error.name === "AbortError") {
    return "Recording setup was cancelled before it could start.";
  }

  return error.message || "The browser could not start recording.";
}
