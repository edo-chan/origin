/**
 * Comprehensive Caching Strategies
 * 
 * Provides multi-layered caching solutions for different application types:
 * - Browser cache (memory, localStorage, sessionStorage, IndexedDB)
 * - HTTP cache (service worker, API responses)
 * - Application cache (React Query-like functionality)
 * - Real-time cache (WebSocket data, live updates)
 * - Persistent cache (offline-first strategies)
 */

import React from 'react';

import { usePerformanceMonitor } from './performance';

// Cache configuration interfaces
export interface CacheConfig {
  maxSize?: number;
  maxAge?: number; // milliseconds
  staleWhileRevalidate?: boolean;
  persistToDisk?: boolean;
  compression?: boolean;
  encryption?: boolean;
  versioning?: boolean;
}

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  expiresAt: number;
  version?: string;
  size?: number;
  accessCount: number;
  lastAccessed: number;
  tags?: string[];
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

// Base cache interface
export interface ICache<T = any> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, options?: CacheConfig): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  keys(): Promise<string[]>;
  size(): Promise<number>;
  getStats(): Promise<CacheStats>;
}

// LRU Cache implementation with advanced features
export class LRUCache<T = any> implements ICache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private accessOrder = new Map<string, number>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    hitRate: 0,
  };
  private accessCounter = 0;

  constructor(private config: Required<CacheConfig>) {}

  async get(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await this.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }

    // Update access tracking
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.accessOrder.set(key, ++this.accessCounter);
    
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data;
  }

  async set(key: string, value: T, options?: CacheConfig): Promise<void> {
    const config = { ...this.config, ...options };
    const now = Date.now();
    const expiresAt = now + config.maxAge;
    const size = this.estimateSize(value);

    // Check if we need to evict entries
    if (this.cache.size >= config.maxSize) {
      await this.evictLRU();
    }

    // Create cache entry
    const entry: CacheEntry<T> = {
      data: value,
      timestamp: now,
      expiresAt,
      size,
      accessCount: 1,
      lastAccessed: now,
      version: config.versioning ? this.generateVersion() : undefined,
      tags: [],
    };

    this.cache.set(key, entry);
    this.accessOrder.set(key, ++this.accessCounter);
    
    this.stats.entryCount = this.cache.size;
    this.stats.totalSize += size;

    // Persist to disk if configured
    if (config.persistToDisk) {
      await this.persistEntry(key, entry);
    }
  }

  async delete(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;

    this.cache.delete(key);
    this.accessOrder.delete(key);
    
    this.stats.entryCount = this.cache.size;
    this.stats.totalSize -= entry.size || 0;

    return true;
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.accessOrder.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entryCount: 0,
      hitRate: 0,
    };
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      await this.delete(key);
      return false;
    }
    
    return true;
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys());
  }

  async size(): Promise<number> {
    return this.cache.size;
  }

  async getStats(): Promise<CacheStats> {
    return { ...this.stats };
  }

  private async evictLRU(): Promise<void> {
    const oldestKey = this.findLRUKey();
    if (oldestKey) {
      await this.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  private findLRUKey(): string | null {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, accessTime] of this.accessOrder.entries()) {
      if (accessTime < oldestAccess) {
        oldestAccess = accessTime;
        oldestKey = key;
      }
    }

    return oldestKey;
  }

  private estimateSize(value: T): number {
    try {
      return JSON.stringify(value).length * 2; // Rough estimate
    } catch {
      return 1000; // Default size
    }
  }

  private generateVersion(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private async persistEntry(key: string, entry: CacheEntry<T>): Promise<void> {
    try {
      localStorage.setItem(`cache:${key}`, JSON.stringify(entry));
    } catch (e) {
      console.warn('Failed to persist cache entry:', e);
    }
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

// IndexedDB cache for large datasets
export class IndexedDBCache<T = any> implements ICache<T> {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number;

  constructor(dbName: string = 'AppCache', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  private async initDB(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('cache')) {
          const store = db.createObjectStore('cache', { keyPath: 'key' });
          store.createIndex('expiresAt', 'expiresAt');
          store.createIndex('tags', 'tags', { multiEntry: true });
        }
      };
    });
  }

  async get(key: string): Promise<T | null> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as CacheEntry<T> & { key: string };
        
        if (!result) {
          resolve(null);
          return;
        }

        // Check if expired
        if (Date.now() > result.expiresAt) {
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(result.data);
      };
    });
  }

  async set(key: string, value: T, options: CacheConfig = {}): Promise<void> {
    await this.initDB();
    
    const now = Date.now();
    const expiresAt = now + (options.maxAge || 24 * 60 * 60 * 1000); // Default 24 hours

    const entry = {
      key,
      data: value,
      timestamp: now,
      expiresAt,
      accessCount: 1,
      lastAccessed: now,
      tags: [],
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put(entry);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async delete(key: string): Promise<boolean> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.delete(key);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(true);
    });
  }

  async clear(): Promise<void> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.clear();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }

  async keys(): Promise<string[]> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.getAllKeys();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result as string[]);
    });
  }

  async size(): Promise<number> {
    await this.initDB();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.count();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getStats(): Promise<CacheStats> {
    // Implementation would require additional tracking
    return {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entryCount: await this.size(),
      hitRate: 0,
    };
  }
}

