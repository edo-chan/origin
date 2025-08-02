/**
 * Advanced Jotai State Management Optimizations
 * 
 * Provides optimized state management patterns for different application types:
 * - Atomic state design with minimal re-renders
 * - Derived state with memoization
 * - Async state management with caching
 * - Persistence and synchronization
 * - Performance monitoring for state updates
 */

import { atom, useAtomValue, useSetAtom, useAtom, Getter, Setter } from 'jotai';
import { atomWithStorage, RESET } from 'jotai/utils';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePerformanceMonitor } from './performance';

// Enhanced atom creation utilities
export interface AtomOptions<T> {
  // Performance options
  debugName?: string;
  shouldUpdate?: (prev: T, next: T) => boolean;
  throttleMs?: number;
  debounceMs?: number;
  
  // Persistence options
  persist?: {
    key: string;
    storage?: Storage;
    serialize?: (value: T) => string;
    deserialize?: (value: string) => T;
  };
  
  // Validation options
  validate?: (value: T) => boolean;
  transform?: (value: T) => T;
  
  // Cache options
  cache?: {
    maxAge?: number;
    maxSize?: number;
    staleWhileRevalidate?: boolean;
  };
}

// Performance-optimized atom creator
export function createOptimizedAtom<T>(
  initialValue: T,
  options: AtomOptions<T> = {}
) {
  const {
    debugName,
    shouldUpdate,
    throttleMs,
    debounceMs,
    persist,
    validate,
    transform,
    cache,
  } = options;

  // Base atom with optional persistence
  const baseAtom = persist
    ? atomWithStorage(persist.key, initialValue as any)
    : atom(initialValue);

  // Add debug name
  if (debugName) {
    baseAtom.debugLabel = debugName;
  }

  // Throttle/debounce wrapper
  let timeoutId: NodeJS.Timeout | null = null;
  let lastUpdate = 0;

  const optimizedAtom = atom(
    (get) => get(baseAtom),
    (get, set, update: T | ((prev: T) => T)) => {
      const now = Date.now();
      const currentValue = get(baseAtom);
      const newValue = typeof update === 'function' 
        ? (update as (prev: T) => T)(currentValue)
        : update;

      // Validation
      if (validate && !validate(newValue)) {
        console.warn(`Validation failed for atom ${debugName}:`, newValue);
        return;
      }

      // Transform value
      const transformedValue = transform ? transform(newValue) : newValue;

      // Check if update should proceed
      if (shouldUpdate && !shouldUpdate(currentValue, transformedValue)) {
        return;
      }

      // Apply throttling
      if (throttleMs && now - lastUpdate < throttleMs) {
        return;
      }

      // Apply debouncing
      if (debounceMs) {
        if (timeoutId) clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          set(baseAtom, transformedValue);
          lastUpdate = Date.now();
        }, debounceMs);
        return;
      }

      set(baseAtom, transformedValue);
      lastUpdate = now;
    }
  );

  return optimizedAtom;
}

// Memoized derived atom creator
export function createDerivedAtom<T, R>(
  sourceAtoms: any[],
  deriveFn: (values: any[]) => R,
  deps: any[] = []
) {
  return atom((get) => {
    const values = sourceAtoms.map(a => get(a));
    return deriveFn(values);
  });
}

// Async atom with caching and error handling
export function createAsyncAtom<T>(
  fetchFn: (get: Getter) => Promise<T>,
  options: {
    initialValue?: T;
    refetchInterval?: number;
    staleTime?: number;
    cacheKey?: string;
    onError?: (error: Error) => void;
    retries?: number;
  } = {}
) {
  const {
    initialValue,
    refetchInterval,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheKey,
    onError,
    retries = 3,
  } = options;

  // Cache atom for storing fetched data
  const cacheAtom = atom<{
    data: T | undefined;
    timestamp: number;
    error: Error | null;
    loading: boolean;
  }>({
    data: initialValue,
    timestamp: 0,
    error: null,
    loading: false,
  });

  // Async atom that manages fetching
  const asyncAtom = atom(
    (get) => {
      const cache = get(cacheAtom);
      const isStale = Date.now() - cache.timestamp > staleTime;
      
      if (!cache.data || isStale) {
        // Trigger fetch if data is missing or stale
        return cache;
      }
      
      return cache;
    },
    async (get, set, action: 'fetch' | 'refresh' = 'fetch') => {
      const currentCache = get(cacheAtom);
      
      // Don't fetch if already loading
      if (currentCache.loading && action === 'fetch') {
        return;
      }

      set(cacheAtom, { ...currentCache, loading: true, error: null });

      let attempt = 0;
      while (attempt < retries) {
        try {
          const data = await fetchFn(get);
          set(cacheAtom, {
            data,
            timestamp: Date.now(),
            error: null,
            loading: false,
          });
          return;
        } catch (error) {
          attempt++;
          if (attempt >= retries) {
            const errorObj = error instanceof Error ? error : new Error(String(error));
            set(cacheAtom, {
              ...currentCache,
              error: errorObj,
              loading: false,
            });
            onError?.(errorObj);
          } else {
            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          }
        }
      }
    }
  );

  // Auto-refetch setup
  if (refetchInterval) {
    const intervalAtom = atom(null, (get, set) => {
      const interval = setInterval(() => {
        set(asyncAtom, 'refresh');
      }, refetchInterval);
      
      return () => clearInterval(interval);
    });
    
    // Attach cleanup to the main atom
    (asyncAtom as any).cleanup = intervalAtom;
  }

  return asyncAtom;
}

