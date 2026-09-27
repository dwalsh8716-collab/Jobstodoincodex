export type FileNameDetails = {
  prospectName: string;
  companyName: string;
  roleTitle: string;
};

function cleanPart(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function dateStamp(date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");

  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
  ].join("-");
}

export function buildBaseFileName(details: FileNameDetails): string {
  const parts = [
    cleanPart(details.prospectName),
    cleanPart(details.companyName),
    "david-walsh-essential-resourcing-video",
    dateStamp(),
  ].filter(Boolean);

  return parts.length ? parts.join("-") : `essential-resourcing-video-${dateStamp()}`;
}

export function withExtension(baseName: string, extension: "webm" | "mp4"): string {
  return `${baseName}.${extension}`;
}

export function baseNameFromFileName(fileName: string): string {
  const withoutExtension = fileName.replace(/\.[a-z0-9]+$/i, "");
  const cleaned = withoutExtension
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return cleaned || `imported-webm_${dateStamp()}`;
}