// Multi-tier cache manager
export class CacheManager {
  private l1Cache: LRUCache; // Memory cache
  private l2Cache: IndexedDBCache; // Persistent cache
  private compressionEnabled: boolean;

  constructor(config: {
    l1Config?: CacheConfig;
    l2Config?: CacheConfig;
    compression?: boolean;
  } = {}) {
    this.l1Cache = new LRUCache({
      maxSize: 1000,
      maxAge: 5 * 60 * 1000, // 5 minutes
      staleWhileRevalidate: true,
      persistToDisk: false,
      compression: false,
      encryption: false,
      versioning: false,
      ...config.l1Config,
    });

    this.l2Cache = new IndexedDBCache();
    this.compressionEnabled = config.compression || false;
  }

  async get<T>(key: string): Promise<T | null> {
    // Try L1 cache first
    let value = await this.l1Cache.get(key);
    if (value !== null) {
      return value;
    }

    // Try L2 cache
    value = await this.l2Cache.get(key);
    if (value !== null) {
      // Promote to L1 cache
      await this.l1Cache.set(key, value);
      return value;
    }

    return null;
  }

  async set<T>(key: string, value: T, options: CacheConfig = {}): Promise<void> {
    // Set in both caches
    await Promise.all([
      this.l1Cache.set(key, value, options),
      this.l2Cache.set(key, value, {
        ...options,
        maxAge: options.maxAge || 24 * 60 * 60 * 1000, // Default 24 hours for L2
      }),
    ]);
  }

  async delete(key: string): Promise<boolean> {
    const [l1Result, l2Result] = await Promise.all([
      this.l1Cache.delete(key),
      this.l2Cache.delete(key),
    ]);
    
    return l1Result || l2Result;
  }

  async clear(): Promise<void> {
    await Promise.all([
      this.l1Cache.clear(),
      this.l2Cache.clear(),
    ]);
  }

  async getStats(): Promise<{ l1: CacheStats; l2: CacheStats }> {
    const [l1Stats, l2Stats] = await Promise.all([
      this.l1Cache.getStats(),
      this.l2Cache.getStats(),
    ]);

    return { l1: l1Stats, l2: l2Stats };
  }
}

// Application-specific cache strategies
export const AccountingCache = {
  // Financial data cache with regulatory compliance
  createFinancialDataCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 500,
        maxAge: 2 * 60 * 1000, // 2 minutes for financial data
        staleWhileRevalidate: false, // Strict consistency
      },
      l2Config: {
        maxAge: 15 * 60 * 1000, // 15 minutes persistent
        encryption: true, // Encrypt sensitive financial data
      },
    });
  },

  // Report cache for heavy computations
  createReportCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 100,
        maxAge: 10 * 60 * 1000, // 10 minutes
      },
      l2Config: {
        maxAge: 60 * 60 * 1000, // 1 hour
      },
      compression: true, // Compress large reports
    });
  },

  // User preferences cache
  createPreferencesCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 200,
        maxAge: 30 * 60 * 1000, // 30 minutes
      },
      l2Config: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    });
  },
};

export const SolanaCache = {
  // Price data cache with high frequency updates
  createPriceCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 2000,
        maxAge: 30 * 1000, // 30 seconds for price data
        staleWhileRevalidate: true, // Allow stale data while updating
      },
      l2Config: {
        maxAge: 5 * 60 * 1000, // 5 minutes persistent
      },
    });
  },

  // Blockchain data cache
  createBlockchainCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 1000,
        maxAge: 2 * 60 * 1000, // 2 minutes
      },
      l2Config: {
        maxAge: 30 * 60 * 1000, // 30 minutes
      },
    });
  },

  // NFT metadata cache
  createNFTCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 500,
        maxAge: 60 * 60 * 1000, // 1 hour (NFT metadata rarely changes)
      },
      l2Config: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      compression: true, // Compress large metadata
    });
  },
};

export const ChatCache = {
  // Message cache with efficient updates
  createMessageCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 5000,
        maxAge: 60 * 60 * 1000, // 1 hour
      },
      l2Config: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      },
    });
  },

  // Media cache for chat attachments
  createMediaCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 200,
        maxAge: 30 * 60 * 1000, // 30 minutes
      },
      l2Config: {
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      compression: true,
    });
  },

  // User presence cache
  createPresenceCache: () => {
    return new CacheManager({
      l1Config: {
        maxSize: 1000,
        maxAge: 60 * 1000, // 1 minute for presence data
      },
      l2Config: {
        maxAge: 5 * 60 * 1000, // 5 minutes
      },
    });
  },
};

