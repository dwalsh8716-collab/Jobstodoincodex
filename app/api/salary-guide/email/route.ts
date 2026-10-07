import { sendGuideEmail } from "@/lib/salary-guide-email";
import { siteConfig } from "@/lib/site";

export const runtime = "nodejs";

function response(ok: boolean, status: number) {
  return Response.json(
    { ok },
    {
      status,
      headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" },
    },
  );
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const local =
    !process.env.RAILWAY_ENVIRONMENT_ID &&
    ["localhost", "127.0.0.1"].includes(url.hostname);
  const allowedOrigins = local
    ? [`http://127.0.0.1:${url.port}`, `http://localhost:${url.port}`]
    : [siteConfig.url];
  if (
    !allowedOrigins.includes(request.headers.get("origin") || "") ||
    !request.headers.get("content-type")?.startsWith("application/json")
  )
    return response(false, 403);
  // Limit actual streamed bytes, not just the user-controlled Content-Length.
  const reader = request.body?.getReader();
  if (!reader) return response(false, 400);
  try {
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return response(false, 413);
      }
      chunks.push(value);
    }
    const input: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const result = await sendGuideEmail(input, ip);
    return response(result.ok, result.status);
  } catch {
    return response(false, 400);
  }
}
