import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  explainMediaError,
  getBrowserSupport,
  getPreferredMimeType,
} from "../utils/browserSupport";
import {
  BUBBLE_SIZE_PERCENT,
  drawRoundedVideo,
  drawVideoContain,
  stopStream,
  type BubblePosition,
  type BubbleSize,
} from "../utils/media";

type RecorderStatus =
  | "idle"
  | "requesting"
  | "countdown"
  | "recording"
  | "paused"
  | "stopped"
  | "error";

type RecorderSettings = {
  showWebcam: boolean;
  bubbleSize: BubbleSize;
  bubblePosition: BubblePosition;
  includeSystemAudio: boolean;
};

type StartDisplayOptions = DisplayMediaStreamOptions & {
  systemAudio?: "include" | "exclude";
  surfaceSwitching?: "include" | "exclude";
  selfBrowserSurface?: "include" | "exclude";
};

const FRAME_RATE = 30;
const MAX_CANVAS_WIDTH = 1920;

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function makeRecorder(stream: MediaStream): MediaRecorder {
  const mimeType = getPreferredMimeType();
  return new MediaRecorder(
    stream,
    mimeType
      ? {
          mimeType,
        }
      : undefined,
  );
}

function getCanvasSize(screenVideo: HTMLVideoElement, screenTrack: MediaStreamTrack) {
  const settings = screenTrack.getSettings();
  const sourceWidth = settings.width || screenVideo.videoWidth || 1280;
  const sourceHeight = settings.height || screenVideo.videoHeight || 720;
  const scale = sourceWidth > MAX_CANVAS_WIDTH ? MAX_CANVAS_WIDTH / sourceWidth : 1;

  return {
    width: Math.round(sourceWidth * scale),
    height: Math.round(sourceHeight * scale),
  };
}

