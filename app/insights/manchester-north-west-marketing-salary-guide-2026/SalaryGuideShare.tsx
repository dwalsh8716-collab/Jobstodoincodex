"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { publicSalaryGuideUrl as guideUrl } from "@/lib/salary-guide-product";
import { SalaryGuideEmail } from "./SalaryGuideEmail";
import styles from "./salary-guide.module.css";

const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(guideUrl)}`;

export function SalaryGuideShare({ position }: { position: "top" | "bottom" }) {
  const [copyStatus, setCopyStatus] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMounted, setEmailMounted] = useState(false);

  async function copyGuideLink() {
    try {
      await navigator.clipboard.writeText(guideUrl);
      setCopyStatus("Link copied");
      trackEvent("salary_guide_copy_link", { location: position });
    } catch {
      setCopyStatus("Copy the link from your browser address bar");
    }
  }

  return (
    <aside
      className={styles.sharePanel}
      aria-label={`Share the salary guide (${position})`}
    >
      <div>
        <p className={styles.shareHeading}>
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
          onClick={() =>
            trackEvent("salary_guide_share_linkedin", { location: position })
          }
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
        <button
          className={styles.actionButton}
          type="button"
          aria-expanded={emailOpen}
          aria-controls={`guide-email-${position}`}
          onClick={() => {
            setEmailOpen(!emailOpen);
            setEmailMounted(true);
            if (!emailOpen)
              trackEvent("salary_guide_email_opened", { location: position });
          }}
        >
          Email me this guide
        </button>
      </div>
      <p className={styles.copyStatus} aria-live="polite">
        {copyStatus}
      </p>
      <div
        id={`guide-email-${position}`}
        className={styles.emailDisclosure}
        hidden={!emailOpen}
      >
        {emailMounted && (
          <SalaryGuideEmail position={position} copyLink={copyGuideLink} />
        )}
      </div>
    </aside>
  );
}
