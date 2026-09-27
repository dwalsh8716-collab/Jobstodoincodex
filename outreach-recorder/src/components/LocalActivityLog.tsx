import { BarChart3, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { FileNameDetails } from "../utils/filename";
import {
  addOutreachLogEntry,
  clearOutreachLog,
  getOutreachLog,
  type OutreachLogEntry,
} from "../utils/localLog";

type LocalActivityLogProps = {
  details: FileNameDetails;
  baseFileName: string;
  hasWebm: boolean;
  hasMp4: boolean;
  landingPageReady: boolean;
};

function formatDate(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function LocalActivityLog({
  details,
  baseFileName,
  hasWebm,
  hasMp4,
  landingPageReady,
}: LocalActivityLogProps) {
  const [entries, setEntries] = useState<OutreachLogEntry[]>([]);

  useEffect(() => {
    setEntries(getOutreachLog());
  }, []);

  const stats = useMemo(
    () => ({
      recordings: entries.filter((entry) => entry.webmReady).length,
      mp4s: entries.filter((entry) => entry.mp4Ready).length,
      pages: entries.filter((entry) => entry.landingPageReady).length,
    }),
    [entries],
  );

  const saveCurrent = () => {
    setEntries(
      addOutreachLogEntry({
        details,
        baseFileName,
        webmReady: hasWebm,
        mp4Ready: hasMp4,
        landingPageReady,
      }),
    );
  };

  const clearAll = () => {
    clearOutreachLog();
    setEntries([]);
  };

  return (
    <section className="panel activity-panel">
      <div className="panel-heading">
        <h2>Local activity</h2>
        <BarChart3 size={18} aria-hidden="true" />
      </div>

      <div className="stats-row">
        <div>
          <strong>{stats.recordings}</strong>
          <span>Recordings</span>
        </div>
        <div>
          <strong>{stats.mp4s}</strong>
          <span>MP4s</span>
        </div>
        <div>
          <strong>{stats.pages}</strong>
          <span>Pages</span>
        </div>
      </div>

      <div className="activity-actions">
        <button onClick={saveCurrent} disabled={!hasWebm}>
          Save local activity note
        </button>
        <button onClick={clearAll} disabled={!entries.length}>
          <Trash2 size={17} aria-hidden="true" />
          Clear
        </button>
      </div>

      <div className="activity-list">
        {entries.length ? (
          entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="activity-item">
              <strong>
                {entry.details.prospectName ||
                  entry.details.companyName ||
                  "Untitled outreach"}
              </strong>
              <span>
                {formatDate(entry.createdAt)} | {entry.mp4Ready ? "MP4" : "WebM"}
                {entry.landingPageReady ? " | page" : ""}
              </span>
            </div>
          ))
        ) : (
          <p className="help-note">
            Local-only counts appear here when you save an activity note. No
            recipient tracking is added.
          </p>
        )}
      </div>
    </section>
  );
}
