const { Redis } = require('@upstash/redis');

const ENABLED = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

let redis = null;
if (ENABLED) {
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });
}

async function get(key) {
  if (!redis) return null;
  try { return await redis.get(key); }
  catch (e) { console.error('[Cache] get error:', e.message); return null; }
}

async function set(key, value, ttlSeconds) {
  if (!redis) return;
  try { await redis.set(key, value, { ex: ttlSeconds }); }
  catch (e) { console.error('[Cache] set error:', e.message); }
}

async function invalidate(...keys) {
  if (!redis || !keys.length) return;
  try { await redis.del(...keys); }
  catch (e) { console.error('[Cache] del error:', e.message); }
}

// Scans for all keys matching a glob pattern and deletes them.
async function invalidatePattern(pattern) {
  if (!redis) return;
  try {
    const keys = [];
    let cursor = 0;
    do {
      const [next, batch] = await redis.scan(cursor, { match: pattern, count: 100 });
      keys.push(...batch);
      cursor = Number(next);
    } while (cursor !== 0);
    if (keys.length) await redis.del(...keys);
  }
  catch (e) { console.error('[Cache] invalidatePattern error:', e.message); }
}

module.exports = { get, set, invalidate, invalidatePattern };
