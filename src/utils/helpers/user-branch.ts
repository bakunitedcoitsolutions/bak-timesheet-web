/**
 * User Branch Helper Functions
 * Utility functions for handling branchId logic based on user role changes
 */

/**
 * Determine the branchId value for user update based on role changes
 *
 * @param currentRoleId - Current user role ID
 * @param newRoleId - New user role ID (if changing)
 * @param currentBranchId - Current user branch ID
 * @param providedBranchId - Branch ID provided in update data (optional)
 * @returns Object with branchId to set and final branchId for validation
 */
export function determineBranchIdForUpdate(
  currentRoleId: number,
  newRoleId: number | undefined,
  currentBranchId: number | null,
  providedBranchId: number | null | undefined
): {
  branchIdToSet: number | null | undefined;
  finalBranchId: number | null;
} {
  const finalRoleId = newRoleId !== undefined ? newRoleId : currentRoleId;

  // Roles that require a branch assignment (3: Branch Manager, 5: Branch User)
  const isScopedRole = (roleId: number) => roleId === 3 || roleId === 5;

  // Check if changing from a scoped role to another role
  const isChangingFromScopedRole =
    isScopedRole(currentRoleId) && !isScopedRole(finalRoleId);

  // Check if changing to a scoped role from another role
  const isChangingToScopedRole =
    !isScopedRole(currentRoleId) && isScopedRole(finalRoleId);

  let branchIdToSet: number | null | undefined;

  if (isChangingFromScopedRole) {
    // Changing from Scoped Role (3, 5) to Admin (1) or Manager (2) - clear branchId
    branchIdToSet = null;
  } else if (isChangingToScopedRole) {
    // Changing to Scoped Role (3, 5) from Admin/Manager - must provide branchId
    // Use provided branchId (validation will catch if not provided)
    branchIdToSet = providedBranchId;
  } else if (providedBranchId !== undefined) {
    // If branchId is explicitly provided and not changing roles, use it
    branchIdToSet = providedBranchId;
  }
  // Otherwise, branchIdToSet remains undefined (not included in update, Prisma keeps current value)

  // Determine final branchId for validation
  const finalBranchId =
    branchIdToSet !== undefined ? branchIdToSet : (currentBranchId ?? null);

  return {
    branchIdToSet,
    finalBranchId,
  };
}

/**
 * Validate that scoped users (Branch Manager or Branch User) have a branchId
 *
 * @param roleId - User role ID
 * @param branchId - Branch ID to validate
 * @throws Error if scoped user doesn't have a branchId
 */
export function validateBranchManagerBranchId(
  roleId: number,
  branchId: number | null | undefined
): void {
  // Scoped User roles: Branch Manager (3), Branch User (5)
  if ((roleId === 3 || roleId === 5) && !branchId) {
    const roleName = roleId === 3 ? "Branch Manager" : "Branch User";
    throw new Error(`${roleName} must be assigned to a branch`);
  }
}
