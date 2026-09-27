import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Camera, MonitorUp, ShieldCheck, Volume2 } from "lucide-react";
import { ConversionPanel } from "./components/ConversionPanel";
import { LocalActivityLog } from "./components/LocalActivityLog";
import { ProspectDetails } from "./components/ProspectDetails";
import { RecorderControls } from "./components/RecorderControls";
import { ScriptNotes } from "./components/ScriptNotes";
import { SharePagePanel } from "./components/SharePagePanel";
import { TemplateLibrary } from "./components/TemplateLibrary";
import { VideoPreview } from "./components/VideoPreview";
import { useScreenRecorder } from "./hooks/useScreenRecorder";
import {
  baseNameFromFileName,
  buildBaseFileName,
  type FileNameDetails,
} from "./utils/filename";
import {
  BUBBLE_SIZE_PERCENT,
  clamp,
  type BubblePosition,
  type BubbleSize,
} from "./utils/media";

const DEFAULT_DETAILS: FileNameDetails = {
  prospectName: "",
  companyName: "",
  roleTitle: "",
};

function defaultBubblePosition(size: BubbleSize): BubblePosition {
  const width = BUBBLE_SIZE_PERCENT[size];
  const height = width * (9 / 16);
  return {
    x: clamp(1 - width - 0.045, 0, 1 - width),
    y: clamp(1 - height - 0.07, 0, 1 - height),
  };
}

