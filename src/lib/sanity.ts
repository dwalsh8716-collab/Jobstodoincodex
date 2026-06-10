import { createClient } from "next-sanity";

// Sanity is the public content engine for the website.
// Do not use this client to write private enquiries, candidate records,
// CV details, DSAR requests, audit logs or internal recruitment notes.
export const sanityConfig = {
  projectId: process.env.SANITY_PROJECT_ID || "essentialresourcing",
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: process.env.SANITY_API_VERSION || "2026-06-09",
  useCdn: process.env.NODE_ENV === "production",
};

export const sanityClient = createClient({
  ...sanityConfig,
  token: process.env.SANITY_READ_TOKEN || process.env.SANITY_API_READ_TOKEN,
});

export const sanityReady = Boolean(
  process.env.SANITY_PROJECT_ID && process.env.SANITY_DATASET,
);
