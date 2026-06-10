import { NextResponse, type NextRequest } from "next/server";
import {
  verifyMetaSignature,
  verifyWhatsAppWebhookChallenge,
} from "@/lib/whatsapp-business/webhook";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const challenge = verifyWhatsAppWebhookChallenge({
    mode: searchParams.get("hub.mode"),
    token: searchParams.get("hub.verify_token"),
    challenge: searchParams.get("hub.challenge"),
  });

  if (challenge === null) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  return new NextResponse(challenge, { status: 200 });
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (
    process.env.WHATSAPP_BUSINESS_APP_SECRET &&
    !verifyMetaSignature({ rawBody, signature })
  ) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let statusCount = 0;
  try {
    const payload = JSON.parse(rawBody) as {
      entry?: Array<{
        changes?: Array<{
          value?: { statuses?: unknown[] };
        }>;
      }>;
    };

    statusCount =
      payload.entry?.reduce(
        (total, entry) =>
          total +
          (entry.changes?.reduce(
            (count, change) => count + (change.value?.statuses?.length || 0),
            0,
          ) || 0),
        0,
      ) || 0;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  return NextResponse.json({ ok: true, statusCount });
}
