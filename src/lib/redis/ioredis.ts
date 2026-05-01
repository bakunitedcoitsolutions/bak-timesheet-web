// "use server";
/**
 * Redis Client (ioredis)
 * Used for caching, session storage, and rate limiting
 */

import Redis, { RedisOptions } from "ioredis";

const REDIS_URL = process.env.REDIS_URL;
const REDIS_PORT = process.env.REDIS_PORT;
const REDIS_HOST = process.env.REDIS_HOST;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
const REDIS_USERNAME = process.env.REDIS_USERNAME;

const redisOptions: RedisOptions = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
  username: REDIS_USERNAME,
  maxRetriesPerRequest: 0, // Disable retries to fail fast
};

export const redis = new Redis(!!REDIS_URL ? REDIS_URL : (redisOptions as any));

// Add error listener to prevent "Unhandled error event" crashes
redis.on("connect", () => {
  console.log("Redis connected");
});

redis.on("ready", () => {
  console.log("Redis ready to use");
});

redis.on("error", (error) => {
  console.error("Redis connection error:", error.message);
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
      const value = await redis.get(key);
      if (value === null) return null;
      try {
        // Attempt to parse as JSON, fallback to raw value
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      console.log(`Cache get error for key ${key}:`, error);
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
      const stringValue =
        typeof value === "string" ? value : JSON.stringify(value);
      if (expiration) {
        await redis.setex(key, expiration, stringValue);
      } else {
        await redis.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.log(`Cache set error for key ${key}:`, error);
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
      console.log(`Cache delete error for key ${key}:`, error);
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
      console.log(`Cache exists error for key ${key}:`, error);
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
      console.log(`Cache expire error for key ${key}:`, error);
      return false;
    }
  },
};

export default redis;
