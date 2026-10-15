import Redis from "ioredis";

// Singleton Redis instance across hot-reloads
declare global {
  // eslint-disable-next-line no-var
  var __redisClient: Redis | null | undefined;
}

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

export function getRedisClient(): Redis | null {
  if (process.env.ENABLE_REDIS === "false") {
    return null;
  }

  if (!global.__redisClient) {
    try {
      const client = new Redis(REDIS_URL, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2000,
        lazyConnect: true,
        retryStrategy(times) {
          if (times > 3) return null;
          return Math.min(times * 100, 1000);
        },
      });

      client.on("error", (err) => {
        console.warn("[Redis] Connection notice:", err.message);
      });

      global.__redisClient = client;
    } catch (err: any) {
      console.warn("[Redis] Failed to initialize client:", err.message);
      return null;
    }
  }

  return global.__redisClient;
}

/**
 * Get cached JSON data
 */
export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;

  try {
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }
    const data = await client.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  } catch (err) {
    console.warn(`[Redis] getCache error for key ${key}:`, err);
    return null;
  }
}

/**
 * Set cached JSON data with TTL
 */
export async function setCache(
  key: string,
  value: any,
  ttlSeconds: number = 180
): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }
    const serialized = JSON.stringify(value);
    if (ttlSeconds > 0) {
      await client.set(key, serialized, "EX", ttlSeconds);
    } else {
      await client.set(key, serialized);
    }
  } catch (err) {
    console.warn(`[Redis] setCache error for key ${key}:`, err);
  }
}

/**
 * Delete one or multiple cache keys (supports glob pattern like "creators:*")
 */
export async function deleteCache(patternOrKey: string): Promise<void> {
  const client = getRedisClient();
  if (!client) return;

  try {
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }

    if (patternOrKey.includes("*")) {
      const keys = await client.keys(patternOrKey);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.del(patternOrKey);
    }
  } catch (err) {
    console.warn(`[Redis] deleteCache error for ${patternOrKey}:`, err);
  }
}

/**
 * Sliding Window Rate Limiter
 * Returns { allowed, remaining, reset }
 */
export async function checkRateLimit(
  identifier: string,
  limit: number = 60,
  windowSeconds: number = 60
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  const client = getRedisClient();
  if (!client) {
    return { allowed: true, remaining: limit, reset: 0 };
  }

  const key = `ratelimit:${identifier}`;
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  try {
    if (client.status !== "ready") {
      await client.connect().catch(() => {});
    }

    const multi = client.multi();
    // 1. Remove old timestamps outside current window
    multi.zremrangebyscore(key, 0, windowStart);
    // 2. Count requests in current window
    multi.zcard(key);
    // 3. Add current timestamp
    multi.zadd(key, now, `${now}-${Math.random()}`);
    // 4. Set expiry on the zset
    multi.expire(key, windowSeconds);

    const results = await multi.exec();
    const currentCount = (results?.[1]?.[1] as number) || 0;

    const allowed = currentCount < limit;
    const remaining = Math.max(0, limit - currentCount - 1);
    const reset = Math.ceil(windowSeconds);

    return { allowed, remaining, reset };
  } catch (err) {
    console.warn("[Redis] Rate limiter error:", err);
    return { allowed: true, remaining: limit, reset: 0 };
  }
}

/**
 * Session Cache Helper (for /api/auth/me)
 */
export async function cacheSession(
  token: string,
  userData: any,
  ttlSeconds: number = 3600
): Promise<void> {
  await setCache(`session:${token}`, userData, ttlSeconds);
}

export async function getCachedSession<T>(token: string): Promise<T | null> {
  return await getCache<T>(`session:${token}`);
}

export async function invalidateSession(token: string): Promise<void> {
  await deleteCache(`session:${token}`);
}

/**
 * Realtime Chat Pub/Sub Event Publishing
 */
export async function publishChatEvent(channel: string, event: any): Promise<void> {
  const client = getRedisClient();
  if (!client) return;
  try {
    if (client.status !== 'ready') {
      await client.connect().catch(() => {});
    }
    await client.publish(channel, JSON.stringify(event));
  } catch (err) {
    console.warn(`[Redis] publishChatEvent error on ${channel}:`, err);
  }
}

/**
 * Realtime Chat Dedicated Redis Subscriber
 */
export function createRedisSubscriber(): Redis | null {
  if (process.env.ENABLE_REDIS === "false") return null;
  try {
    const subscriber = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 100, 1000);
      },
    });
    subscriber.on("error", (err) => {
      console.warn("[Redis Subscriber] notice:", err.message);
    });
    return subscriber;
  } catch {
    return null;
  }
}
