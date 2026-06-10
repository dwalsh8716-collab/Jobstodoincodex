import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

function safeRedirectPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  return value;
}

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();
  redirect(safeRedirectPath(request.nextUrl.searchParams.get("path")));
}
