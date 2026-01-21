/**
 * User Role Helper Functions
 * Utility functions for working with user roles
 */

/**
 * Check if a role has branch access (Branch Manager)
 * Role ID 3 = Branch Manager
 */
export function hasBranchAccess(userRoleId: number): boolean {
  return userRoleId === 3; // Branch Manager
}

/**
 * Check if a role requires branch assignment
 * Branch Manager must be assigned to a branch
 */
export function requiresBranchAssignment(userRoleId: number): boolean {
  return userRoleId === 3; // Branch Manager
}

/**
 * Get role name by ID
 */
export function getRoleName(userRoleId: number): string {
  const roleMap: Record<number, string> = {
    1: "Admin",
    2: "Manager",
    3: "Branch Manager",
    4: "Access-Enabled User",
  };
  return roleMap[userRoleId] || "Unknown";
}
