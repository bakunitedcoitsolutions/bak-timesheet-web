/**
 * Security Utilities for Token Management
 * Handles token validation, refresh, and security measures
 */

import { prisma } from "@/lib/db";
import { cache } from "@/lib/redis";

/**
 * Token Security Configuration
 */
export const TOKEN_SECURITY = {
  // JWT token expiration (matches NextAuth config)
  MAX_AGE: 30 * 24 * 60 * 60, // 30 days in seconds

  // Session invalidation cache key prefix
  SESSION_INVALID_PREFIX: "session:invalid:",

  // User active status cache key prefix
  USER_ACTIVE_PREFIX: "user:active:",

  // Cache TTL for user active status
  // User status changes are handled immediately via updateUserActiveStatusCache
  // Longer TTL reduces DB calls while status changes are still immediate
  USER_ACTIVE_CACHE_TTL: 24 * 60 * 60, // 24 hours
} as const;

/**
 * Invalidate all sessions for a user
 * This forces them to re-authenticate on next request
 */
export async function invalidateUserSessions(userId: number): Promise<void> {
  const key = `${TOKEN_SECURITY.SESSION_INVALID_PREFIX}${userId}`;
  // Set expiration to match token max age
  await cache.set(key, true, TOKEN_SECURITY.MAX_AGE);
}

/**
 * Clear session invalidation (when user is reactivated)
 */
export async function clearSessionInvalidation(userId: number): Promise<void> {
  const key = `${TOKEN_SECURITY.SESSION_INVALID_PREFIX}${userId}`;
  await cache.delete(key);
}

/**
 * Get user active status from cache (fast check)
 * Falls back to database if not in cache
 *
 * Status changes are handled immediately via updateUserActiveStatusCache,
 * so we don't need to extend TTL on every cache hit (reduces Redis calls)
 */
export async function getUserActiveStatus(userId: number): Promise<boolean> {
  const cacheKey = `${TOKEN_SECURITY.USER_ACTIVE_PREFIX}${userId}`;

  // Try cache first (only 1 Redis call on cache hit)
  const cachedStatus = await cache.get<boolean>(cacheKey);
  if (cachedStatus !== null) {
    return cachedStatus;
  }

  // Cache miss - fetch from database (2 Redis calls: get + set)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  const isActive = user?.isActive ?? false;

  // Cache the result with TTL
  await cache.set(cacheKey, isActive, TOKEN_SECURITY.USER_ACTIVE_CACHE_TTL);

  return isActive;
}

/**
 * Update user active status in cache
 * Called immediately when user status changes (via user.service.ts or user-status.ts)
 *
 * This ensures status changes take effect immediately without waiting for cache expiration
 */
export async function updateUserActiveStatusCache(
  userId: number,
  isActive: boolean
): Promise<void> {
  const cacheKey = `${TOKEN_SECURITY.USER_ACTIVE_PREFIX}${userId}`;
  await cache.set(cacheKey, isActive, TOKEN_SECURITY.USER_ACTIVE_CACHE_TTL);
}
