"use client";

import { useState, useSyncExternalStore } from "react";
import styles from "./JobShare.module.css";

export function JobShare({ title, location, salary, url }: {
  title: string;
  location: string;
  salary: string;
  url: string;
}) {
  const canShare = useSyncExternalStore(
    () => () => {},
    () => typeof navigator.share === "function",
    () => false,
  );
  const [message, setMessage] = useState("");

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
    } catch {
      setMessage("Copy the link from your browser address bar");
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: `${title} at Essential Resourcing`, url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("Sharing is unavailable on this device");
    }
  }

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${title} | ${location} | ${salary}`)}&url=${encodeURIComponent(url)}`;

  return (
    <aside className={styles.share} aria-label="Share this role">
      <span className={styles.heading}>Share this role</span>
      <div className={styles.actions}>
        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" aria-label={`Share ${title} on LinkedIn`}>LinkedIn</a>
        <a href={xUrl} target="_blank" rel="noopener noreferrer" aria-label={`Share ${title} on X`}>X</a>
        <button type="button" onClick={copyLink}>Copy link</button>
        {canShare ? <button type="button" onClick={nativeShare}>Share</button> : null}
      </div>
      <span className={styles.status} role="status">{message}</span>
    </aside>
  );
}
