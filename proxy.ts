import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { CMS_SESSION_COOKIE, isCmsSessionValid } from "@/lib/cms-auth";

const retiredServiceRedirects = [
  {
    prefixes: ["/leadership-search", "/services/leadership-search"],
    destination: "/services/retained-search",
  },
  {
    prefixes: [
      "/strategic-interim",
      "/fractional",
      "/fractional-marketing",
      "/fractional-marketing-leaders",
      "/fractional-strategic-interim",
      "/services/strategic-interim",
      "/services/fractional-strategic-interim",
    ],
    destination: "/services/fractional",
  },
  {
    prefixes: ["/senior-recruitment", "/services/senior-recruitment"],
    destination: "/services/permanent-recruitment",
  },
  {
    prefixes: [
      "/agency-recruitment",
      "/client-side-recruitment",
      "/marketing-recruitment",
      "/services/agency-recruitment",
      "/services/client-side-marketing-recruitment",
    ],
    destination: "/specialisms",
  },
  {
    prefixes: ["/services/market-intelligence-hiring-advisory"],
    destination: "/services/market-intelligence-advisory",
  },
  {
    prefixes: ["/insights/what-is-a-strategic-interim-marketing-leader"],
    destination: "/insights/what-is-a-fractional-marketing-leader",
  },
] as const;

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname.replace(/\/$/, "") || "/";
  const retiredServiceRedirect = retiredServiceRedirects.find(({ prefixes }) =>
    prefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    ),
  );

  if (retiredServiceRedirect) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = retiredServiceRedirect.destination;
    return NextResponse.redirect(redirectUrl, 301);
  }

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
  cmsUrl.searchParams.set(
    "next",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.redirect(cmsUrl);
}

export const config = {
  matcher: [
    "/studio/:path*",
    "/leadership-search/:path*",
    "/strategic-interim/:path*",
    "/fractional/:path*",
    "/fractional-marketing/:path*",
    "/fractional-marketing-leaders/:path*",
    "/fractional-strategic-interim/:path*",
    "/senior-recruitment/:path*",
    "/agency-recruitment/:path*",
    "/client-side-recruitment/:path*",
    "/marketing-recruitment/:path*",
    "/services/leadership-search/:path*",
    "/services/strategic-interim/:path*",
    "/services/senior-recruitment/:path*",
    "/services/agency-recruitment/:path*",
    "/services/client-side-marketing-recruitment/:path*",
    "/services/fractional-strategic-interim/:path*",
    "/services/market-intelligence-hiring-advisory/:path*",
    "/insights/what-is-a-strategic-interim-marketing-leader/:path*",
  ],
};
