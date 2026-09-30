"use client";

import { useEffect, useState } from "react";
import { useFormValue } from "sanity";
import styles from "./JobDistributionPanel.module.css";

type JobDocument = {
  _id?: string;
  status?: string;
  slug?: { current?: string };
};

type PublicJob = {
  eligible: boolean;
  unavailable?: boolean;
  url?: string;
  reference?: string;
  title?: string;
  summary?: string;
  location?: string;
  salary?: string;
  postedDate?: string;
  closingDate?: string;
  talentEligible?: boolean;
};

export function JobDistributionPanel() {
  const document = useFormValue([]) as JobDocument | undefined;
  const slug = document?.slug?.current;
  const [job, setJob] = useState<PublicJob | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (document?.status !== "live" || !slug) return;
    let active = true;
    fetch(`/api/jobs/distribution-status?slug=${encodeURIComponent(slug)}`, { cache: "no-store" })
      .then((response) => response.json() as Promise<PublicJob>)
      .then((result) => { if (active) setJob(result); })
      .catch(() => { if (active) setJob({ eligible: false, unavailable: true }); });
    return () => { active = false; };
  }, [document?.status, slug]);

  const live = document?.status === "live" && job?.eligible && job.url?.endsWith(`/jobs/${slug}`);
  const linkedInUrl = live ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(job.url!)}` : "";
  const xUrl = live ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${job.title} | ${job.location} | ${job.salary}`)}&url=${encodeURIComponent(job.url!)}` : "";
  const linkedInPost = live
    ? `NEW ROLE — ${job.title}\n\n${job.summary}\n\n${job.location} | ${job.salary}\n\nInterested? Have a look at the full role or drop me a message.\n\n${job.url}`
    : "";
  const shortPost = live ? `${job.title} | ${job.location} | ${job.salary}\n\n${job.url}` : "";

  async function copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label} copied`);
    } catch {
      setMessage("Copying is unavailable in this browser");
    }
  }

  return (
    <div className={styles.panel}>
      <p className={styles.status}>Website: {live ? "LIVE" : document?.status === "live" ? job?.unavailable ? "CHECK UNAVAILABLE" : "NOT YET ELIGIBLE" : (document?.status || "DRAFT").toUpperCase()}</p>
      <p>Google Jobs: {live ? "eligible for discovery; indexing not guaranteed" : "not eligible"}</p>
      <p>XML feed: {live ? "included" : "excluded"} · Adzuna: feed prepared, not connected</p>
      <p>Talent.com: {live && !job.talentEligible ? "excluded: confidential employer" : "feed prepared, not connected"} · LinkedIn Jobs: not connected · Indeed: not connected</p>
      {live ? (
        <>
          <p>Reference: {job.reference} · Posted: {job.postedDate} · Closes: {job.closingDate}</p>
          <a href={job.url} target="_blank" rel="noopener noreferrer">Open live job</a>
          <div className={styles.actions}>
            <button type="button" onClick={() => copy(job.url!, "Link")}>Copy job link</button>
            <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">Share on LinkedIn</a>
            <a href={xUrl} target="_blank" rel="noopener noreferrer">Share on X</a>
            <button type="button" onClick={() => copy(linkedInPost, "LinkedIn post")}>Copy LinkedIn post</button>
            <button type="button" onClick={() => copy(shortPost, "Short post")}>Copy short post</button>
          </div>
        </>
      ) : <p>Public sharing appears once the website confirms this is an open, complete role.</p>}
      <p className={styles.feedback} role="status">{message}</p>
    </div>
  );
}
