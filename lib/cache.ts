// ABOUTME: In-memory cache implementation with TTL support
// ABOUTME: Used to reduce external API calls with 2-hour default TTL

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Gets a value from the cache if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Sets a value in the cache with a TTL (in milliseconds)
   * Default TTL is 2 hours
   */
  set<T>(key: string, data: T, ttlMs: number = 2 * 60 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Clears a specific key from the cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clears all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Gets the size of the cache
   */
  size(): number {
    return this.cache.size;
  }
}

// Export a singleton instance
export const cache = new MemoryCache();