export function useScreenRecorder(settings: RecorderSettings) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const webcamVideoRef = useRef<HTMLVideoElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);
  const composedStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const settingsRef = useRef(settings);
  const statusRef = useRef<RecorderStatus>("idle");
  const sessionIdRef = useRef(0);
  const webmUrlRef = useRef<string | null>(null);

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [webmBlob, setWebmBlob] = useState<Blob | null>(null);
  const [webmUrl, setWebmUrl] = useState<string | null>(null);

  const support = useMemo(() => getBrowserSupport(), []);

  useEffect(() => {
    settingsRef.current = settings;
  }, [settings]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const setSafeStatus = useCallback((nextStatus: RecorderStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = window.setInterval(() => {
      setTimerSeconds((seconds) => seconds + 1);
    }, 1000);
  }, [clearTimer]);

  const clearAnimation = useCallback(() => {
    if (animationFrameRef.current !== null) {
      window.cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  const clearPreviewElements = useCallback(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = null;
    }
    if (webcamVideoRef.current) {
      webcamVideoRef.current.srcObject = null;
    }
  }, []);

  const cleanupLiveCapture = useCallback(() => {
    clearAnimation();
    clearTimer();
    stopStream(composedStreamRef.current);
    stopStream(screenStreamRef.current);
    stopStream(userStreamRef.current);
    composedStreamRef.current = null;
    screenStreamRef.current = null;
    userStreamRef.current = null;
    clearPreviewElements();

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      void audioContextRef.current.close();
    }
    audioContextRef.current = null;
  }, [clearAnimation, clearPreviewElements, clearTimer]);

  const clearRecordingUrls = useCallback(() => {
    if (webmUrlRef.current) URL.revokeObjectURL(webmUrlRef.current);
    webmUrlRef.current = null;
    setWebmUrl(null);
    setWebmBlob(null);
  }, []);

  const drawFrame = useCallback(() => {
    const canvas = canvasRef.current;
    const screenVideo = screenVideoRef.current;
    if (!canvas || !screenVideo) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (screenVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      drawVideoContain(ctx, screenVideo, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = "#121212";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const webcamVideo = webcamVideoRef.current;
    const currentSettings = settingsRef.current;
    const shouldDrawWebcam =
      currentSettings.showWebcam &&
      webcamVideo &&
      webcamVideo.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;

    if (shouldDrawWebcam && webcamVideo) {
      const bubbleWidth = canvas.width * BUBBLE_SIZE_PERCENT[currentSettings.bubbleSize];
      const bubbleHeight = bubbleWidth * (9 / 16);
      const x = canvas.width * currentSettings.bubblePosition.x;
      const y = canvas.height * currentSettings.bubblePosition.y;
      drawRoundedVideo(
        ctx,
        webcamVideo,
        x,
        y,
        bubbleWidth,
        bubbleHeight,
        Math.max(18, bubbleWidth * 0.12),
      );
    }

    animationFrameRef.current = window.requestAnimationFrame(drawFrame);
  }, []);

  const mixAudio = useCallback(
    async (userStream: MediaStream, screenStream: MediaStream): Promise<MediaStream> => {
      const micTracks = userStream.getAudioTracks();
      const systemTracks = settingsRef.current.includeSystemAudio
        ? screenStream.getAudioTracks()
        : [];
      const tracks = [...micTracks, ...systemTracks];

      if (tracks.length === 0) return new MediaStream();

      const AudioContextCtor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;

      if (!AudioContextCtor) {
        return new MediaStream(tracks);
      }

      const audioContext = new AudioContextCtor();
      audioContextRef.current = audioContext;
      const destination = audioContext.createMediaStreamDestination();

      if (micTracks.length) {
        audioContext
          .createMediaStreamSource(new MediaStream(micTracks))
          .connect(destination);
      }

      if (systemTracks.length) {
        audioContext
          .createMediaStreamSource(new MediaStream(systemTracks))
          .connect(destination);
      }

      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }

      return destination.stream;
    },
    [],
  );

  const finishRecording = useCallback(() => {
    clearTimer();
    const mimeType = recorderRef.current?.mimeType || "video/webm";
    const blob = new Blob(chunksRef.current, { type: mimeType });
    chunksRef.current = [];
    cleanupLiveCapture();

    if (!blob.size) {
      setError("Recording stopped before any video data was captured.");
      setSafeStatus("error");
      return;
    }

    setWebmBlob(blob);
    const url = URL.createObjectURL(blob);
    setWebmUrl((oldUrl) => {
      if (oldUrl) URL.revokeObjectURL(oldUrl);
      webmUrlRef.current = url;
      return url;
    });
    setSafeStatus("stopped");
  }, [cleanupLiveCapture, clearTimer, setSafeStatus]);

  const stopRecording = useCallback(() => {
    setCountdown(null);
    clearTimer();
    const recorder = recorderRef.current;

    if (statusRef.current === "countdown") {
      sessionIdRef.current += 1;
      setSafeStatus("idle");
      cleanupLiveCapture();
      chunksRef.current = [];
      return;
    }

    if (recorder && recorder.state !== "inactive") {
      try {
        setSafeStatus("stopped");
        recorder.stop();
      } catch {
        cleanupLiveCapture();
        setSafeStatus("stopped");
      }
      return;
    }

    cleanupLiveCapture();
  }, [cleanupLiveCapture, clearTimer, setSafeStatus]);

  const startRecording = useCallback(async () => {
    if (!support.supported) {
      setError(support.issues.join(" "));
      setSafeStatus("error");
      return;
    }

    sessionIdRef.current += 1;
    const sessionId = sessionIdRef.current;
    clearRecordingUrls();
    cleanupLiveCapture();
    chunksRef.current = [];
    setError(null);
    setNotice(null);
    setTimerSeconds(0);
    setSafeStatus("requesting");

    try {
      const displayOptions: StartDisplayOptions = {
        video: {
          frameRate: { ideal: FRAME_RATE, max: FRAME_RATE },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: settingsRef.current.includeSystemAudio
          ? {
              echoCancellation: false,
              noiseSuppression: false,
              autoGainControl: false,
            }
          : false,
        systemAudio: settingsRef.current.includeSystemAudio ? "include" : "exclude",
        surfaceSwitching: "include",
        selfBrowserSurface: "exclude",
      };

      const screenStream =
        await navigator.mediaDevices.getDisplayMedia(displayOptions);
      screenStreamRef.current = screenStream;
      const userStream = await navigator.mediaDevices.getUserMedia({
        video: settingsRef.current.showWebcam
          ? {
              width: { ideal: 960 },
              height: { ideal: 540 },
              facingMode: "user",
            }
          : false,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      userStreamRef.current = userStream;

      if (sessionId !== sessionIdRef.current) {
        stopStream(screenStream);
        stopStream(userStream);
        return;
      }

      const screenVideo = screenVideoRef.current;
      const webcamVideo = webcamVideoRef.current;
      const canvas = canvasRef.current;
      const screenTrack = screenStream.getVideoTracks()[0];

      if (!screenVideo || !canvas || !screenTrack) {
        throw new Error("The recording preview could not be prepared.");
      }

      screenVideo.srcObject = screenStream;
      screenVideo.muted = true;
      await screenVideo.play();

      if (settingsRef.current.showWebcam && webcamVideo) {
        webcamVideo.srcObject = userStream;
        webcamVideo.muted = true;
        await webcamVideo.play();
      }

      const canvasSize = getCanvasSize(screenVideo, screenTrack);
      canvas.width = canvasSize.width;
      canvas.height = canvasSize.height;
      clearAnimation();
      drawFrame();

      const audioStream = await mixAudio(userStream, screenStream);
      const canvasStream = canvas.captureStream(FRAME_RATE);
      const composedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...audioStream.getAudioTracks(),
      ]);
      composedStreamRef.current = composedStream;

      const recorder = makeRecorder(composedStream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onerror = () => {
        setError("Recording stopped unexpectedly.");
        setSafeStatus("error");
        cleanupLiveCapture();
      };
      recorder.onstop = finishRecording;

      screenTrack.addEventListener(
        "ended",
        () => {
          if (
            statusRef.current === "recording" ||
            statusRef.current === "paused" ||
            statusRef.current === "countdown"
          ) {
            setNotice("Screen capture stopped unexpectedly.");
            stopRecording();
          }
        },
        { once: true },
      );

      setSafeStatus("countdown");
      for (const value of [3, 2, 1]) {
        if (sessionId !== sessionIdRef.current || !screenStream.active) return;
        setCountdown(value);
        await delay(1000);
      }

      if (sessionId !== sessionIdRef.current || !screenStream.active) return;
      setCountdown(null);
      recorder.start(1000);
      setSafeStatus("recording");
      startTimer();
    } catch (caughtError) {
      cleanupLiveCapture();
      setCountdown(null);
      setError(explainMediaError(caughtError));
      setSafeStatus("error");
    }
  }, [
    cleanupLiveCapture,
    clearAnimation,
    clearRecordingUrls,
    drawFrame,
    finishRecording,
    mixAudio,
    setSafeStatus,
    startTimer,
    stopRecording,
    support.issues,
    support.supported,
  ]);

  const pauseRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "recording") return;

    recorder.pause();
    clearTimer();
    setSafeStatus("paused");
  }, [clearTimer, setSafeStatus]);

  const resumeRecording = useCallback(() => {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state !== "paused") return;

    recorder.resume();
    setSafeStatus("recording");
    startTimer();
  }, [setSafeStatus, startTimer]);

  const resetRecording = useCallback(() => {
    sessionIdRef.current += 1;
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = null;
      try {
        recorder.stop();
      } catch {
        // Ignore reset-only recorder shutdown errors.
      }
    }
    recorderRef.current = null;
    chunksRef.current = [];
    cleanupLiveCapture();
    clearRecordingUrls();
    setCountdown(null);
    setTimerSeconds(0);
    setError(null);
    setNotice(null);
    setSafeStatus("idle");
  }, [cleanupLiveCapture, clearRecordingUrls, setSafeStatus]);

  useEffect(() => {
    return () => {
      sessionIdRef.current += 1;
      cleanupLiveCapture();
      if (webmUrlRef.current) {
        URL.revokeObjectURL(webmUrlRef.current);
        webmUrlRef.current = null;
      }
    };
  }, [cleanupLiveCapture]);

  return {
    canvasRef,
    screenVideoRef,
    webcamVideoRef,
    status,
    error,
    notice,
    countdown,
    timerSeconds,
    webmBlob,
    webmUrl,
    support,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    resetRecording,
  };
}

export type { RecorderStatus, RecorderSettings };
