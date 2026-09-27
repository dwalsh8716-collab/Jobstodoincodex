import {
  Eye,
  Pause,
  Play,
  RotateCcw,
  Square,
  Video,
} from "lucide-react";
import type { RecorderStatus } from "../hooks/useScreenRecorder";

type RecorderControlsProps = {
  status: RecorderStatus;
  hasRecording: boolean;
  supported: boolean;
  startBlockedReason?: string;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onPreview: () => void;
  onReset: () => void;
};

export function RecorderControls({
  status,
  hasRecording,
  supported,
  startBlockedReason,
  onStart,
  onPause,
  onResume,
  onStop,
  onPreview,
  onReset,
}: RecorderControlsProps) {
  const busy = status === "requesting" || status === "countdown";
  const canRecord =
    supported &&
    !startBlockedReason &&
    status !== "recording" &&
    status !== "paused" &&
    !busy;
  const canPause = status === "recording";
  const canResume = status === "paused";
  const canStop =
    status === "recording" || status === "paused" || status === "countdown";

  return (
    <section className="controls" aria-label="Recording controls">
      <button className="primary-action" onClick={onStart} disabled={!canRecord}>
        <Video size={18} aria-hidden="true" />
        Start recording
      </button>
      <button onClick={onPause} disabled={!canPause}>
        <Pause size={18} aria-hidden="true" />
        Pause
      </button>
      <button onClick={onResume} disabled={!canResume}>
        <Play size={18} aria-hidden="true" />
        Resume
      </button>
      <button onClick={onStop} disabled={!canStop} title="Stop recording (Esc)">
        <Square size={18} aria-hidden="true" />
        Stop
      </button>
      <button onClick={onPreview} disabled={!hasRecording}>
        <Eye size={18} aria-hidden="true" />
        Preview recording
      </button>
      <button onClick={onReset} disabled={status === "requesting"}>
        <RotateCcw size={18} aria-hidden="true" />
        Reset
      </button>
      {startBlockedReason && <p className="control-note">{startBlockedReason}</p>}
    </section>
  );
}
