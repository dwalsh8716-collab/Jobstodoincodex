import Image from "next/image";
import { imageSizes, safeImageAlt } from "@/lib/images";
import type { RichMedia as RichMediaType } from "@/lib/types";

type VideoMedia = Extract<RichMediaType, { type: "video" }>;

export function VideoPoster({ media }: { media: VideoMedia }) {
  return (
    <div className="video-placeholder">
      {media.thumbnail ? (
        <Image
          className="video-poster-image"
          src={media.thumbnail}
          alt={safeImageAlt(media.thumbnailAlt)}
          fill
          sizes={imageSizes.poster}
        />
      ) : null}
      <span>Founder video</span>
      <strong>{media.title}</strong>
    </div>
  );
}
