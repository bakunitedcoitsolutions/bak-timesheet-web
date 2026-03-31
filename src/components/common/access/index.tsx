/**
 * Access Control Component & Hook
 *
 * Usage:
 *   // Sidebar — just check if feature section is enabled (any access)
 *   <Access feature="loans">
 *     <SidebarItem />
 *   </Access>
 *
 *   // Inside the page — check a specific action
 *   <Access feature="loans" permission="add">
 *     <AddButton />
 *   </Access>
 *
 *   const { can, canAccess, isAdmin } = useAccess();
 *   canAccess("loans")         // feature enabled? (sidebar)
 *   can("loans", "edit")       // specific action? (inside page)
 *   if (isAdmin) { … }
 */

"use client";

import React from "react";
import { useSession } from "next-auth/react";
import type {
  UserPrivileges,
  FeaturePermissions,
  UserRole,
} from "@/utils/user.utility";
import { USER_ROLES } from "@/utils/user.utility";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Permission = "full" | "add" | "edit" | "view";

export type Feature = keyof UserPrivileges;

export interface AccessProps {
  /** Feature key from UserPrivileges (e.g. "loans", "payroll") */
  feature: Feature;
  /**
   * Required permission level.
   * Omit to just check if the feature section is enabled (use for sidebar items).
   * Specify to check a specific action (use for buttons/forms inside the page).
   */
  permission?: Permission;
  /** Optional — specific report ID when checking report-level permissions */
  reportId?: string;
  /** Optional — specific filter key when checking report filter permissions */
  filterKey?: string;
  /** What to render when access is denied. Defaults to null. */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Core logic (shared between hook and component)
// ---------------------------------------------------------------------------

/**
 * Checks if a feature section is enabled at all — regardless of which
 * sub-permissions are set. Use this for sidebar visibility.
 *
 * An Access-Enabled User has access to a feature section if the key
 * exists in their privilege map (even if no sub-permissions are ticked).
 */
export function checkFeatureEnabled(
  role: UserRole | string | number,
  privileges: UserPrivileges | null | undefined,
  feature: Feature
): boolean {
  const roleId = Number(role);
  if (roleId === USER_ROLES.ADMIN) return true;
  if (roleId === USER_ROLES.MANAGER || roleId === USER_ROLES.BRANCH_MANAGER) {
    return feature !== "usersManagement" && feature !== "setup";
  }
  // Access-Enabled User: feature must exist in their privilege map
  if (!privileges) return false;
  return feature in privileges && privileges[feature] != null;
}

/**
 * Checks if the user can perform a specific permission on a feature.
 * Use this for action-level checks (add button, edit form, etc.).
 */
export function checkFeatureAccess(
  role: UserRole | string | number,
  privileges: UserPrivileges | null | undefined,
  feature: Feature,
  permission: Permission
): boolean {
  const roleId = Number(role);
  // Admin & Manager always have full access
  if (roleId === USER_ROLES.ADMIN) return true;

  // Manager: full access except user management and setup
  if (roleId === USER_ROLES.MANAGER || roleId === USER_ROLES.BRANCH_MANAGER) {
    return feature !== "usersManagement" && feature !== "setup";
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
 * Checks if a specific filter for a specific report is enabled.
 */
export function checkReportFilterAccess(
  role: UserRole | string | number,
  privileges: UserPrivileges | null | undefined,
  reportId: string
): boolean {
  const roleId = Number(role);
  // Admin & Manager usually have access to all filters
  if (roleId === USER_ROLES.ADMIN) return true;
  if (roleId === USER_ROLES.MANAGER || roleId === USER_ROLES.BRANCH_MANAGER) {
    return true;
  }

  if (!privileges || !privileges.reports) return false;

  const reportItems = privileges.reports.items || [];
  const report = reportItems.find((r) => r.reportId === reportId);

  // If report is not enabled or doesn't exist, they can't see the filter
  if (!report || !report.enabled) return false;

  // If filters are not defined, assume full access to filters if report is enabled
  if (!report.filters || report.filters.length === 0) return true;
  return report?.filters?.every((f) => f.enabled);
}

/**
 * Returns true if the user has the required role.
 */
export function checkRoleAccess(
  userRole: UserRole | string | number,
  required: UserRole | UserRole[] | string | string[] | number | number[]
): boolean {
  const roles = Array.isArray(required) ? required : [required];
  return roles.some((r) => Number(r) === Number(userRole));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAccessReturn {
  /** Current user's role */
  role: UserRole | undefined;
  /** Whether the session is still loading */
  isLoading: boolean;
  isAdmin: boolean;
  isManager: boolean;
  isBranchManager: boolean;
  isBranchUser: boolean;
  isBranchScoped: boolean;
  /** The branch ID assigned to this user (if any) */
  branchId: number | null | undefined;
  /**
   * Check if a feature section is enabled (for sidebar items).
   * Returns true if the user has ANY access to the feature.
   */
  canAccess: (feature: Feature) => boolean;
  /**
   * Check if user can perform a specific permission on a feature (for action buttons).
   */
  can: (feature: Feature, permission: Permission) => boolean;
  /**
   * Check if user has one of the given roles.
   */
  hasRole: (role: UserRole | UserRole[]) => boolean;
  /**
   * Check if a specific filter is enabled for a report.
   */
  canAccessFilter: (reportId: string) => boolean;
  privileges: UserPrivileges | null | undefined;
}

export function useAccess(): UseAccessReturn {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const roleId = (session?.user as any)?.roleId as number | undefined;
  const privileges = session?.user?.privileges;
  const canAccess = (feature: Feature): boolean => {
    if (isLoading || !roleId) return false;
    return checkFeatureEnabled(roleId, privileges, feature);
  };

  const can = (feature: Feature, permission: Permission): boolean => {
    if (isLoading || !roleId) return false;
    return checkFeatureAccess(roleId, privileges, feature, permission);
  };

  const hasRole = (required: UserRole | UserRole[]): boolean => {
    if (isLoading || !roleId) return false;
    return checkRoleAccess(roleId, required);
  };

  const canAccessFilter = (reportId: string): boolean => {
    if (isLoading || !roleId) return false;
    return checkReportFilterAccess(roleId, privileges, reportId);
  };

  return {
    role: roleId as UserRole | undefined,
    isLoading,
    isAdmin: roleId === USER_ROLES.ADMIN,
    isManager: roleId === USER_ROLES.MANAGER,
    isBranchManager: roleId === USER_ROLES.BRANCH_MANAGER,
    isBranchUser: roleId === USER_ROLES.BRANCH_USER,
    isBranchScoped:
      roleId === USER_ROLES.BRANCH_MANAGER || roleId === USER_ROLES.BRANCH_USER,
    branchId: (session?.user as any)?.branchId as number | undefined,
    canAccess,
    can,
    hasRole,
    canAccessFilter,
    privileges,
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
  reportId,
  filterKey,
  fallback = null,
  children,
}: AccessProps): React.ReactElement | null {
  const { data: session, status } = useSession();

  // While loading, render nothing to avoid flicker
  if (status === "loading") return null;

  const userRoleId = (session?.user as any)?.roleId as number | undefined;
  const privileges = session?.user?.privileges;

  let hasAccess = false;

  if (reportId && filterKey) {
    hasAccess = checkReportFilterAccess(userRoleId || 0, privileges, reportId);
  } else {
    hasAccess = permission
      ? checkFeatureAccess(userRoleId || 0, privileges, feature, permission)
      : checkFeatureEnabled(userRoleId || 0, privileges, feature);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

export default Access;
