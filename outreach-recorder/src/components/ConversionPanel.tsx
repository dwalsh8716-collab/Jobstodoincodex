import { Download, FileVideo, RefreshCw, Upload, Wand2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { checkLocalFfmpeg, convertWebmToMp4, type FfmpegStatus } from "../utils/conversion";
import { withExtension } from "../utils/filename";

type ConversionPanelProps = {
  webmBlob: Blob | null;
  webmUrl: string | null;
  mp4Blob: Blob | null;
  mp4Url: string | null;
  baseFileName: string;
  fileNameReady: boolean;
  fileNameHelp: string;
  importedWebmName: string | null;
  onWebmImported: (file: File) => void;
  onMp4Ready: (blob: Blob) => void;
  onClearMp4: () => void;
};

function downloadBlobUrl(url: string, filename: string) {
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function ConversionPanel({
  webmBlob,
  webmUrl,
  mp4Blob,
  mp4Url,
  baseFileName,
  fileNameReady,
  fileNameHelp,
  importedWebmName,
  onWebmImported,
  onMp4Ready,
  onClearMp4,
}: ConversionPanelProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const [ffmpeg, setFfmpeg] = useState<FfmpegStatus | null>(null);
  const [checking, setChecking] = useState(true);
  const [converting, setConverting] = useState(false);
  const [conversionError, setConversionError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const webmName = useMemo(
    () => withExtension(baseFileName, "webm"),
    [baseFileName],
  );
  const mp4Name = useMemo(() => withExtension(baseFileName, "mp4"), [baseFileName]);

  const refreshFfmpeg = async () => {
    setChecking(true);
    setFfmpeg(await checkLocalFfmpeg());
    setChecking(false);
  };

  useEffect(() => {
    void refreshFfmpeg();
  }, []);

  useEffect(() => {
    onClearMp4();
    setConversionError(null);
  }, [onClearMp4, webmBlob]);

  const handleConvert = async () => {
    if (!webmBlob) return;

    setConverting(true);
    setConversionError(null);
    try {
      const mp4Blob = await convertWebmToMp4(webmBlob);
      onMp4Ready(mp4Blob);
    } catch (error) {
      setConversionError(
        error instanceof Error ? error.message : "MP4 conversion failed.",
      );
    } finally {
      setConverting(false);
    }
  };

  const handleImport = (file: File | undefined) => {
    setImportError(null);

    if (!file) return;

    const looksLikeWebm =
      file.type === "video/webm" || file.name.toLowerCase().endsWith(".webm");

    if (!looksLikeWebm) {
      setImportError("Choose a WebM file, usually ending in .webm.");
      return;
    }

    onWebmImported(file);
  };

  const localConverterReady = Boolean(ffmpeg?.available);

  return (
    <section className="panel conversion-panel">
      <div className="panel-heading">
        <h2>Export</h2>
        <button className="icon-button" onClick={refreshFfmpeg} disabled={checking}>
          <RefreshCw size={16} aria-hidden="true" />
          <span className="sr-only">Refresh ffmpeg status</span>
        </button>
      </div>

      <div className="export-status">
        <FileVideo size={18} aria-hidden="true" />
        {checking
          ? "Checking local MP4 converter..."
          : localConverterReady
            ? "Local MP4 converter ready."
            : "Local MP4 converter not found."}
      </div>

      <div className="import-row">
        <input
          ref={importInputRef}
          className="sr-only"
          type="file"
          accept="video/webm,.webm"
          onChange={(event) => {
            handleImport(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
        <button type="button" onClick={() => importInputRef.current?.click()}>
          <Upload size={18} aria-hidden="true" />
          Import WebM
        </button>
        <span>
          {importedWebmName
            ? `Loaded: ${importedWebmName}`
            : "Use this for WebM files recorded by the Chrome extension."}
        </span>
      </div>

      <div className="export-actions">
        <button
          onClick={() => webmUrl && downloadBlobUrl(webmUrl, webmName)}
          disabled={!webmUrl || !fileNameReady}
        >
          <Download size={18} aria-hidden="true" />
          Download WebM backup
        </button>
        <button
          className="primary-action"
          onClick={handleConvert}
          disabled={!webmBlob || !localConverterReady || converting || !fileNameReady}
        >
          <Wand2 size={18} aria-hidden="true" />
          {converting ? "Converting..." : "Convert to MP4"}
        </button>
        <button
          onClick={() => mp4Url && downloadBlobUrl(mp4Url, mp4Name)}
          disabled={!mp4Url || !mp4Blob || !fileNameReady}
        >
          <Download size={18} aria-hidden="true" />
          Download MP4
        </button>
      </div>

      {!fileNameReady && <div className="help-note">{fileNameHelp}</div>}

      {!localConverterReady && !checking && (
        <div className="help-note">
          Install ffmpeg for one-click MP4 export. Until then, download the WebM
          backup and convert it locally with:
          <code>
            ffmpeg -i input.webm -c:v libx264 -preset fast -crf 23 -c:a aac
            -b:a 128k output.mp4
          </code>
        </div>
      )}

      {ffmpeg?.version && <div className="fine-print">{ffmpeg.version}</div>}

      {importError && <div className="error-box">{importError}</div>}
      {conversionError && <div className="error-box">{conversionError}</div>}
    </section>
  );
}
