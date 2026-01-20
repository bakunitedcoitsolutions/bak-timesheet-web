/**
 * Authentication Helper Functions
 */

import { auth } from "./auth";
import { cache } from "@/lib/redis/upstash";

/**
 * Get current session on server side
 */
export async function getSession() {
  return await auth();
}

/**
 * Get current user on server side
 */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
}

/**
 * Check if user has permission for a feature
 */
export async function hasPermission(
  feature: string,
  permission: "full" | "add" | "edit" | "view"
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  // Admin has all permissions
  if (user.role === "Admin") return true;

  // Manager has all permissions except user management
  if (user.role === "Manager" && feature === "users") return false;
  if (user.role === "Manager") return true;

  // Branch Manager - check branch access
  if (user.role === "Branch Manager") {
    // Add branch-specific logic here
    return true;
  }

  // User with Privileges - check custom privileges
  if (user.role === "User with Privileges" && user.privileges) {
    const featurePrivileges = user.privileges[feature as keyof typeof user.privileges];
    if (!featurePrivileges) return false;

    if (permission === "full") {
      return featurePrivileges.full === true;
    }

    return featurePrivileges[permission] === true;
  }

  return false;
}

/**
 * Cache user session data
 */
export async function cacheUserSession(userId: number, data: any) {
  const key = `user:session:${userId}`;
  await cache.set(key, data, 30 * 60); // 30 minutes
}

/**
 * Get cached user session data
 */
export async function getCachedUserSession<T>(userId: number): Promise<T | null> {
  const key = `user:session:${userId}`;
  return cache.get<T>(key);
}