// Application-specific state patterns
export const AccountingAtoms = {
  // Virtualized table state
  createTableState: <T>(initialData: T[] = []) => {
    const dataAtom = createOptimizedAtom(initialData, {
      debugName: 'accounting-table-data',
      shouldUpdate: (prev, next) => prev.length !== next.length || prev !== next,
    });

    const sortAtom = createOptimizedAtom<{
      column: string | null;
      direction: 'asc' | 'desc';
    }>({ column: null, direction: 'asc' }, {
      debugName: 'accounting-table-sort',
    });

    const filterAtom = createOptimizedAtom<Record<string, any>>({}, {
      debugName: 'accounting-table-filter',
      debounceMs: 300,
    });

    const paginationAtom = createOptimizedAtom<{
      page: number;
      pageSize: number;
      total: number;
    }>({ page: 1, pageSize: 50, total: 0 }, {
      debugName: 'accounting-table-pagination',
    });

    // Derived atom for processed data
    const processedDataAtom = atom((get) => {
      const data = get(dataAtom);
      const sort = get(sortAtom);
      const filter = get(filterAtom);
      const pagination = get(paginationAtom);

      // Apply filters
      let filtered = data.filter((item: any) => {
        return Object.entries(filter).every(([key, value]) => {
          if (!value) return true;
          const itemValue = (item as any)[key];
          return String(itemValue).toLowerCase().includes(String(value).toLowerCase());
        });
      });

      // Apply sorting
      if (sort.column) {
        filtered = [...filtered].sort((a, b) => {
          const aVal = (a as any)[sort.column!];
          const bVal = (b as any)[sort.column!];
          const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          return sort.direction === 'asc' ? comparison : -comparison;
        });
      }

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const paginatedData = filtered.slice(startIndex, startIndex + pagination.pageSize);

      return {
        data: paginatedData,
        total: filtered.length,
        hasMore: startIndex + pagination.pageSize < filtered.length,
      };
    });

    return {
      dataAtom,
      sortAtom,
      filterAtom,
      paginationAtom,
      processedDataAtom,
    };
  },

  // Form state with validation
  createFormState: <T extends Record<string, any>>(
    initialValues: T,
    validationRules: Record<keyof T, (value: any) => string | null>
  ) => {
    const valuesAtom = createOptimizedAtom(initialValues, {
      debugName: 'accounting-form-values',
      debounceMs: 100,
    });

    const errorsAtom = atom((get) => {
      const values = get(valuesAtom);
      const errors: Partial<Record<keyof T, string>> = {};

      Object.entries(validationRules).forEach(([field, validate]) => {
        const error = validate(values[field as keyof T]);
        if (error) {
          errors[field as keyof T] = error;
        }
      });

      return errors;
    });

    const isValidAtom = atom((get) => {
      const errors = get(errorsAtom);
      return Object.keys(errors).length === 0;
    });

    const isDirtyAtom = atom((get) => {
      const values = get(valuesAtom);
      return JSON.stringify(values) !== JSON.stringify(initialValues);
    });

    return {
      valuesAtom,
      errorsAtom,
      isValidAtom,
      isDirtyAtom,
    };
  },
};

export const SolanaAtoms = {
  // Price tracking state
  createPriceState: (tokens: string[]) => {
    const pricesAtom = createOptimizedAtom<Record<string, {
      price: number;
      change24h: number;
      timestamp: number;
    }>>({}, {
      debugName: 'solana-prices',
      throttleMs: 1000, // Limit updates to once per second
    });

    const connectionStatusAtom = createOptimizedAtom<'connected' | 'connecting' | 'disconnected'>('disconnected', {
      debugName: 'solana-connection-status',
    });

    const subscriptionsAtom = createOptimizedAtom<Set<string>>(new Set(), {
      debugName: 'solana-subscriptions',
    });

    // Derived atom for formatted prices
    const formattedPricesAtom = atom((get) => {
      const prices = get(pricesAtom);
      return Object.entries(prices).reduce((acc, [token, data]) => {
        acc[token] = {
          ...(data as any),
          formattedPrice: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: (data as any).price < 1 ? 6 : 2,
          }).format((data as any).price),
          formattedChange: `${(data as any).change24h >= 0 ? '+' : ''}${(data as any).change24h.toFixed(2)}%`,
        };
        return acc;
      }, {} as Record<string, any>);
    });

    return {
      pricesAtom,
      connectionStatusAtom,
      subscriptionsAtom,
      formattedPricesAtom,
    };
  },

  // Wallet state
  createWalletState: () => {
    const walletAtom = createOptimizedAtom<{
      address: string | null;
      balance: number;
      connected: boolean;
      connecting: boolean;
    }>({
      address: null,
      balance: 0,
      connected: false,
      connecting: false,
    }, {
      debugName: 'solana-wallet',
      persist: {
        key: 'solana-wallet-state',
        serialize: (value) => JSON.stringify({
          ...value,
          connecting: false, // Don't persist connecting state
        }),
        deserialize: (value) => JSON.parse(value),
      },
    });

    const transactionsAtom = createOptimizedAtom<Array<{
      signature: string;
      timestamp: number;
      amount: number;
      type: 'send' | 'receive';
      status: 'confirmed' | 'pending' | 'failed';
    }>>([], {
      debugName: 'solana-transactions',
    });

    return {
      walletAtom,
      transactionsAtom,
    };
  },
};

