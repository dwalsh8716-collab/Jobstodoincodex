import type { RefObject } from "react";
import type { RecorderStatus } from "../hooks/useScreenRecorder";
import type { BubblePosition, BubbleSize } from "../utils/media";
import { WebcamBubble } from "./WebcamBubble";

type VideoPreviewProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  screenVideoRef: RefObject<HTMLVideoElement | null>;
  webcamVideoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  status: RecorderStatus;
  countdown: number | null;
  timerSeconds: number;
  webmUrl: string | null;
  showRecordedPreview: boolean;
  showWebcam: boolean;
  bubblePosition: BubblePosition;
  bubbleSize: BubbleSize;
  onBubblePositionChange: (position: BubblePosition) => void;
};

function formatTimer(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function VideoPreview({
  canvasRef,
  screenVideoRef,
  webcamVideoRef,
  containerRef,
  status,
  countdown,
  timerSeconds,
  webmUrl,
  showRecordedPreview,
  showWebcam,
  bubblePosition,
  bubbleSize,
  onBubblePositionChange,
}: VideoPreviewProps) {
  const isLive =
    status === "requesting" ||
    status === "countdown" ||
    status === "recording" ||
    status === "paused";

  return (
    <section className="stage-shell">
      <div className="stage-topline">
        <div className={`recording-dot ${status === "recording" ? "is-live" : ""}`}>
          <span />
          {status === "recording"
            ? "Recording"
            : status === "paused"
              ? "Paused"
              : status === "countdown"
                ? "Starting"
                : "Ready"}
        </div>
        <time>{formatTimer(timerSeconds)}</time>
      </div>

      <div className="stage" ref={containerRef}>
        {showRecordedPreview && webmUrl ? (
          <video className="recorded-preview" src={webmUrl} controls playsInline />
        ) : (
          <>
            <canvas ref={canvasRef} className="stage-canvas" />
            {!isLive && (
              <div className="stage-empty">
                <strong>Essential Resourcing Video Outreach</strong>
                <span>Local screen, camera and microphone recording.</span>
              </div>
            )}
            {countdown && <div className="countdown">{countdown}</div>}
            <WebcamBubble
              containerRef={containerRef}
              position={bubblePosition}
              size={bubbleSize}
              visible={showWebcam && isLive}
              onPositionChange={onBubblePositionChange}
            />
          </>
        )}
      </div>

      <video ref={screenVideoRef} className="hidden-media" playsInline muted />
      <video ref={webcamVideoRef} className="hidden-media" playsInline muted />
    </section>
  );
}
