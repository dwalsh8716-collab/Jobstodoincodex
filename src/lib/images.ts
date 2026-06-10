export const imageSizes = {
  hero: "(max-width: 980px) 100vw, 48vw",
  content: "(max-width: 980px) 100vw, 720px",
  gallery: "(max-width: 980px) 100vw, (max-width: 1280px) 33vw, 380px",
  logo: "(max-width: 640px) 156px, 190px",
  mark: "(max-width: 640px) 160px, 250px",
  poster: "(max-width: 980px) 100vw, 48vw",
} as const;

export function safeImageAlt(value: string | undefined, fallback = "") {
  return value?.replace(/\s+/g, " ").trim() || fallback;
}

export function safeImageDimensions(
  width: number | undefined,
  height: number | undefined,
  fallback = { width: 1400, height: 900 },
) {
  return {
    width: width && width > 0 ? width : fallback.width,
    height: height && height > 0 ? height : fallback.height,
  };
}
