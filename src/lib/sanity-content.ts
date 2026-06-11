import "server-only";

import { isSanityReady, sanityClient } from "./sanity";

type SanityFetchOptions<T> = {
  query: string;
  params?: Record<string, unknown>;
  fallback: T;
  tags?: string[];
  revalidate?: number | false;
  fallbackOnEmpty?: boolean;
};

export const publicContentRevalidateSeconds = 300;

function isEmptyResult(value: unknown) {
  return (
    value == null ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0)
  );
}

export async function sanityFetchWithFallback<T>({
  query,
  params = {},
  fallback,
  tags = [],
  revalidate = publicContentRevalidateSeconds,
  fallbackOnEmpty = true,
}: SanityFetchOptions<T>): Promise<T> {
  if (!isSanityReady()) return fallback;

  try {
    const result = await sanityClient.fetch<T | null>(query, params, {
      next: {
        revalidate,
        tags,
      },
    });

    if (fallbackOnEmpty && isEmptyResult(result)) return fallback;

    return result ?? fallback;
  } catch {
    return fallback;
  }
}
