import { NextResponse, type NextRequest } from "next/server";
import {
  parseWhatsAppWebhookPayload,
  processParsedWhatsAppWebhookPayload,
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

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const parsed = parseWhatsAppWebhookPayload(payload);
  const crmSync = await processParsedWhatsAppWebhookPayload(parsed);

  if (!crmSync.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: crmSync.reason,
        messageCount: parsed.incomingMessages.length,
        statusCount: parsed.statuses.length,
      },
      { status: crmSync.reason === "missing_app_secret" ? 503 : 500 },
    );
  }

  return NextResponse.json({
    ok: crmSync.ok,
    messageCount: parsed.incomingMessages.length,
    statusCount: parsed.statuses.length,
    crmSync,
  });
}
