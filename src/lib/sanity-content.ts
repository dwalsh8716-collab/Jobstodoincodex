import { sanityClient, sanityReady } from "./sanity";

type SanityFetchOptions<T> = {
  query: string;
  params?: Record<string, unknown>;
  fallback: T;
};

export async function sanityFetchWithFallback<T>({
  query,
  params = {},
  fallback,
}: SanityFetchOptions<T>): Promise<T> {
  if (!sanityReady) return fallback;

  try {
    const result = await sanityClient.fetch<T | null>(query, params);
    return result ?? fallback;
  } catch {
    return fallback;
  }
}
