import Image from "next/image";
import type { RichMedia as RichMediaType } from "@/lib/types";

function toEmbedUrl(url: string, provider: "youtube" | "vimeo") {
  if (url.includes("/embed/")) return url;
  if (provider === "youtube") {
    const match = url.match(/(?:v=|youtu\.be\/)([^&?/]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  }
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}` : url;
}

export function VideoEmbed({ media }: { media: Extract<RichMediaType, { type: "video" }> }) {
  const embedUrl = media.url ? toEmbedUrl(media.url, media.provider) : "";

  return (
    <figure className="video-block">
      <div className="video-frame">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={media.title}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">
            <span>Video slot</span>
            <strong>{media.title}</strong>
          </div>
        )}
      </div>
      <figcaption>
        <strong>{media.title}</strong>
        {media.description ? <span>{media.description}</span> : null}
      </figcaption>
    </figure>
  );
}

export function RichMediaBlock({ media }: { media: RichMediaType }) {
  if (media.type === "video") return <VideoEmbed media={media} />;

  if (media.type === "gallery") {
    return (
      <section className="media-gallery" aria-label={media.title}>
        {media.items.map((item) => (
          <figure key={item.src}>
            <Image src={item.src} alt={item.alt} width={900} height={640} />
            {item.caption ? <figcaption>{item.caption}</figcaption> : null}
          </figure>
        ))}
      </section>
    );
  }

  return (
    <figure className="image-block">
      <Image src={media.src} alt={media.alt} width={1400} height={900} />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}
