import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse, type NextRequest } from "next/server";

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const path = safeRedirectPath(request.nextUrl.searchParams.get("path"));

  if (
    !process.env.SANITY_PREVIEW_SECRET ||
    secret !== process.env.SANITY_PREVIEW_SECRET
  ) {
    return NextResponse.json(
      { message: "Preview is not available." },
      { status: 401 },
    );
  }

  const draft = await draftMode();
  draft.enable();
  redirect(path);
}
