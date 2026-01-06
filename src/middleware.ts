import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple middleware that checks for session cookie
// The actual auth validation happens in the page components
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth required
  const publicRoutes = ["/login", "/api"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Static files and public routes - allow
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check for NextAuth session cookie
  const sessionToken = request.cookies.get("authjs.session-token") || 
                       request.cookies.get("__Secure-authjs.session-token");

  // If no session and trying to access protected route, redirect to login
  if (!sessionToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
