"use client";

import { useEffect, useRef, useState } from "react";

const desktopVideo = "/assets/video/homepage-hero-muted.mp4";
const mobileVideo = "/assets/video/homepage-hero-mobile-muted.mp4";

function shouldAvoidVideo() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean };
    }
  ).connection;

  return (
    connection?.saveData === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
    window.matchMedia("(prefers-reduced-data: reduce)").matches
  );
}

export function HomeHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [source, setSource] = useState<string>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (shouldAvoidVideo()) return;

    let started = false;
    const startVideo = () => {
      if (started) return;
      started = true;
      setSource(
        window.matchMedia("(max-width: 640px)").matches
          ? mobileVideo
          : desktopVideo,
      );
    };

    const interactionEvents: Array<keyof WindowEventMap> = [
      "pointerdown",
      "scroll",
      "keydown",
      "touchstart",
    ];

    for (const event of interactionEvents) {
      window.addEventListener(event, startVideo, {
        once: true,
        passive: true,
      });
    }

    const fallback = window.setTimeout(startVideo, 12000);

    return () => {
      window.clearTimeout(fallback);
      for (const event of interactionEvents) {
        window.removeEventListener(event, startVideo);
      }
    };
  }, []);

  useEffect(() => {
    if (!source || !videoRef.current) return;
    void videoRef.current.play().catch(() => undefined);
  }, [source]);

  return (
    <video
      ref={videoRef}
      className={`home-hero-video-media${ready ? " is-ready" : ""}`}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onCanPlay={() => setReady(true)}
    >
      {source ? <source src={source} type="video/mp4" /> : null}
    </video>
  );
}
