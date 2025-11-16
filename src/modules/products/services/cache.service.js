import redis from "../../../config/redis.js";

class CacheService {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  async set(key, value, ttl = 600) {
    await redis.set(key, JSON.stringify(value), "Ex", ttl);
  }

  async del(key) {
    await redis.del(key);
  }

  async delMany(keys = []) {
    await redis.del(...keys);
  }
}

export default new CacheService();
