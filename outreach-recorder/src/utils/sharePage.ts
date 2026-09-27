import type { FileNameDetails } from "./filename";

type SharePageArgs = {
  details: FileNameDetails;
  landingMessage: string;
  videoDataUrl: string;
  videoType: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not prepare the video file."));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

export function buildSharePageHtml({
  details,
  landingMessage,
  videoDataUrl,
  videoType,
}: SharePageArgs): string {
  const prospect = details.prospectName.trim();
  const company = details.companyName.trim();
  const title = prospect
    ? `A short note for ${prospect}`
    : company
      ? `A short note for ${company}`
      : "A short personal note";
  const intro = landingMessage.trim()
    ? landingMessage.trim()
    : "I recorded this short note for you. No tracking, no sign-in, just the video.";
  const context = [prospect, company, details.roleTitle.trim()]
    .filter(Boolean)
    .join(" | ");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex,nofollow" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f5f3ee;
        --ink: #171716;
        --muted: #66625a;
        --line: #d7d0c3;
        --brand: #123c34;
        --accent: #b6402f;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        background: var(--bg);
        color: var(--ink);
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      main {
        width: min(960px, calc(100% - 32px));
        margin: 0 auto;
        padding: 42px 0;
      }
      .brand {
        color: var(--brand);
        font-weight: 850;
        font-size: clamp(1.4rem, 5vw, 2.4rem);
        line-height: 0.95;
        margin-bottom: 34px;
      }
      .eyebrow {
        color: var(--accent);
        font-size: 0.78rem;
        font-weight: 800;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-bottom: 10px;
      }
      h1 {
        margin: 0;
        font-size: clamp(2rem, 7vw, 4.6rem);
        line-height: 0.98;
        letter-spacing: 0;
      }
      .context {
        margin: 12px 0 0;
        color: var(--muted);
        font-weight: 700;
      }
      .message {
        margin: 22px 0 28px;
        max-width: 720px;
        color: #312f2b;
        font-size: 1.1rem;
        line-height: 1.55;
      }
      .video-frame {
        border: 1px solid var(--line);
        border-radius: 8px;
        overflow: hidden;
        background: #101312;
        box-shadow: 0 18px 60px rgba(25, 23, 18, 0.16);
      }
      video {
        display: block;
        width: 100%;
        aspect-ratio: 16 / 9;
        background: #101312;
      }
      footer {
        margin-top: 26px;
        padding-top: 18px;
        border-top: 1px solid var(--line);
        color: var(--muted);
        font-size: 0.92rem;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="brand">Essential<br />Resourcing</div>
      <div class="eyebrow">Personal video note</div>
      <h1>${escapeHtml(title)}</h1>
      ${context ? `<p class="context">${escapeHtml(context)}</p>` : ""}
      <p class="message">${escapeHtml(intro)}</p>
      <div class="video-frame">
        <video controls playsinline preload="metadata">
          <source src="${videoDataUrl}" type="${escapeHtml(videoType)}" />
          Your browser does not support this video.
        </video>
      </div>
      <footer>
        Sent personally by David Walsh at Essential Resourcing.
      </footer>
    </main>
  </body>
</html>`;
}

export function downloadTextFile(contents: string, filename: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
