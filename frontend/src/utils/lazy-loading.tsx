/**
 * Advanced Code Splitting and Lazy Loading Utilities
 * 
 * Provides intelligent code splitting patterns for different application types:
 * - Route-based splitting with preloading
 * - Component-based splitting with fallbacks
 * - Feature-based splitting for specific app types
 * - Progressive loading strategies
 */

import React, { Suspense, ComponentType, lazy, memo, useEffect, useState } from 'react';
import { PerformanceMonitor } from './performance';

// Enhanced lazy loading options
export interface LazyLoadOptions {
  // Loading states
  fallback?: React.ComponentType;
  errorBoundary?: React.ComponentType<{ error: Error; retry: () => void }>;
  
  // Performance options
  preload?: boolean;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  
  // Caching options
  cache?: boolean;
  cacheKey?: string;
  
  // Application type hints
  appType?: 'accounting' | 'solana' | 'chat' | 'general';
  
  // Progressive loading
  progressive?: {
    skeleton?: React.ComponentType;
    stages?: Array<{
      component: () => Promise<{ default: ComponentType<any> }>;
      condition: () => boolean;
    }>;
  };
}

// Component cache for loaded modules
const componentCache = new Map<string, ComponentType<any>>();

// Preload queue for intelligent prefetching
const preloadQueue = new Set<() => Promise<any>>();

// Default loading component
export const DefaultLoader: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-3 text-sm text-textSecondary">{message}</span>
  </div>
);

// Default error boundary
export const DefaultErrorBoundary: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="flex flex-col items-center justify-center p-8 text-center">
    <div className="text-error mb-4">
      <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold mb-2">Failed to load component</h3>
    <p className="text-sm text-textSecondary mb-4">{error.message}</p>
    <button
      onClick={retry}
      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primaryHover"
    >
      Try Again
    </button>
  </div>
);

// Enhanced lazy wrapper with performance monitoring and caching
export function createLazyComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyLoadOptions = {}
): ComponentType<T> {
  const {
    fallback: CustomFallback = DefaultLoader,
    errorBoundary: CustomErrorBoundary = DefaultErrorBoundary,
    preload = false,
    priority = 'normal',
    timeout = 10000,
    cache = true,
    cacheKey,
    appType = 'general',
    progressive,
  } = options;

  const componentKey = cacheKey || importFn.toString();
  
  // Return cached component if available
  if (cache && componentCache.has(componentKey)) {
    return componentCache.get(componentKey)!;
  }

  // Enhanced import function with performance monitoring
  const enhancedImportFn = async () => {
    // Use performance monitor singleton directly (not React hook)
    const performanceMonitor = PerformanceMonitor.getInstance();
    const { startTiming, endTiming } = {
      startTiming: performanceMonitor.startTiming.bind(performanceMonitor),
      endTiming: performanceMonitor.endTiming.bind(performanceMonitor)
    };
    
    const operationId = `lazy-load-${componentKey.slice(0, 20)}`;
    startTiming(operationId, 'component-lazy-load', 'LazyComponent');

    try {
      // Add timeout to import
      const importPromise = importFn();
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error(`Component load timeout after ${timeout}ms`)), timeout);
      });

      const loadedModule = await Promise.race([importPromise, timeoutPromise]);
      
      // Cache the component
      if (cache) {
        componentCache.set(componentKey, loadedModule.default);
      }

      endTiming(operationId, { appType, priority, cached: false });
      return loadedModule;
    } catch (error) {
      endTiming(operationId, { error: error instanceof Error ? error.message : 'Unknown error', appType });
      throw error;
    }
  };

  // Create lazy component
  const LazyComponent = lazy(enhancedImportFn);

  // Preload if requested
  if (preload) {
    preloadQueue.add(enhancedImportFn);
  }

  // Error boundary wrapper
  class LazyErrorBoundary extends React.Component<
    { children: React.ReactNode },
    { hasError: boolean; error?: Error }
  > {
    constructor(props: { children: React.ReactNode }) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error) {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('Lazy component error:', error, errorInfo);
    }

    render() {
      if (this.state.hasError) {
        return (
          <CustomErrorBoundary
            error={this.state.error!}
            retry={() => {
              // Clear component cache to force reload
              if (cache) {
                componentCache.delete(componentKey);
              }
              this.setState({ hasError: false, error: undefined });
            }}
          />
        );
      }

      return this.props.children;
    }
  }

  // Progressive loading wrapper
  const ProgressiveWrapper: React.FC<T> = (props) => {
    const [currentStage, setCurrentStage] = useState(0);
    const [stageComponents, setStageComponents] = useState<ComponentType<any>[]>([]);

    useEffect(() => {
      if (progressive?.stages) {
        // Load stages progressively
        const loadStage = async (stageIndex: number) => {
          if (stageIndex >= progressive.stages!.length) return;
          
          const stage = progressive.stages![stageIndex];
          if (stage.condition()) {
            try {
              const loadedModule = await stage.component();
              setStageComponents(prev => [...prev, loadedModule.default]);
              setCurrentStage(stageIndex + 1);
              
              // Load next stage
              setTimeout(() => loadStage(stageIndex + 1), 100);
            } catch (error) {
              console.error(`Failed to load stage ${stageIndex}:`, error);
            }
          } else {
            // Skip this stage and try the next one
            setTimeout(() => loadStage(stageIndex + 1), 100);
          }
        };

        loadStage(0);
      }
    }, []);

    if (progressive) {
      // Render skeleton first
      if (currentStage === 0 && progressive.skeleton) {
        return <progressive.skeleton {...(props as any)} />;
      }

      // Render progressive stages
      if (stageComponents[currentStage - 1]) {
        const CurrentStageComponent = stageComponents[currentStage - 1];
        return <CurrentStageComponent {...props} />;
      }
    }

    return <LazyComponent {...(props as any)} />;
  };

  // Final wrapped component
  const WrappedComponent = memo((props: T) => (
    <LazyErrorBoundary>
      <Suspense fallback={<CustomFallback />}>
        {progressive ? <ProgressiveWrapper {...(props as any)} /> : <LazyComponent {...(props as any)} />}
      </Suspense>
    </LazyErrorBoundary>
  ));

  WrappedComponent.displayName = `LazyComponent(${(LazyComponent as any).displayName || 'Unknown'})`;

  return WrappedComponent as ComponentType<T>;
}

