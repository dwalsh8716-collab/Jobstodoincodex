"use client";

import { useId, useState } from "react";
import styles from "./salary-guide.module.css";

const guideUrl =
  "https://essentialresourcing.co.uk/insights/manchester-north-west-marketing-salary-guide-2026";
const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(guideUrl)}`;

export function SalaryGuideShare() {
  const headingId = useId();
  const [copyStatus, setCopyStatus] = useState("");

  async function copyGuideLink() {
    try {
      await navigator.clipboard.writeText(guideUrl);
      setCopyStatus("Link copied");
    } catch {
      setCopyStatus("Copy the link from your browser address bar");
    }
  }

  return (
    <aside className={styles.sharePanel} aria-labelledby={headingId}>
      <div>
        <p id={headingId} className={styles.shareHeading}>
          Useful? Send it to someone who’s hiring.
        </p>
        <p className={styles.shareNote}>No sign-up. Just the useful bit.</p>
      </div>
      <div className={styles.shareActions}>
        <a
          className={styles.actionLink}
          href={linkedInShareUrl}
          target="_blank"
          rel="noreferrer"
        >
          Share on LinkedIn
        </a>
        <button
          className={styles.actionButton}
          type="button"
          onClick={copyGuideLink}
        >
          Copy link
        </button>
      </div>
      <p className={styles.copyStatus} aria-live="polite">
        {copyStatus}
      </p>
    </aside>
  );
}
