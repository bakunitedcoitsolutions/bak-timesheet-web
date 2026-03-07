/**
 * Next.js Middleware Proxy
 * Handles authentication and authorization for protected routes
 */

import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/auth.config";

const { auth } = NextAuth(authConfig);

// Define the route to feature mapping
const ROUTE_FEATURE_MAP: Record<string, string> = {
  "/employees": "employees",
  "/timesheet": "timesheet",
  "/projects": "projects",
  "/loans": "loans",
  "/violations": "trafficViolations",
  "/exit-reentry": "exitReentry",
  "/payroll": "payroll",
  "/ledger": "ledger",
  "/users": "usersManagement",
  "/reports": "reports",
  "/setup": "setup",
};

export const proxy = auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  // Public paths that do not require authentication
  const isPublicPath =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".");

  // If user is not logged in and it's not a public path, redirect to login
  if (!isLoggedIn && !isPublicPath) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in, restrict access to the login page
  if (isLoggedIn && pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Privilege-based Authorization checks for Access-Enabled Users (roleId: 4)
  if (isLoggedIn && req.auth) {
    const user = req.auth.user as any;
    const roleId = user.roleId as number;

    // Only apply restriction logic to Access-Enabled User (Role ID 4)
    if (roleId === 4) {
      // Find the base protected route the path matches
      const matchedRoute = Object.keys(ROUTE_FEATURE_MAP).find(
        (route) => pathname === route || pathname.startsWith(`${route}/`)
      );

      if (matchedRoute) {
        const featureKey = ROUTE_FEATURE_MAP[matchedRoute];
        const userPrivileges = user.privileges || {};
        const featurePermissions = userPrivileges[featureKey] || {};

        // Deny access if they don't have at least 'view' or 'full' permissions
        if (!featurePermissions.view && !featurePermissions.full) {
          // Redirect to the dashboard
          return NextResponse.redirect(new URL("/", req.nextUrl.origin));
        }
      }
    }
  }

  return NextResponse.next();
});

// Configure matcher to limit the scope of the middleware
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
