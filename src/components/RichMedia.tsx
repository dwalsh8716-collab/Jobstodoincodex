import Image from "next/image";
import { imageSizes, safeImageAlt } from "@/lib/images";
import type { RichMedia as RichMediaType } from "@/lib/types";
import { VideoEmbed } from "./VideoEmbed";

export function RichMediaBlock({ media }: { media: RichMediaType }) {
  if (media.type === "video") return <VideoEmbed media={media} />;

  if (media.type === "gallery") {
    return (
      <section className="media-gallery" aria-label={media.title}>
        {media.items.map((item) => (
          <figure key={item.src}>
            <Image
              src={item.src}
              alt={safeImageAlt(item.alt, media.title)}
              width={900}
              height={640}
              sizes={imageSizes.gallery}
            />
            {item.caption ? <figcaption>{item.caption}</figcaption> : null}
          </figure>
        ))}
      </section>
    );
  }

  return (
    <figure className="image-block">
      <Image
        src={media.src}
        alt={safeImageAlt(media.alt, media.title)}
        width={1400}
        height={900}
        sizes={imageSizes.content}
      />
      {media.caption ? <figcaption>{media.caption}</figcaption> : null}
    </figure>
  );
}
