import Redis from "ioredis";

export const REDIS_HOST = process.env.REDIS_HOST as string;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
export const REDIS_DB = parseInt(process.env.REDIS_DB || "0");
export const REDIS_CACHE_TTL = parseInt(process.env.REDIS_CACHE_TTL || "3600");

export const redis = createRedisConn();

function createRedisConn(): Redis | undefined {
  if (REDIS_HOST) {
    try {
      return new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: REDIS_DB,
      });
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
    }
  }
}

export async function getRedisValue(key: string): Promise<string | null> {
  if (redis) {
    const res = await redis.get(key);
    if (res) {
      console.info(
        `Redis cache hit for key: ${key} (value length: ${res.length})`,
      );
      return res;
    }
  }

  return null;
}

export async function setRedisValue(
  key: string,
  value: string,
): Promise<boolean> {
  if (redis) {
    if ((await redis.set(key, value)) === "OK") {
      if (REDIS_CACHE_TTL > 0) {
        await redis.expire(key, REDIS_CACHE_TTL);
      }
      console.info(
        `Redis cache set for key: ${key} (value length: ${value.length}, ttl: ${REDIS_CACHE_TTL})`,
      );
      return true;
    }
  }
  return false;
}

export async function getJsonRedisValue<T>(key: string): Promise<T | null> {
  const res = await getRedisValue(key);

  try {
    return res ? (JSON.parse(res) as T) : null;
  } catch (error) {
    console.error("Failed to parse JSON from Redis:", error);
    return null;
  }
}

export async function setJsonRedisValue<T>(
  key: string,
  value: T,
): Promise<boolean> {
  try {
    return await setRedisValue(key, JSON.stringify(value));
  } catch (error) {
    console.error("Failed to stringify JSON for Redis:", error);
    return false;
  }
}
