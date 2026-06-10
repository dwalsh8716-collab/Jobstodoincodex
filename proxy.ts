import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CMS_SESSION_COOKIE, isCmsSessionValid } from "@/lib/cms-auth";

export async function proxy(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith("/studio")) {
    return NextResponse.next();
  }

  const session = request.cookies.get(CMS_SESSION_COOKIE)?.value;
  const loggedIn = await isCmsSessionValid(session);

  if (loggedIn) {
    return NextResponse.next();
  }

  const cmsUrl = request.nextUrl.clone();
  cmsUrl.pathname = "/cms";
  cmsUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(cmsUrl);
}

export const config = {
  matcher: ["/studio/:path*"]
};

