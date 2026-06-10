import { NextResponse } from "next/server";
import { CMS_SESSION_COOKIE } from "@/lib/cms-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/cms", request.url), { status: 303 });
  const secureCookie = new URL(request.url).protocol === "https:";
  response.cookies.set({
    name: CMS_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: secureCookie,
    sameSite: "lax",
    maxAge: 0,
    path: "/"
  });
  return response;
}
