const CACHE_PREFIX = "forum_cache_";
const CACHE_TS_PREFIX = "forum_cache_ts_";
const MAX_CACHE_AGE_MS = 5 * 60 * 1000; // 5 minutes stale threshold
const MAX_TOTAL_SIZE = 4 * 1024 * 1024; // 4MB guard

export const getCachedPosts = (scopeType: string, scopeKey: string): any[] | null => {
  try {
    const key = `${CACHE_PREFIX}${scopeType}_${scopeKey}`;
    const tsKey = `${CACHE_TS_PREFIX}${scopeType}_${scopeKey}`;
    const raw = localStorage.getItem(key);
    const ts = localStorage.getItem(tsKey);
    if (!raw) return null;
    // Return cached data regardless of age — caller decides if stale
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const isCacheStale = (scopeType: string, scopeKey: string): boolean => {
  try {
    const tsKey = `${CACHE_TS_PREFIX}${scopeType}_${scopeKey}`;
    const ts = localStorage.getItem(tsKey);
    if (!ts) return true;
    return Date.now() - parseInt(ts, 10) > MAX_CACHE_AGE_MS;
  } catch {
    return true;
  }
};

export const setCachedPosts = (scopeType: string, scopeKey: string, posts: any[]) => {
  try {
    const key = `${CACHE_PREFIX}${scopeType}_${scopeKey}`;
    const tsKey = `${CACHE_TS_PREFIX}${scopeType}_${scopeKey}`;
    const serialized = JSON.stringify(posts);
    
    // Size guard — evict oldest if too large
    if (serialized.length > MAX_TOTAL_SIZE) return;
    
    try {
      localStorage.setItem(key, serialized);
      localStorage.setItem(tsKey, Date.now().toString());
    } catch {
      // localStorage full — evict old caches
      evictOldCaches();
      try {
        localStorage.setItem(key, serialized);
        localStorage.setItem(tsKey, Date.now().toString());
      } catch {
        // Give up silently
      }
    }
  } catch {
    // Silently fail
  }
};

const evictOldCaches = () => {
  try {
    const entries: { key: string; ts: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_TS_PREFIX)) {
        const ts = parseInt(localStorage.getItem(k) || "0", 10);
        entries.push({ key: k.replace(CACHE_TS_PREFIX, ""), ts });
      }
    }
    // Sort oldest first, remove bottom half
    entries.sort((a, b) => a.ts - b.ts);
    const toRemove = entries.slice(0, Math.ceil(entries.length / 2));
    toRemove.forEach(({ key }) => {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      localStorage.removeItem(`${CACHE_TS_PREFIX}${key}`);
    });
  } catch {
    // Silently fail
  }
};
