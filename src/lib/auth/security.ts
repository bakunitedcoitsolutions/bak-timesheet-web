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

  // Refresh token before expiration (in seconds)
  REFRESH_THRESHOLD: 7 * 24 * 60 * 60, // 7 days before expiration

  // Rate limiting for login attempts
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60, // 15 minutes

  // Session invalidation cache key prefix
  SESSION_INVALID_PREFIX: "session:invalid:",

  // User active status cache key prefix
  USER_ACTIVE_PREFIX: "user:active:",

  // Cache TTL for user active status (5 minutes - balance between freshness and performance)
  USER_ACTIVE_CACHE_TTL: 5 * 60, // 5 minutes
} as const;

/**
 * Check if a token/session is invalidated
 * Used to force logout users (e.g., when admin deactivates them)
 */
export async function isSessionInvalidated(userId: string): Promise<boolean> {
  const key = `${TOKEN_SECURITY.SESSION_INVALID_PREFIX}${userId}`;
  const invalidated = await cache.get<boolean>(key);
  return invalidated === true;
}

/**
 * Invalidate all sessions for a user
 * This forces them to re-authenticate on next request
 */
export async function invalidateUserSessions(userId: string): Promise<void> {
  const key = `${TOKEN_SECURITY.SESSION_INVALID_PREFIX}${userId}`;
  // Set expiration to match token max age
  await cache.set(key, true, TOKEN_SECURITY.MAX_AGE);

  // Also delete all database sessions if using database strategy
  // await prisma.sess.deleteMany({
  //   where: { userId },
  // });
}

/**
 * Clear session invalidation (when user is reactivated)
 */
export async function clearSessionInvalidation(userId: string): Promise<void> {
  const key = `${TOKEN_SECURITY.SESSION_INVALID_PREFIX}${userId}`;
  await cache.delete(key);
}

/**
 * Track failed login attempts for rate limiting
 */
export async function recordFailedLoginAttempt(
  email: string
): Promise<{ attempts: number; locked: boolean }> {
  const key = `login:attempts:${email}`;
  const attempts = (await cache.get<number>(key)) || 0;
  const newAttempts = attempts + 1;

  if (newAttempts >= TOKEN_SECURITY.MAX_LOGIN_ATTEMPTS) {
    // Lock account for specified duration
    await cache.set(key, newAttempts, TOKEN_SECURITY.LOGIN_LOCKOUT_DURATION);
    return { attempts: newAttempts, locked: true };
  }

  await cache.set(key, newAttempts, TOKEN_SECURITY.LOGIN_LOCKOUT_DURATION);
  return { attempts: newAttempts, locked: false };
}

/**
 * Clear failed login attempts (on successful login)
 */
export async function clearFailedLoginAttempts(email: string): Promise<void> {
  const key = `login:attempts:${email}`;
  await cache.delete(key);
}

/**
 * Check if account is locked due to failed attempts
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const key = `login:attempts:${email}`;
  const attempts = (await cache.get<number>(key)) || 0;
  return attempts >= TOKEN_SECURITY.MAX_LOGIN_ATTEMPTS;
}

/**
 * Generate secure token identifier for tracking
 */
export function generateTokenId(): string {
  return `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate token expiration
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt * 1000;
}

/**
 * Get time until token expiration (in seconds)
 */
export function getTokenExpirationTime(expiresAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, expiresAt - now);
}

/**
 * Get user active status from cache (fast check)
 * Falls back to database if not in cache
 */
export async function getUserActiveStatus(userId: string): Promise<boolean> {
  const cacheKey = `${TOKEN_SECURITY.USER_ACTIVE_PREFIX}${userId}`;

  // Try cache first
  const cachedStatus = await cache.get<boolean>(cacheKey);
  if (cachedStatus !== null) {
    return cachedStatus;
  }

  // Cache miss - fetch from database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  const isActive = user?.isActive ?? false;

  // Cache the result
  await cache.set(cacheKey, isActive, TOKEN_SECURITY.USER_ACTIVE_CACHE_TTL);

  return isActive;
}

/**
 * Update user active status in cache
 * Called when user status changes
 */
export async function updateUserActiveStatusCache(
  userId: string,
  isActive: boolean
): Promise<void> {
  const cacheKey = `${TOKEN_SECURITY.USER_ACTIVE_PREFIX}${userId}`;
  await cache.set(cacheKey, isActive, TOKEN_SECURITY.USER_ACTIVE_CACHE_TTL);
}

/**
 * Invalidate user active status cache
 * Forces next check to fetch from database
 */
export async function invalidateUserActiveStatusCache(
  userId: string
): Promise<void> {
  const cacheKey = `${TOKEN_SECURITY.USER_ACTIVE_PREFIX}${userId}`;
  await cache.delete(cacheKey);
}