// Application-specific lazy loading patterns
// TODO: Uncomment when actual components exist
/*
export const AccountingLazy = {
  // Heavy data table with virtualization
  DataTable: createLazyComponent(
    () => import('../components/accounting/DataTable'),
    {
      appType: 'accounting',
      priority: 'high',
      preload: true,
      fallback: () => (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 rounded mb-2"></div>
          ))}
        </div>
      ),
    }
  ),

  // Complex form with validation
  ComplexForm: createLazyComponent(
    () => import('../components/accounting/ComplexForm'),
    {
      appType: 'accounting',
      progressive: {
        skeleton: () => <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>,
        stages: [
          {
            component: () => import('../components/accounting/BasicForm'),
            condition: () => true,
          },
          {
            component: () => import('../components/accounting/ValidationRules'),
            condition: () => window.innerWidth > 768,
          },
          {
            component: () => import('../components/accounting/AdvancedFields'),
            condition: () => navigator.connection?.effectiveType !== '2g',
          },
        ],
      },
    }
  ),

  // Report generator
  ReportGenerator: createLazyComponent(
    () => import('../components/accounting/ReportGenerator'),
    {
      appType: 'accounting',
      priority: 'low',
      timeout: 15000,
    }
  ),
};
*/

/*
export const SolanaLazy = {
  // Wallet connector
  WalletConnector: createLazyComponent(
    () => import('../components/solana/WalletConnector'),
    {
      appType: 'solana',
      priority: 'high',
      preload: true,
    }
  ),

  // Token price chart
  PriceChart: createLazyComponent(
    () => import('../components/solana/PriceChart'),
    {
      appType: 'solana',
      priority: 'normal',
      progressive: {
        skeleton: () => <div className="h-64 bg-gray-200 rounded animate-pulse"></div>,
        stages: [
          {
            component: () => import('../components/solana/SimplePriceDisplay'),
            condition: () => true,
          },
          {
            component: () => import('../components/solana/FullPriceChart'),
            condition: () => window.innerWidth > 1024,
          },
        ],
      },
    }
  ),

  // Transaction history
  TransactionHistory: createLazyComponent(
    () => import('../components/solana/TransactionHistory'),
    {
      appType: 'solana',
      priority: 'low',
    }
  ),
};

export const ChatLazy = {
  // Message list with virtualization
  MessageList: createLazyComponent(
    () => import('../components/chat/MessageList'),
    {
      appType: 'chat',
      priority: 'high',
      preload: true,
      fallback: () => (
        <div className="space-y-4">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-xs p-3 bg-gray-200 rounded-lg animate-pulse">
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ),
    }
  ),

  // Rich message composer
  MessageComposer: createLazyComponent(
    () => import('../components/chat/MessageComposer'),
    {
      appType: 'chat',
      progressive: {
        skeleton: () => <div className="h-16 bg-gray-200 rounded animate-pulse"></div>,
        stages: [
          {
            component: () => import('../components/chat/BasicMessageInput'),
            condition: () => true,
          },
          {
            component: () => import('../components/chat/RichTextEditor'),
            condition: () => navigator.connection?.effectiveType !== '2g',
          },
        ],
      },
    }
  ),

  // File uploader
  FileUploader: createLazyComponent(
    () => import('../components/chat/FileUploader'),
    {
      appType: 'chat',
      priority: 'low',
    }
  ),
};

// Route-based lazy loading
export const RouteLazy = {
  // Dashboard with preloading
  Dashboard: createLazyComponent(
    () => import('../pages/dashboard'),
    {
      preload: true,
      priority: 'high',
    }
  ),

  // Settings page
  Settings: createLazyComponent(
    () => import('../pages/settings'),
    {
      priority: 'low',
    }
  ),

  // Profile page
  Profile: createLazyComponent(
    () => import('../pages/profile'),
    {
      priority: 'normal',
    }
  ),
};

// Preloading utilities
export const PreloadManager = {
  // Start preloading queued components
  startPreloading: () => {
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const preloadComponents = () => {
        if (preloadQueue.size === 0) return;
        
        const loaders = Array.from(preloadQueue);
        preloadQueue.clear();
        
        loaders.forEach(loader => {
          try {
            loader();
          } catch (error) {
            console.warn('Preload failed:', error);
          }
        });
      };

      window.requestIdleCallback(preloadComponents, { timeout: 5000 });
    }
  },

  // Preload components on route hover
  preloadOnHover: (importFn: () => Promise<any>) => {
    return {
      onMouseEnter: () => {
        setTimeout(() => importFn(), 100);
      },
    };
  },

  // Preload components on viewport intersection
  preloadOnIntersection: (importFn: () => Promise<any>, threshold = 0.1) => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return {};
    }

    return {
      ref: (element: Element | null) => {
        if (!element) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              importFn();
              observer.disconnect();
            }
          },
          { threshold }
        );

        observer.observe(element);
      },
    };
  },
};
*/

