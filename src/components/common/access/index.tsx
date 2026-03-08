/**
 * Access Control Component & Hook
 *
 * Usage:
 *   <Access feature="loans" permission="add">
 *     <AddButton />   {/* only rendered if user can add loans *\/}
 *   </Access>
 *
 *   <Access role="Admin">…</Access>
 *   <Access role={["Admin", "Manager"]}>…</Access>
 *
 *   const { can, role, isAdmin } = useAccess();
 *   if (can("loans", "edit")) { … }
 */

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import type { UserPrivileges, FeaturePermissions } from "@/utils/user.utility";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Permission = "full" | "add" | "edit" | "view";

export type Feature = keyof UserPrivileges;

export interface AccessProps {
  /** Feature key from UserPrivileges (e.g. "loans", "payroll") */
  feature?: Feature;
  /** Required permission level on that feature */
  permission?: Permission;
  /** Required role(s). Checked independently from feature/permission. */
  role?: string | string[];
  /** What to render when access is denied. Defaults to null. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Core logic (shared between hook and component)
// ---------------------------------------------------------------------------

const FULL_ACCESS_ROLES = ["Admin", "Manager", "Branch Manager"] as const;

/**
 * Returns true if the user has the required permission for a feature.
 * @param role           - session.user.role
 * @param privileges     - session.user.privileges
 * @param feature        - feature key
 * @param permission     - required permission level (default "view")
 */
export function checkFeatureAccess(
  role: string,
  privileges: UserPrivileges | null | undefined,
  feature: Feature,
  permission: Permission = "view"
): boolean {
  // Admin & Manager always have full access
  if (role === "Admin") return true;

  // Manager: full access except user management
  if (role === "Manager") {
    return feature !== "usersManagement";
  }

  // Branch Manager: same as Manager (extend here if needed)
  if (role === "Branch Manager") {
    return feature !== "usersManagement";
  }

  // Access-Enabled User: check custom privilege map
  if (!privileges) return false;

  const featurePriv = privileges[feature] as FeaturePermissions | undefined;
  if (!featurePriv) return false;

  if (permission === "full") return featurePriv.full === true;
  // "full" grants access to any sub-permission
  if (featurePriv.full) return true;

  return featurePriv[permission] === true;
}

/**
 * Returns true if the user has the required role.
 */
export function checkRoleAccess(
  userRole: string,
  required: string | string[]
): boolean {
  const roles = Array.isArray(required) ? required : [required];
  return roles.includes(userRole);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAccessReturn {
  /** Current user's role string */
  role: string | undefined;
  /** Whether the session is still loading */
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  /**
   * Check if user can perform `permission` on `feature`.
   * Returns false while session is loading.
   */
  can: (feature: Feature, permission?: Permission) => boolean;
  /**
   * Check if user has one of the given roles.
   */
  hasRole: (role: string | string[]) => boolean;
}

export function useAccess(): UseAccessReturn {
  const { data: session, status } = useSession();

  const isLoading = status === "loading";
  const role = session?.user?.role;
  const privileges = session?.user?.privileges;

  const can = (feature: Feature, permission: Permission = "view"): boolean => {
    if (isLoading || !role) return false;
    return checkFeatureAccess(role, privileges, feature, permission);
  };

  const hasRole = (required: string | string[]): boolean => {
    if (isLoading || !role) return false;
    return checkRoleAccess(role, required);
  };

  return {
    role,
    isLoading,
    isAdmin: role === "Admin",
    isManager: role === "Manager",
    can,
    hasRole,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders children only when the current user satisfies the access rule.
 * Renders `fallback` (default: null) otherwise.
 *
 * Props are OR-combined: if **either** `role` or `feature/permission`
 * grants access, children are rendered.
 */
export function Access({
  feature,
  permission = "view",
  role,
  fallback = null,
  children,
}: AccessProps): React.ReactElement | null {
  const { data: session, status } = useSession();

  // While loading, render nothing to avoid flicker
  if (status === "loading") return null;

  const userRole = session?.user?.role ?? "";
  const privileges = session?.user?.privileges;

  let hasAccess = false;

  if (role) {
    hasAccess = checkRoleAccess(userRole, role);
  }

  if (!hasAccess && feature) {
    hasAccess = checkFeatureAccess(userRole, privileges, feature, permission);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default Access;
