/**
 * Performance Monitoring and Measurement Utilities
 * 
 * Provides comprehensive performance tracking for different application types:
 * - Accounting apps: Form interactions, table rendering, report generation
 * - Solana apps: Blockchain data fetching, price updates, transaction processing
 * - Chat apps: Message rendering, real-time updates, scroll performance
 * - General web apps: Page loads, component renders, user interactions
 */

// Core performance metrics interface
export interface PerformanceMetrics {
  timestamp: number;
  duration: number;
  operation: string;
  component?: string;
  metadata?: Record<string, any>;
  memoryUsage?: any; // MemoryInfo type from browser
  renderCount?: number;
}

// Application-specific performance categories
export enum PerformanceCategory {
  // Core Web Vitals
  LCP = 'largest-contentful-paint',
  FID = 'first-input-delay', 
  CLS = 'cumulative-layout-shift',
  
  // Component Performance
  COMPONENT_RENDER = 'component-render',
  COMPONENT_MOUNT = 'component-mount',
  COMPONENT_UPDATE = 'component-update',
  
  // Data Operations
  API_REQUEST = 'api-request',
  DATABASE_QUERY = 'database-query',
  CACHE_HIT = 'cache-hit',
  CACHE_MISS = 'cache-miss',
  
  // App-Specific Categories
  TABLE_RENDER = 'table-render',          // Accounting apps
  FORM_VALIDATION = 'form-validation',    // Accounting apps
  BLOCKCHAIN_SYNC = 'blockchain-sync',    // Solana apps
  PRICE_UPDATE = 'price-update',          // Solana apps
  MESSAGE_RENDER = 'message-render',      // Chat apps
  SCROLL_PERFORMANCE = 'scroll-performance', // Chat apps
  
  // User Interactions
  USER_INTERACTION = 'user-interaction',
  NAVIGATION = 'navigation',
  FORM_SUBMIT = 'form-submit',
}

