import type { FileNameDetails } from "./filename";

export type OutreachLogEntry = {
  id: string;
  createdAt: string;
  details: FileNameDetails;
  baseFileName: string;
  webmReady: boolean;
  mp4Ready: boolean;
  landingPageReady: boolean;
};

const STORAGE_KEY = "essential-outreach-recorder-log";

function safeParse(value: string | null): OutreachLogEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as OutreachLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function getOutreachLog(): OutreachLogEntry[] {
  return safeParse(window.localStorage.getItem(STORAGE_KEY));
}

export function saveOutreachLog(entries: OutreachLogEntry[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 30)));
}

export function addOutreachLogEntry(entry: Omit<OutreachLogEntry, "id" | "createdAt">) {
  const nextEntry: OutreachLogEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const entries = [nextEntry, ...getOutreachLog()].slice(0, 30);
  saveOutreachLog(entries);
  return entries;
}

export function clearOutreachLog() {
  window.localStorage.removeItem(STORAGE_KEY);
}
