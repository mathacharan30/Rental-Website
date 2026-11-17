const { Redis } = require('@upstash/redis');
const { waitUntil } = require('@vercel/functions');

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

// Saving to the cache happens in the BACKGROUND: the response is sent first and the
// write finishes afterwards. Reads come from the nearby Mumbai read replica, but
// writes go to the Redis primary in the US (~200 ms), so a cache miss shouldn't make
// the customer wait for it. On Vercel, waitUntil keeps the function alive until the
// write completes; on a long-running local server the promise simply finishes.
// Callers may still `await cache.set(...)` — it now resolves immediately.
async function set(key, value, ttlSeconds) {
  if (!redis) return;
  const write = redis
    .set(key, value, { ex: ttlSeconds })
    .catch((e) => console.error('[Cache] set error:', e.message));
  try { waitUntil(write); }
  catch (e) { console.error('[Cache] waitUntil unavailable:', e.message); }
}

// Invalidations stay awaited on purpose: after an admin edit, the old copy must be
// gone before we reply, so the next page load can't show stale data.
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
