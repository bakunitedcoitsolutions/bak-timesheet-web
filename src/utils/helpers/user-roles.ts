/**
 * User Role Helper Functions
 * Utility functions for working with user roles
 */
import { USER_ROLES } from "@/utils/user.utility";

/**
 * Check if a role has branch access (Branch Manager)
 * Role ID 3 = Branch Manager
 */
export function hasBranchAccess(userRoleId: number): boolean {
  return userRoleId === USER_ROLES.BRANCH_MANAGER; // Branch Manager
}

/**
 * Check if a role requires branch assignment
 * Branch Manager must be assigned to a branch
 */
export function requiresBranchAssignment(userRoleId: number): boolean {
  return userRoleId === USER_ROLES.BRANCH_MANAGER; // Branch Manager
}

/**
 * Get role name by ID
 */
export function getRoleName(userRoleId: number): string {
  const roleMap: Record<number, string> = {
    [USER_ROLES.ADMIN]: "Admin",
    [USER_ROLES.MANAGER]: "Manager",
    [USER_ROLES.BRANCH_MANAGER]: "Branch Manager",
    [USER_ROLES.ACCESS_ENABLED]: "Access-Enabled User",
  };
  return roleMap[userRoleId] || "Unknown";
}
