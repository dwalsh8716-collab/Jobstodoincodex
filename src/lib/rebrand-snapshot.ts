import "server-only";
import snapshot from "@/content/rebrand-public-snapshot.json";
import * as queries from "./sanity-queries";

const bySlugLists: Record<string, string> = {
  SERVICE_BY_SLUG_QUERY: "SERVICES_QUERY",
  INSIGHT_BY_SLUG_QUERY: "INSIGHTS_QUERY",
  CASE_STUDY_BY_SLUG_QUERY: "CASE_STUDIES_QUERY",
  SALARY_SNAPSHOT_BY_SLUG_QUERY: "SALARY_SNAPSHOTS_QUERY",
  JOB_BY_SLUG_QUERY: "JOBS_QUERY",
};

export function getRebrandSnapshot(query: string, params: Record<string, unknown>) {
  const name = Object.entries(queries).find(([, value]) => value === query)?.[0];
  if (!name) return null;
  const data: Record<string, unknown> = snapshot.data;
  const listName = bySlugLists[name];
  if (!listName) return data[name] ?? null;
  const list = data[listName];
  if (!Array.isArray(list)) return null;
  return list.find((item: { slug?: string }) => item.slug === params.slug) ?? null;
}
