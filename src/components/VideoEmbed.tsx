import type { RichMedia as RichMediaType } from "@/lib/types";
import { DeferredVideoEmbed } from "./DeferredVideoEmbed";
import { VideoPoster } from "./VideoPoster";

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

export function VideoEmbed({ media }: { media: VideoMedia }) {
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
        {embedUrl ? (
          <DeferredVideoEmbed embedUrl={embedUrl} media={media} />
        ) : (
          <VideoPoster media={media} />
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
