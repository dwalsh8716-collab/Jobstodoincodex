"use client";

import { useState } from "react";
import type { RichMedia as RichMediaType } from "@/lib/types";
import { VideoPoster } from "./VideoPoster";

type VideoMedia = Extract<RichMediaType, { type: "video" }>;

export function DeferredVideoEmbed({
  embedUrl,
  media,
}: {
  embedUrl: string;
  media: VideoMedia;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={embedUrl}
        title={media.title}
        loading="lazy"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    );
  }

  return (
    <button
      className="video-poster-button"
      type="button"
      aria-label={`Load video: ${media.title}`}
      onClick={() => setLoaded(true)}
    >
      <VideoPoster media={media} />
      <span className="video-play-indicator" aria-hidden="true">
        Play
      </span>
    </button>
  );
}
