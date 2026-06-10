"use client";

import Image from "next/image";
import { useState } from "react";
import type { RichMedia as RichMediaType } from "@/lib/types";

type VideoMedia = Extract<RichMediaType, { type: "video" }>;

function toEmbedUrl(url: string, provider: "youtube" | "vimeo") {
  if (url.includes("/embed/") || url.includes("player.vimeo.com/video/")) return url;

  if (provider === "youtube") {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }

  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

function Poster({ media }: { media: VideoMedia }) {
  return (
    <div className="video-placeholder">
      {media.thumbnail ? (
        <Image
          className="video-poster-image"
          src={media.thumbnail}
          alt={media.thumbnailAlt || ""}
          fill
          sizes="(max-width: 980px) 100vw, 48vw"
        />
      ) : null}
      <span>Founder video</span>
      <strong>{media.title}</strong>
    </div>
  );
}

export function VideoEmbed({ media }: { media: VideoMedia }) {
  const [loaded, setLoaded] = useState(false);
  const hasUrl = Boolean(media.url);

  if (media.provider === "upload" && hasUrl) {
    return (
      <figure className="video-block">
        <div className="video-frame">
          <video controls playsInline preload="metadata" poster={media.thumbnail}>
            <source src={media.url} />
            <track kind="captions" src={media.captionsUrl || undefined} srcLang="en" label="English captions" />
            Your browser does not support this video.
          </video>
        </div>
        <figcaption>
          <strong>{media.title}</strong>
          {media.description ? <span>{media.description}</span> : null}
          {media.transcript ? <span>{media.transcript}</span> : null}
        </figcaption>
      </figure>
    );
  }

  const embedUrl = hasUrl && media.provider !== "upload" ? toEmbedUrl(media.url || "", media.provider) : "";

  return (
    <figure className="video-block">
      <div className="video-frame">
        {embedUrl && loaded ? (
          <iframe
            src={embedUrl}
            title={media.title}
            loading="lazy"
            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : embedUrl ? (
          <button
            className="video-poster-button"
            type="button"
            aria-label={`Load video: ${media.title}`}
            onClick={() => setLoaded(true)}
          >
            <Poster media={media} />
            <span className="video-play-indicator" aria-hidden="true">
              Play
            </span>
          </button>
        ) : (
          <Poster media={media} />
        )}
      </div>
      <figcaption>
        <strong>{media.title}</strong>
        {media.description ? <span>{media.description}</span> : null}
        {media.transcript ? <span>{media.transcript}</span> : null}
      </figcaption>
    </figure>
  );
}
