import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  indexNowPathForSanityDocument,
  submitIndexNowUrls,
  type SanityIndexNowPayload,
} from "@/lib/indexnow";
import { notifyGoogleJobUrl } from "@/lib/google-job-indexing";
import { activeDistributionJobs } from "@/lib/job-distribution";
import { getFreshDistributionJobs } from "@/lib/public-content";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const secret = process.env.SANITY_WEBHOOK_SECRET;
  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (
    !secret ||
    !signature ||
    !(await isValidSignature(body, signature, secret))
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: SanityIndexNowPayload;
  try {
    payload = JSON.parse(body) as SanityIndexNowPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const paths = indexNowPathForSanityDocument(payload);
  paths.forEach((path) => revalidatePath(path));
  revalidatePath("/sitemap.xml");
  revalidatePath("/feeds/jobs.xml");
  revalidatePath("/feeds/talent.xml");
  revalidatePath("/rss.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");

  const notifications = await Promise.allSettled([
    submitIndexNowUrls(paths),
    (async () => {
      if (payload._type !== "job" || !payload._id || payload._id.startsWith("drafts.")) {
        return { status: "not_applicable" as const };
      }
      const jobs = await getFreshDistributionJobs();
      const job = jobs.find((item) => item.externalJobId === payload._id);
      const slug = job?.slug || (typeof payload.slug === "string" ? payload.slug : payload.slug?.current);
      if (!slug) return { status: "missing_slug" as const };
      const isLive = job && activeDistributionJobs([job]).length > 0;
      return notifyGoogleJobUrl({ slug }, isLive ? "URL_UPDATED" : "URL_DELETED", {
        revision: payload._rev,
      });
    })(),
  ]);

  for (const [index, result] of notifications.entries()) {
    if (result.status === "rejected") {
      console.error(index === 0 ? "IndexNow submission failed" : "Google job indexing notification failed", {
        message: result.reason instanceof Error ? result.reason.message : "Unknown error",
        documentType: payload._type,
        documentId: payload._id,
      });
    }
  }
  return NextResponse.json({
    ok: true,
    indexNow: notifications[0].status === "fulfilled" ? notifications[0].value : { status: "failed" },
    googleIndexing: notifications[1].status === "fulfilled" ? notifications[1].value : { status: "failed" },
  });
}
