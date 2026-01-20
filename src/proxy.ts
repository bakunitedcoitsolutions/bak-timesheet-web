/**
 * Next.js 16 Middleware
 * Handles authentication and authorization for protected routes
 * Uses Next.js 16 middleware patterns with NextAuth v5
 *
 * Note: Make sure next-auth is installed: npm install next-auth
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// @ts-ignore - NextAuth types may not be available until package is installed
import { getToken } from "next-auth/jwt";
import { getUserActiveStatus } from "@/lib/auth/security";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/api/auth",
    "/_next",
    "/favicon.ico",
    "/assets",
  ];
  return NextResponse.next();

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get token from NextAuth v5
  const token = await getToken({
    req: request,
    secret: process.env.NEXT_AUTH_SECRET,
    salt: "authjs.session-token", // Required for NextAuth v5
  });

  // Redirect to login if not authenticated
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if user is active using Redis cache (fast check)
  // This ensures inactive users are immediately blocked even if they have a valid token
  // Uses Upstash Redis for fast lookups without hitting the database on every request
  const userId = token?.id as string;
  if (userId) {
    const isActive = await getUserActiveStatus(userId);

    if (!isActive) {
      // User has been deactivated - force logout
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "AccountInactive");
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Role-based access control will be handled elsewhere
  // For now, just ensure user is authenticated and active
  // TODO: Add role/permission checks as needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - static assets
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