// Hook for managing component loading states
export function useComponentLoader() {
  const [loadingComponents, setLoadingComponents] = useState<Set<string>>(new Set());
  const [loadedComponents, setLoadedComponents] = useState<Set<string>>(new Set());
  const [failedComponents, setFailedComponents] = useState<Map<string, Error>>(new Map());

  const loadComponent = async (key: string, importFn: () => Promise<any>) => {
    if (loadedComponents.has(key) || loadingComponents.has(key)) {
      return;
    }

    setLoadingComponents(prev => new Set([...prev, key]));
    setFailedComponents(prev => {
      const updated = new Map(prev);
      updated.delete(key);
      return updated;
    });

    try {
      await importFn();
      setLoadedComponents(prev => new Set([...prev, key]));
    } catch (error) {
      setFailedComponents(prev => new Map([...prev, [key, error as Error]]));
    } finally {
      setLoadingComponents(prev => {
        const updated = new Set(prev);
        updated.delete(key);
        return updated;
      });
    }
  };

  const retryComponent = (key: string, importFn: () => Promise<any>) => {
    setFailedComponents(prev => {
      const updated = new Map(prev);
      updated.delete(key);
      return updated;
    });
    loadComponent(key, importFn);
  };

  return {
    loadComponent,
    retryComponent,
    isLoading: (key: string) => loadingComponents.has(key),
    isLoaded: (key: string) => loadedComponents.has(key),
    hasFailed: (key: string) => failedComponents.has(key),
    getError: (key: string) => failedComponents.get(key),
  };
}

// Initialize preloading on app startup
// TODO: Uncomment when PreloadManager is implemented
/*
if (typeof window !== 'undefined') {
  window.addEventListener('load', PreloadManager.startPreloading);
}
*/