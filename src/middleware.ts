import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  
  // Subdomain detection
  const isMemberSubdomain = host === "m.sportsvilla.co.in" || host === "m.sv.thewebsensei.dev" || host.startsWith("m.");
  
  // Ignore static assets and APIs for rewrites
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes("favicon.ico")) {
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

  // Auth logic
  if (pathname.startsWith("/m") || pathname === "/login" || pathname === "/setup" || pathname === "/downloads" || pathname === "/privacy-policy" || pathname === "/request-delete") {
    return NextResponse.next();
  }

  // Check token
  const token = await getToken({ 
    req, 
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
    secureCookie: process.env.NODE_ENV === "production"
  });

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
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
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
