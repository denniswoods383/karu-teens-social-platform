// In-memory cache with TTL
class MemoryCache {
  private cache = new Map<string, { data: any; expires: number }>();

  set(key: string, data: any, ttlSeconds = 300) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttlSeconds * 1000
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item || Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();

// Cache keys
export const CACHE_KEYS = {
  PROFILE: (id: string) => `profile:${id}`,
  POSTS: (userId?: string) => `posts:${userId || 'all'}`,
  MARKETPLACE: 'marketplace:items',
  NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
  STATS: (userId: string) => `stats:${userId}`,
  STORIES: 'stories:feed'
};

// Cache with SWR
export const cacheConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  refreshInterval: 30000, // 30 seconds
  dedupingInterval: 5000,
  errorRetryCount: 3,
  errorRetryInterval: 1000
};