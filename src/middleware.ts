import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
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
        // If they go to m.sportsvilla.co.in/1234567890 -> rewrite to /m/1234567890
        // If they go to m.sportsvilla.co.in/ -> rewrite to /m
        if (pathname === "/") {
          url.pathname = "/m";
        } else {
          url.pathname = `/m${pathname}`;
        }
        return NextResponse.rewrite(url);
      }
    }
    
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ req, token }) => {
        const host = req.headers.get("host") || "";
        const { pathname } = req.nextUrl;
        
        const isMemberSubdomain = host === "m.sportsvilla.co.in" || host === "m.sv.thewebsensei.dev" || host.startsWith("m.");
        
        // Let member subdomain bypass auth
        if (isMemberSubdomain) return true;
        
        // Let explicit /m paths bypass auth (in case they access via main domain)
        if (pathname.startsWith("/m")) return true;
        
        // Let public auth routes bypass auth
        if (pathname === "/login" || pathname === "/setup") return true;
        
        // API routes bypass auth (they have their own internal security if needed)
        if (pathname.startsWith("/api")) return true;
        
        // Everything else requires an admin session token
        return !!token;
      }
    }
  }
);

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