// Performance measurement class
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private measurements: Map<string, PerformanceMetrics> = new Map();
  private observers: PerformanceObserver[] = [];
  private isEnabled: boolean;
  private reportingEndpoint?: string;

  constructor(config?: {
    enabled?: boolean;
    reportingEndpoint?: string;
    sampleRate?: number;
  }) {
    this.isEnabled = config?.enabled ?? process.env.NODE_ENV === 'development';
    this.reportingEndpoint = config?.reportingEndpoint;
    
    if (this.isEnabled && typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  static getInstance(config?: any): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(config);
    }
    return PerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // Web Vitals Observer
    if ('PerformanceObserver' in window) {
      // LCP Observer
      const lcpObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            timestamp: entry.startTime,
            duration: (entry as any).renderTime || (entry as any).loadTime || entry.duration,
            operation: PerformanceCategory.LCP,
            metadata: {
              element: (entry as any).element?.tagName,
              url: (entry as any).url,
              size: (entry as any).size,
            }
          });
        }
      });
      
      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (e) {
        console.debug('LCP observer not supported');
      }

      // FID Observer
      const fidObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric({
            timestamp: entry.startTime,
            duration: (entry as any).processingStart - entry.startTime || entry.duration,
            operation: PerformanceCategory.FID,
            metadata: {
              name: entry.name,
              target: (entry as any).target?.tagName,
            }
          });
        }
      });
      
      try {
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      } catch (e) {
        console.debug('FID observer not supported');
      }

      // Layout Shift Observer
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (clsValue > 0) {
          this.recordMetric({
            timestamp: performance.now(),
            duration: clsValue,
            operation: PerformanceCategory.CLS,
            metadata: { clsValue }
          });
        }
      });
      
      try {
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(clsObserver);
      } catch (e) {
        console.debug('CLS observer not supported');
      }
    }
  }

  // Start timing an operation
  startTiming(operationId: string, operation: string, component?: string): void {
    if (!this.isEnabled) return;
    
    const startTime = performance.now();
    const memoryUsage = this.getMemoryUsage();
    
    this.measurements.set(operationId, {
      timestamp: startTime,
      duration: 0,
      operation,
      component,
      memoryUsage,
    });

    // Mark in Performance API
    try {
      performance.mark(`${operationId}-start`);
    } catch (e) {
      // Silently fail if performance marks are not supported
    }
  }

  // End timing an operation
  endTiming(operationId: string, metadata?: Record<string, any>): PerformanceMetrics | null {
    if (!this.isEnabled) return null;
    
    const measurement = this.measurements.get(operationId);
    if (!measurement) return null;

    const endTime = performance.now();
    const duration = endTime - measurement.timestamp;
    const endMemoryUsage = this.getMemoryUsage();

    const finalMeasurement: PerformanceMetrics = {
      ...measurement,
      duration,
      metadata: {
        ...measurement.metadata,
        ...metadata,
        memoryDelta: endMemoryUsage ? {
          usedJSHeapSize: endMemoryUsage.usedJSHeapSize - (measurement.memoryUsage?.usedJSHeapSize || 0),
          totalJSHeapSize: endMemoryUsage.totalJSHeapSize - (measurement.memoryUsage?.totalJSHeapSize || 0),
        } : undefined,
      }
    };

    // Mark in Performance API
    try {
      performance.mark(`${operationId}-end`);
      performance.measure(operationId, `${operationId}-start`, `${operationId}-end`);
    } catch (e) {
      // Silently fail if performance measures are not supported
    }

    this.measurements.delete(operationId);
    this.reportMetric(finalMeasurement);
    
    return finalMeasurement;
  }

  // Record a single metric directly
  recordMetric(metric: PerformanceMetrics): void {
    if (!this.isEnabled) return;
    
    this.reportMetric(metric);
    
    // Log performance issues in development
    if (process.env.NODE_ENV === 'development') {
      this.logPerformanceIssues(metric);
    }
  }

  // Get current memory usage
  private getMemoryUsage(): any | undefined { // MemoryInfo type from browser
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory;
    }
    return undefined;
  }

  // Report metrics to external service or console
  private reportMetric(metric: PerformanceMetrics): void {
    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.debug('Performance Metric', {
        operation: metric.operation,
        component: metric.component,
        duration: `${metric.duration.toFixed(2)}ms`,
        metadata: metric.metadata,
      });
    }

    // Send to external reporting service
    if (this.reportingEndpoint) {
      this.sendToReportingService(metric);
    }

    // Store in local storage for analysis (development only)
    if (process.env.NODE_ENV === 'development') {
      this.storeMetricLocally(metric);
    }
  }

  // Send metrics to external service
  private async sendToReportingService(metric: PerformanceMetrics): Promise<void> {
    try {
      await fetch(this.reportingEndpoint!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    } catch (error) {
      console.warn('Failed to send performance metric:', error);
    }
  }

  // Store metrics locally for development analysis
  private storeMetricLocally(metric: PerformanceMetrics): void {
    try {
      const existingMetrics = JSON.parse(localStorage.getItem('performance-metrics') || '[]');
      existingMetrics.push(metric);
      
      // Keep only last 100 metrics
      if (existingMetrics.length > 100) {
        existingMetrics.splice(0, existingMetrics.length - 100);
      }
      
      localStorage.setItem('performance-metrics', JSON.stringify(existingMetrics));
    } catch (error) {
      // Silently fail if localStorage is not available
    }
  }

  // Log performance issues
  private logPerformanceIssues(metric: PerformanceMetrics): void {
    const thresholds = {
      [PerformanceCategory.COMPONENT_RENDER]: 16, // 60fps threshold
      [PerformanceCategory.API_REQUEST]: 1000,     // 1 second
      [PerformanceCategory.TABLE_RENDER]: 100,     // Accounting apps
      [PerformanceCategory.MESSAGE_RENDER]: 50,    // Chat apps
      [PerformanceCategory.PRICE_UPDATE]: 200,     // Solana apps
    };

    const threshold = (thresholds as any)[metric.operation] || 100;
    
    if (metric.duration > threshold) {
      console.warn(`Performance Warning: ${metric.operation} took ${metric.duration.toFixed(2)}ms (threshold: ${threshold}ms)`, {
        component: metric.component,
        metadata: metric.metadata,
      });
    }
  }

  // Get performance report
  getPerformanceReport(): PerformanceMetrics[] {
    try {
      return JSON.parse(localStorage.getItem('performance-metrics') || '[]');
    } catch {
      return [];
    }
  }

  // Clear stored metrics
  clearMetrics(): void {
    localStorage.removeItem('performance-metrics');
  }

  // Cleanup observers
  cleanup(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// React Hook for performance monitoring
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTiming: monitor.startTiming.bind(monitor),
    endTiming: monitor.endTiming.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
    getReport: monitor.getPerformanceReport.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
}

// Performance timing decorator for functions
export function withPerformanceTiming<T extends any[], R>(
  fn: (...args: T) => R,
  operation: string,
  component?: string
): (...args: T) => R {
  return (...args: T): R => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `${operation}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    monitor.startTiming(operationId, operation, component);
    
    try {
      const result = fn(...args);
      
      // Handle promises
      if (result && typeof result === 'object' && 'then' in result) {
        return (result as any).finally(() => {
          monitor.endTiming(operationId);
        });
      }
      
      monitor.endTiming(operationId);
      return result;
    } catch (error) {
      monitor.endTiming(operationId, { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  };
}

// Application-specific performance helpers
export const AccountingPerformance = {
  measureTableRender: (rowCount: number, columnCount: number) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `table-render-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.TABLE_RENDER, 'DataTable');
    
    return () => monitor.endTiming(operationId, { rowCount, columnCount });
  },

  measureFormValidation: (fieldCount: number, validationRules: number) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `form-validation-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.FORM_VALIDATION, 'Form');
    
    return () => monitor.endTiming(operationId, { fieldCount, validationRules });
  },
};

export const SolanaPerformance = {
  measureBlockchainSync: (blockNumber: number) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `blockchain-sync-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.BLOCKCHAIN_SYNC, 'SolanaClient');
    
    return () => monitor.endTiming(operationId, { blockNumber });
  },

  measurePriceUpdate: (tokenCount: number) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `price-update-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.PRICE_UPDATE, 'PriceTracker');
    
    return () => monitor.endTiming(operationId, { tokenCount });
  },
};

export const ChatPerformance = {
  measureMessageRender: (messageCount: number, hasMedia: boolean) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `message-render-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.MESSAGE_RENDER, 'ChatMessage');
    
    return () => monitor.endTiming(operationId, { messageCount, hasMedia });
  },

  measureScrollPerformance: (itemCount: number, viewportHeight: number) => {
    const monitor = PerformanceMonitor.getInstance();
    const operationId = `scroll-performance-${Date.now()}`;
    monitor.startTiming(operationId, PerformanceCategory.SCROLL_PERFORMANCE, 'VirtualList');
    
    return () => monitor.endTiming(operationId, { itemCount, viewportHeight });
  },
};

// Initialize global performance monitor
export const initializePerformanceMonitoring = (config?: {
  enabled?: boolean;
  reportingEndpoint?: string;
  sampleRate?: number;
}) => {
  return PerformanceMonitor.getInstance(config);
};