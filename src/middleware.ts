import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: any) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  
  // Subdomain detection
  const isMemberSubdomain = host === "m.sportsvilla.co.in" || host === "m.sv.thewebsensei.dev" || host.startsWith("m.");
  
  // Ignore static assets (images, fonts, css, js) and APIs
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico") ||
    /\.(svg|png|jpg|jpeg|gif|webp|ico|css|js|woff|woff2|ttf|eot)$/i.test(pathname)
  ) {
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

  // Auth logic - strict public routes whitelist
  const isPublicRoute = 
    pathname.startsWith("/m") ||
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
    secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_development",
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
