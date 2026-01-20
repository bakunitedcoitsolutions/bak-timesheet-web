/**
 * User Status Management
 * Handles checking and managing user active/inactive status
 */

import { prisma } from "@/lib/db";
import {
  invalidateUserSessions,
  clearSessionInvalidation,
  updateUserActiveStatusCache,
} from "./security";

/**
 * Check if user is active
 * Used to verify user status before allowing access
 */
export async function isUserActive(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  return user?.isActive ?? false;
}

/**
 * Deactivate user and invalidate all sessions
 * When admin deactivates a user, this should be called
 */
export async function deactivateUser(userId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Set user as inactive
    await tx.user.update({
      where: { id: userId },
      data: { isActive: false },
    });
  });

  // Invalidate all JWT tokens for this user
  await invalidateUserSessions(userId);

  // Update Redis cache immediately (so proxy checks fail fast)
  await updateUserActiveStatusCache(userId, false);
}

/**
 * Activate user
 * When admin reactivates a user
 */
export async function activateUser(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
  });

  // Clear session invalidation so user can log in again
  await clearSessionInvalidation(userId);

  // Update Redis cache immediately
  await updateUserActiveStatusCache(userId, true);
}

/**
 * Check user status and return error message if inactive
 */
export async function validateUserStatus(userId: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  const isActive = await isUserActive(userId);

  if (!isActive) {
    return {
      isValid: false,
      error:
        "Your account has been deactivated. Please contact an administrator.",
    };
  }

  return { isValid: true };
}
