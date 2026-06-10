import type { SanityImage } from "@/lib/sanity-types";
import { safeImageAlt, safeImageDimensions } from "@/lib/images";

export function sanityImageUrl(image: SanityImage | undefined) {
  return image?.asset?.url || "";
}

export function sanityImageMetadata(
  image: SanityImage | undefined,
  fallbackAlt: string,
) {
  const dimensions = image?.asset?.metadata?.dimensions;

  return {
    src: sanityImageUrl(image),
    alt: safeImageAlt(image?.alt, fallbackAlt),
    caption: image?.caption,
    ...safeImageDimensions(dimensions?.width, dimensions?.height),
  };
}
