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

  // Check if changing from Branch Manager (roleId: 3) to another role
  const isChangingFromBranchManager = currentRoleId === 3 && finalRoleId !== 3;

  // Check if changing to Branch Manager (roleId: 3) from another role
  const isChangingToBranchManager = currentRoleId !== 3 && finalRoleId === 3;

  let branchIdToSet: number | null | undefined;

  if (isChangingFromBranchManager) {
    // Changing from Branch Manager (3) to Admin (1) or Manager (2) - clear branchId
    branchIdToSet = null;
  } else if (isChangingToBranchManager) {
    // Changing to Branch Manager (3) from Admin/Manager - must provide branchId
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
 * Validate that Branch Manager has a branchId
 *
 * @param roleId - User role ID
 * @param branchId - Branch ID to validate
 * @throws Error if Branch Manager (roleId: 3) doesn't have a branchId
 */
export function validateBranchManagerBranchId(
  roleId: number,
  branchId: number | null | undefined
): void {
  if (roleId === 3 && !branchId) {
    throw new Error("Branch Manager must be assigned to a branch");
  }
}