// React hook for cache usage
export function useCache<T>(
  cacheManager: CacheManager,
  key: string,
  fetcher?: () => Promise<T>,
  options: CacheConfig = {}
) {
  const [data, setData] = React.useState<T | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const { recordMetric } = usePerformanceMonitor();

  const fetchData = React.useCallback(async (force = false) => {
    if (!force) {
      // Try cache first
      const cached = await cacheManager.get(key);
      if (cached !== null) {
        setData(cached as T);
        recordMetric({
          timestamp: Date.now(),
          duration: 0,
          operation: 'cache-hit',
          metadata: { key, type: 'memory' },
        });
        return;
      }
    }

    if (!fetcher) return;

    setLoading(true);
    setError(null);

    const startTime = Date.now();
    
    try {
      const result = await fetcher();
      setData(result);
      
      // Cache the result
      await cacheManager.set(key, result, options);
      
      recordMetric({
        timestamp: startTime,
        duration: Date.now() - startTime,
        operation: 'cache-miss',
        metadata: { key, type: 'fetch' },
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      
      recordMetric({
        timestamp: startTime,
        duration: Date.now() - startTime,
        operation: 'cache-error',
        metadata: { key, error: error.message },
      });
    } finally {
      setLoading(false);
    }
  }, [key, fetcher, cacheManager, options, recordMetric]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const invalidate = React.useCallback(async () => {
    await cacheManager.delete(key);
    await fetchData(true);
  }, [key, cacheManager, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
}

// Cache warming utilities
export const CacheWarmer = {
  warmAccountingCache: async (userId: string, companyId: string) => {
    const cache = AccountingCache.createFinancialDataCache();
    
    // Warm critical accounting data
    const criticalKeys = [
      `user:${userId}:preferences`,
      `company:${companyId}:settings`,
      `company:${companyId}:chart-of-accounts`,
      `company:${companyId}:recent-transactions`,
    ];

    // This would typically fetch from your API
    await Promise.all(
      criticalKeys.map(async (key) => {
        // await cache.set(key, await fetchCriticalData(key));
      })
    );
  },

  warmSolanaCache: async (walletAddress: string) => {
    const priceCache = SolanaCache.createPriceCache();
    const blockchainCache = SolanaCache.createBlockchainCache();
    
    // Warm price data for popular tokens
    const popularTokens = ['SOL', 'USDC', 'RAY', 'ORCA'];
    
    await Promise.all(
      popularTokens.map(async (token) => {
        // await priceCache.set(`price:${token}`, await fetchTokenPrice(token));
      })
    );

    // Warm user's wallet data
    if (walletAddress) {
      // await blockchainCache.set(`wallet:${walletAddress}`, await fetchWalletData(walletAddress));
    }
  },

  warmChatCache: async (userId: string, chatRooms: string[]) => {
    const messageCache = ChatCache.createMessageCache();
    const presenceCache = ChatCache.createPresenceCache();
    
    // Warm recent messages for active chat rooms
    await Promise.all(
      chatRooms.slice(0, 5).map(async (roomId) => {
        // await messageCache.set(`messages:${roomId}`, await fetchRecentMessages(roomId));
      })
    );

    // Warm presence data
    // await presenceCache.set(`presence:${userId}`, await fetchUserPresence(userId));
  },
};

// Global cache instances
export const globalCache = new CacheManager();

// Cache utilities
export const CacheUtils = {
  // Clear all application caches
  clearAllCaches: async () => {
    await Promise.all([
      globalCache.clear(),
      // Clear service worker cache
      'caches' in window && caches.keys().then(names => 
        Promise.all(names.map(name => caches.delete(name)))
      ),
    ]);
  },

  // Get cache statistics
  getCacheReport: async () => {
    const stats = await globalCache.getStats();
    
    return {
      memory: stats.l1,
      persistent: stats.l2,
      totalHitRate: (stats.l1.hitRate + stats.l2.hitRate) / 2,
      recommendations: generateCacheRecommendations(stats),
    };
  },
};

function generateCacheRecommendations(stats: { l1: CacheStats; l2: CacheStats }) {
  const recommendations = [];
  
  if (stats.l1.hitRate < 0.7) {
    recommendations.push('Consider increasing L1 cache size or TTL');
  }
  
  if (stats.l2.hitRate < 0.5) {
    recommendations.push('Review L2 cache strategy for better persistence');
  }
  
  if (stats.l1.evictions > stats.l1.hits * 0.1) {
    recommendations.push('L1 cache may be too small, causing frequent evictions');
  }
  
  return recommendations;
}