export default function App() {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const mp4UrlRef = useRef<string | null>(null);
  const importedWebmUrlRef = useRef<string | null>(null);
  const [details, setDetails] = useState<FileNameDetails>(DEFAULT_DETAILS);
  const [notes, setNotes] = useState("");
  const [showWebcam, setShowWebcam] = useState(true);
  const [includeSystemAudio, setIncludeSystemAudio] = useState(false);
  const [bubbleSize, setBubbleSize] = useState<BubbleSize>("medium");
  const [bubblePosition, setBubblePosition] = useState<BubblePosition>(
    defaultBubblePosition("medium"),
  );
  const [showRecordedPreview, setShowRecordedPreview] = useState(false);
  const [importedWebmBlob, setImportedWebmBlob] = useState<Blob | null>(null);
  const [importedWebmUrl, setImportedWebmUrl] = useState<string | null>(null);
  const [importedWebmName, setImportedWebmName] = useState<string | null>(null);
  const [importedBaseFileName, setImportedBaseFileName] = useState<string | null>(null);
  const [mp4Blob, setMp4Blob] = useState<Blob | null>(null);
  const [mp4Url, setMp4Url] = useState<string | null>(null);
  const [landingPageReady, setLandingPageReady] = useState(false);

  const recorder = useScreenRecorder({
    showWebcam,
    bubbleSize,
    bubblePosition,
    includeSystemAudio,
  });
  const recorderStatus = recorder.status;
  const stopCurrentRecording = recorder.stopRecording;

  const baseFileName = useMemo(() => buildBaseFileName(details), [details]);
  const activeBaseFileName = importedBaseFileName || baseFileName;
  const activeWebmBlob = importedWebmBlob || recorder.webmBlob;
  const activeWebmUrl = importedWebmUrl || recorder.webmUrl;
  const prospectNameReady = Boolean(details.prospectName.trim());
  const nameRequiredMessage =
    "Add the prospect name first so the downloaded video has a friendly filename.";

  const clearMp4 = useCallback(() => {
    if (mp4UrlRef.current) {
      URL.revokeObjectURL(mp4UrlRef.current);
      mp4UrlRef.current = null;
    }
    setMp4Blob(null);
    setMp4Url(null);
  }, []);

  const clearImportedWebm = useCallback(() => {
    if (importedWebmUrlRef.current) {
      URL.revokeObjectURL(importedWebmUrlRef.current);
      importedWebmUrlRef.current = null;
    }
    setImportedWebmBlob(null);
    setImportedWebmUrl(null);
    setImportedWebmName(null);
    setImportedBaseFileName(null);
  }, []);

  const handleWebmImported = useCallback(
    (file: File) => {
      clearImportedWebm();
      clearMp4();
      setLandingPageReady(false);
      recorder.resetRecording();

      const url = URL.createObjectURL(file);
      importedWebmUrlRef.current = url;
      setImportedWebmBlob(file);
      setImportedWebmUrl(url);
      setImportedWebmName(file.name);
      setImportedBaseFileName(baseNameFromFileName(file.name));
      setShowRecordedPreview(true);
    },
    [clearImportedWebm, clearMp4, recorder],
  );

  const handleMp4Ready = useCallback((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    if (mp4UrlRef.current) {
      URL.revokeObjectURL(mp4UrlRef.current);
    }
    mp4UrlRef.current = url;
    setMp4Blob(blob);
    setMp4Url(url);
  }, []);

  useEffect(() => {
    const width = BUBBLE_SIZE_PERCENT[bubbleSize];
    const height = width * (9 / 16);
    setBubblePosition((position) => ({
      x: clamp(position.x, 0, 1 - width),
      y: clamp(position.y, 0, 1 - height),
    }));
  }, [bubbleSize]);

  useEffect(() => {
    if (recorderStatus === "stopped" && recorder.webmUrl) {
      setShowRecordedPreview(true);
    }
  }, [recorderStatus, recorder.webmUrl]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        (recorderStatus === "recording" ||
          recorderStatus === "paused" ||
          recorderStatus === "countdown")
      ) {
        stopCurrentRecording();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [recorderStatus, stopCurrentRecording]);

  const startRecording = () => {
    setShowRecordedPreview(false);
    setLandingPageReady(false);
    clearMp4();
    clearImportedWebm();
    void recorder.startRecording();
  };

  const resetRecording = () => {
    setShowRecordedPreview(false);
    setLandingPageReady(false);
    clearMp4();
    clearImportedWebm();
    recorder.resetRecording();
  };

  const useTemplate = (template: string) => {
    setNotes((current) => (current.trim() ? `${current.trim()}\n\n${template}` : template));
  };

  useEffect(() => {
    return () => {
      if (mp4UrlRef.current) {
        URL.revokeObjectURL(mp4UrlRef.current);
        mp4UrlRef.current = null;
      }
      if (importedWebmUrlRef.current) {
        URL.revokeObjectURL(importedWebmUrlRef.current);
        importedWebmUrlRef.current = null;
      }
    };
  }, []);

  return (
    <main className="app-shell">
      <header className="hero">
        <div className="brand-lockup">
          <img src="/logo-dark.svg" alt="Essential Resourcing" />
          <span>Video Outreach</span>
        </div>
        <div className="hero-copy">
          <p className="eyebrow">Local video outreach</p>
          <h1>Record the browser, your camera and your voice in one take.</h1>
        </div>
      </header>

      <section className="privacy-warning">
        <ShieldCheck size={20} aria-hidden="true" />
        <p>
          Check the screen before recording. Avoid private messages,
          notifications, candidate data and anything the prospect does not need
          to see.
        </p>
      </section>

      {!recorder.support.supported && (
        <section className="error-box">
          <AlertTriangle size={18} aria-hidden="true" />
          <div>
            <strong>Browser support issue</strong>
            {recorder.support.issues.map((issue) => (
              <p key={issue}>{issue}</p>
            ))}
          </div>
        </section>
      )}

      <div className="workspace">
        <aside className="sidebar">
          <ProspectDetails
            details={details}
            onChange={setDetails}
            prospectRequired
          />

          <section className="panel">
            <div className="panel-heading">
              <h2>Recorder</h2>
            </div>

            <label className="toggle-row">
              <span>
                <Camera size={18} aria-hidden="true" />
                Webcam bubble
              </span>
              <input
                type="checkbox"
                checked={showWebcam}
                onChange={(event) => setShowWebcam(event.target.checked)}
              />
            </label>

            <div className="segmented-group" aria-label="Webcam bubble size">
              {(["small", "medium", "large"] as const).map((size) => (
                <button
                  key={size}
                  className={bubbleSize === size ? "is-selected" : ""}
                  onClick={() => setBubbleSize(size)}
                  type="button"
                  disabled={!showWebcam}
                >
                  {size}
                </button>
              ))}
            </div>

            <label className="toggle-row">
              <span>
                <Volume2 size={18} aria-hidden="true" />
                System audio
              </span>
              <input
                type="checkbox"
                checked={includeSystemAudio}
                onChange={(event) => setIncludeSystemAudio(event.target.checked)}
              />
            </label>
          </section>

          <ScriptNotes notes={notes} onChange={setNotes} />
          <TemplateLibrary onUseTemplate={useTemplate} />
        </aside>

        <section className="recorder-column">
          <VideoPreview
            canvasRef={recorder.canvasRef}
            screenVideoRef={recorder.screenVideoRef}
            webcamVideoRef={recorder.webcamVideoRef}
            containerRef={stageRef}
            status={recorder.status}
            countdown={recorder.countdown}
            timerSeconds={recorder.timerSeconds}
            webmUrl={activeWebmUrl}
            showRecordedPreview={showRecordedPreview}
            showWebcam={showWebcam}
            bubblePosition={bubblePosition}
            bubbleSize={bubbleSize}
            onBubblePositionChange={setBubblePosition}
          />

          <RecorderControls
            status={recorder.status}
            supported={recorder.support.supported}
            startBlockedReason={prospectNameReady ? undefined : nameRequiredMessage}
            hasRecording={Boolean(activeWebmUrl)}
            onStart={startRecording}
            onPause={recorder.pauseRecording}
            onResume={recorder.resumeRecording}
            onStop={recorder.stopRecording}
            onPreview={() => setShowRecordedPreview(true)}
            onReset={resetRecording}
          />

          <div className="status-grid">
            <div className="status-card">
              <MonitorUp size={18} aria-hidden="true" />
              <span>Choose screen, window or tab when the browser asks.</span>
            </div>
            <div className="status-card">
              <Volume2 size={18} aria-hidden="true" />
              <span>Microphone audio is included in the final recording.</span>
            </div>
          </div>

          {recorder.error && <div className="error-box">{recorder.error}</div>}
          {recorder.notice && <div className="notice-box">{recorder.notice}</div>}

          <ConversionPanel
            webmBlob={activeWebmBlob}
            webmUrl={activeWebmUrl}
            mp4Blob={mp4Blob}
            mp4Url={mp4Url}
            baseFileName={activeBaseFileName}
            fileNameReady={prospectNameReady}
            fileNameHelp={nameRequiredMessage}
            importedWebmName={importedWebmName}
            onWebmImported={handleWebmImported}
            onMp4Ready={handleMp4Ready}
            onClearMp4={clearMp4}
          />

          <SharePagePanel
            details={details}
            baseFileName={activeBaseFileName}
            webmBlob={activeWebmBlob}
            mp4Blob={mp4Blob}
            onGenerated={() => setLandingPageReady(true)}
          />

          <LocalActivityLog
            details={details}
            baseFileName={activeBaseFileName}
            hasWebm={Boolean(activeWebmBlob)}
            hasMp4={Boolean(mp4Blob)}
            landingPageReady={landingPageReady}
          />
        </section>
      </div>
    </main>
  );
}
