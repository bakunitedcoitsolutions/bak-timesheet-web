/**
 * Upstash Redis Client
 * Used for caching, session storage, and rate limiting
 */

import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error(
    "Missing Upstash Redis environment variables. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN"
  );
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
  retry: {
    retries: 0, // Disable retries to fail fast
  },
});

/**
 * Cache helper functions
 */
export const cache = {
  /**
   * Get value from cache
   */
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const value = await redis.get<T>(key);
      return value;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set value in cache with optional expiration (in seconds)
   */
  set: async <T>(
    key: string,
    value: T,
    expiration?: number
  ): Promise<boolean> => {
    try {
      if (expiration) {
        await redis.setex(key, expiration, value);
      } else {
        await redis.set(key, value);
      }
      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Delete value from cache
   */
  delete: async (key: string): Promise<boolean> => {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Check if key exists
   */
  exists: async (key: string): Promise<boolean> => {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Set expiration on existing key
   */
  expire: async (key: string, seconds: number): Promise<boolean> => {
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
      return false;
    }
  },
};

export default redis;