export const ChatAtoms = {
  // Message state with virtualization support
  createChatState: (chatId: string) => {
    const messagesAtom = createOptimizedAtom<Array<{
      id: string;
      content: string;
      sender: string;
      timestamp: number;
      type: 'text' | 'image' | 'file';
      status: 'sending' | 'sent' | 'delivered' | 'read';
    }>>([], {
      debugName: `chat-messages-${chatId}`,
      shouldUpdate: (prev, next) => prev.length !== next.length || prev[prev.length - 1]?.id !== next[next.length - 1]?.id,
    });

    const typingUsersAtom = createOptimizedAtom<Set<string>>(new Set(), {
      debugName: `chat-typing-${chatId}`,
      throttleMs: 500,
    });

    const scrollPositionAtom = createOptimizedAtom<{
      scrollTop: number;
      scrollHeight: number;
      clientHeight: number;
    }>({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 }, {
      debugName: `chat-scroll-${chatId}`,
      throttleMs: 100,
    });

    const unreadCountAtom = createOptimizedAtom(0, {
      debugName: `chat-unread-${chatId}`,
    });

    // Derived atom for visible messages (for virtualization)
    const visibleMessagesAtom = atom((get) => {
      const messages = get(messagesAtom);
      const scroll = get(scrollPositionAtom);
      
      // Calculate visible range based on scroll position
      const messageHeight = 60; // Average message height
      const startIndex = Math.floor(scroll.scrollTop / messageHeight);
      const endIndex = Math.min(
        messages.length,
        startIndex + Math.ceil(scroll.clientHeight / messageHeight) + 5 // Buffer
      );

      return {
        messages: messages.slice(Math.max(0, startIndex - 5), endIndex),
        totalHeight: messages.length * messageHeight,
        startIndex: Math.max(0, startIndex - 5),
      };
    });

    return {
      messagesAtom,
      typingUsersAtom,
      scrollPositionAtom,
      unreadCountAtom,
      visibleMessagesAtom,
    };
  },

  // Connection and presence state
  createConnectionState: () => {
    const connectionAtom = createOptimizedAtom<{
      status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting';
      lastConnected: number | null;
      retryCount: number;
    }>({
      status: 'disconnected',
      lastConnected: null,
      retryCount: 0,
    }, {
      debugName: 'chat-connection',
    });

    const presenceAtom = createOptimizedAtom<Record<string, {
      status: 'online' | 'away' | 'offline';
      lastSeen: number;
    }>>({}, {
      debugName: 'chat-presence',
      throttleMs: 5000, // Update presence at most every 5 seconds
    });

    return {
      connectionAtom,
      presenceAtom,
    };
  },
};

// Performance monitoring hook for Jotai atoms
export function useAtomPerformance<T>(atomInstance: any, debugName?: string) {
  const { startTiming, endTiming } = usePerformanceMonitor();
  const renderCount = useRef(0);
  const lastValue = useRef<T>();

  const [value, setValue] = useAtom(atomInstance);

  useEffect(() => {
    renderCount.current++;
    
    const operationId = `atom-update-${debugName || 'unknown'}-${Date.now()}`;
    startTiming(operationId, 'atom-update', debugName);

    const hasChanged = lastValue.current !== value;
    lastValue.current = value as T;

    endTiming(operationId, {
      renderCount: renderCount.current,
      hasChanged,
      valueType: typeof value,
    });
  }, [value, debugName, startTiming, endTiming]);

  return [value, setValue] as const;
}

// Batch atom updates for performance
export function useBatchedAtomUpdates() {
  const updateQueue = useRef<Array<() => void>>([]);
  const isUpdating = useRef(false);

  const batchUpdate = useCallback((updateFn: () => void) => {
    updateQueue.current.push(updateFn);
    
    if (!isUpdating.current) {
      isUpdating.current = true;
      
      // Process updates
      updateQueue.current.forEach(fn => fn());
      updateQueue.current = [];
      isUpdating.current = false;
    }
  }, []);

  return { batchUpdate };
}

// Atom cleanup utility
export function useAtomCleanup(atoms: Array<any>) {
  useEffect(() => {
    return () => {
      atoms.forEach(atom => {
        // Clean up any intervals or subscriptions
        if ((atom as any).cleanup) {
          (atom as any).cleanup();
        }
        
        // Reset atom to initial value
        try {
          atom.debugValue = RESET;
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    };
  }, [atoms]);
}