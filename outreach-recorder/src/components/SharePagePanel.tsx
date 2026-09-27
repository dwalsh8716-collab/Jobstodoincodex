import { Download, Globe2 } from "lucide-react";
import { useState } from "react";
import type { FileNameDetails } from "../utils/filename";
import {
  blobToDataUrl,
  buildSharePageHtml,
  downloadTextFile,
} from "../utils/sharePage";

type SharePagePanelProps = {
  details: FileNameDetails;
  baseFileName: string;
  webmBlob: Blob | null;
  mp4Blob: Blob | null;
  onGenerated: () => void;
};

export function SharePagePanel({
  details,
  baseFileName,
  webmBlob,
  mp4Blob,
  onGenerated,
}: SharePagePanelProps) {
  const [landingMessage, setLandingMessage] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoBlob = mp4Blob || webmBlob;
  const formatLabel = mp4Blob ? "MP4" : webmBlob ? "WebM" : "no video";

  const generateSharePage = async () => {
    if (!videoBlob) return;

    setGenerating(true);
    setError(null);

    try {
      const videoDataUrl = await blobToDataUrl(videoBlob);
      const html = buildSharePageHtml({
        details,
        landingMessage,
        videoDataUrl,
        videoType: mp4Blob ? "video/mp4" : videoBlob.type || "video/webm",
      });
      downloadTextFile(
        html,
        `${baseFileName}_landing-page.html`,
        "text/html;charset=utf-8",
      );
      onGenerated();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "The landing page could not be generated.",
      );
    } finally {
      setGenerating(false);
    }
  };

  return (
    <section className="panel share-panel">
      <div className="panel-heading">
        <h2>Share page</h2>
        <Globe2 size={18} aria-hidden="true" />
      </div>

      <label>
        <span>Short landing page message</span>
        <textarea
          className="compact-textarea"
          value={landingMessage}
          onChange={(event) => setLandingMessage(event.target.value)}
          placeholder="A quick note before they watch the video."
        />
      </label>

      <div className="export-status">
        <Globe2 size={18} aria-hidden="true" />
        {videoBlob
          ? `Ready to generate a branded local page using ${formatLabel}.`
          : "Record a video before generating a share page."}
      </div>

      <button
        className="primary-action full-width"
        onClick={generateSharePage}
        disabled={!videoBlob || generating}
      >
        <Download size={18} aria-hidden="true" />
        {generating ? "Generating..." : "Download branded landing page"}
      </button>

      <div className="help-note">
        This creates a local HTML file with the video embedded. It is not
        uploaded anywhere and has no viewer tracking.
      </div>

      {error && <div className="error-box">{error}</div>}
    </section>
  );
}
