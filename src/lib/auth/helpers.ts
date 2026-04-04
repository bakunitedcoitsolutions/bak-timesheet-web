/**
 * Authentication Helper Functions
 */

import { auth } from "./auth";
import { cache } from "@/lib/redis/upstash";
import { USER_ROLES } from "@/utils/user.utility";

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
export async function hasRole(
  role: string | string[] | number | number[]
): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.some((r) => Number(r) === Number(user.role));
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

  const roleId = Number(user.role);

  // Admin has all permissions
  if (roleId === USER_ROLES.ADMIN) return true;

  // Manager has all permissions except user management
  if (roleId === USER_ROLES.MANAGER && feature === "users") return false;
  if (roleId === USER_ROLES.MANAGER) return true;

  // Branch Manager - check branch access
  if (roleId === USER_ROLES.BRANCH_MANAGER) {
    // Add branch-specific logic here
    return true;
  }

  // Access-Enabled User & Branch User - check custom privileges
  if (
    (roleId === USER_ROLES.ACCESS_ENABLED ||
      roleId === USER_ROLES.BRANCH_USER) &&
    user.privileges
  ) {
    const featurePrivileges =
      user.privileges[feature as keyof typeof user.privileges];
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
export async function getCachedUserSession<T>(
  userId: number
): Promise<T | null> {
  const key = `user:session:${userId}`;
  return cache.get<T>(key);
}

/**
 * Get server-side access context
 * Centralized logic for branch-scoped permissions
 */
export async function getServerAccessContext() {
  const session = await auth();
  const roleId = session?.user?.roleId ? Number(session.user.roleId) : undefined;
  const userBranchId = session?.user?.branchId
    ? Number(session.user.branchId)
    : undefined;

  const isBranchScoped =
    roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER;

  return {
    isBranchScoped,
    userBranchId,
    roleId,
    session,
  };
}
