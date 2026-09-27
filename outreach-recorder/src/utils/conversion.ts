export type FfmpegStatus = {
  available: boolean;
  version?: string;
};

export async function checkLocalFfmpeg(): Promise<FfmpegStatus> {
  try {
    const response = await fetch("/api/ffmpeg-status");
    if (!response.ok) return { available: false };
    return (await response.json()) as FfmpegStatus;
  } catch {
    return { available: false };
  }
}

export async function convertWebmToMp4(webm: Blob): Promise<Blob> {
  const response = await fetch("/api/convert-to-mp4", {
    method: "POST",
    headers: {
      "Content-Type": webm.type || "video/webm",
    },
    body: webm,
  });

  if (!response.ok) {
    let message = "MP4 conversion failed.";
    try {
      const body = (await response.json()) as { message?: string; detail?: string };
      message = [body.message, body.detail].filter(Boolean).join(" ");
    } catch {
      message = await response.text();
    }
    throw new Error(message || "MP4 conversion failed.");
  }

  return response.blob();
}
