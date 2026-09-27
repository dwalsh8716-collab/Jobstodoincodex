import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  indexNowPathForSanityDocument,
  submitIndexNowUrls,
  type SanityIndexNowPayload,
} from "@/lib/indexnow";

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
  revalidatePath("/rss.xml");
  revalidatePath("/llms.txt");
  revalidatePath("/llms-full.txt");

  try {
    const result = await submitIndexNowUrls(paths);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("IndexNow submission failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      documentType: payload._type,
    });
    return NextResponse.json({ ok: false }, { status: 502 });
  }
}
