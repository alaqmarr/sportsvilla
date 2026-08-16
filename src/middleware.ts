import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  
  // Subdomain detection
  const isMemberSubdomain = host === "m.sportsvilla.co.in" || host === "m.sv.thewebsensei.dev" || host.startsWith("m.");
  const isPlaySubdomain =
    host === "play.sportsvilla.com" ||
    host === "play-beta.sportsvilla.com" ||
    host.startsWith("play.") ||
    host.startsWith("play-");
  
  // Ignore static assets (images, fonts, css, js) and APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
    return NextResponse.next();
  }

  // For API requests from play subdomain: inject sv_session cookie as Authorization header
  if (isPlaySubdomain && pathname.startsWith("/api")) {
    const sessionToken = req.cookies.get("sv_session")?.value;
    if (sessionToken) {
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("Authorization", `Bearer ${sessionToken}`);
      return NextResponse.next({ request: { headers: requestHeaders } });
    }
    return NextResponse.next();
  }

  // Skip API routes for non-play subdomains (original behavior)
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  
  // If on member subdomain, isolate to /m
  if (isMemberSubdomain) {
    if (!pathname.startsWith("/m")) {
      const url = req.nextUrl.clone();
      if (pathname === "/") {
        url.pathname = "/m";
      } else {
        url.pathname = `/m${pathname}`;
      }
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // If on play subdomain, isolate to /play
  if (isPlaySubdomain) {
    if (!pathname.startsWith("/play")) {
      const url = req.nextUrl.clone();
      url.pathname = pathname === "/" ? "/play" : `/play${pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Auth logic - strict public routes whitelist
  const isPublicRoute = 
    pathname.startsWith("/m") ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/t/") ||
    pathname.startsWith("/android") ||
    pathname.startsWith("/ios") ||
    pathname === "/login" ||
    pathname === "/onelogin" ||
    pathname === "/setup" ||
    pathname === "/downloads" ||
    pathname === "/privacy-policy" ||
    pathname === "/terms-and-conditions" ||
    pathname === "/terms" ||
    pathname === "/T&C" ||
    pathname === "/refund-policy" ||
    pathname === "/refund_policy" ||
    pathname === "/request-delete";

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check token for all admin and protected routes
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/onelogin";
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - all static files (.png, .svg, .jpg, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$).*)",
  ],
};
