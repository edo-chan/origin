/**
 * Progressive Enhancement Strategies
 * 
 * Provides progressive enhancement patterns for different application types:
 * - Feature detection and graceful degradation
 * - Network-aware loading and adaptation
 * - Device capability detection
 * - Accessibility-first progressive enhancement
 * - Performance budget management
 * - Service Worker integration for offline functionality
 */

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext } from 'react';
import { usePerformanceMonitor } from './performance';

// Device capabilities
export interface DeviceCapabilities {
  // Network
  connection: {
    effectiveType: '2g' | '3g' | '4g' | 'slow-2g' | 'unknown';
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
  
  // Hardware
  hardware: {
    memory: number; // GB
    cores: number;
    platform: string;
    touch: boolean;
    hover: boolean;
  };
  
  // Browser features
  features: {
    webp: boolean;
    avif: boolean;
    webgl: boolean;
    webgl2: boolean;
    serviceWorker: boolean;
    indexedDB: boolean;
    localStorage: boolean;
    intersection: boolean;
    resize: boolean;
    mutation: boolean;
    performance: boolean;
    webAssembly: boolean;
    offscreenCanvas: boolean;
    webWorkers: boolean;
    sharedArrayBuffer: boolean;
  };
  
  // Accessibility
  accessibility: {
    reducedMotion: boolean;
    reducedData: boolean;
    highContrast: boolean;
    darkMode: boolean;
    colorScheme: 'light' | 'dark' | 'auto';
  };
}

// Enhancement levels
export enum EnhancementLevel {
  BASIC = 'basic',      // Core functionality only
  ENHANCED = 'enhanced', // Basic + some enhancements
  PREMIUM = 'premium',   // All features enabled
}

// Progressive enhancement configuration
export interface ProgressiveConfig {
  // Performance budgets (in milliseconds)
  budgets: {
    initialLoad: number;
    interactionDelay: number;
    renderTime: number;
  };
  
  // Network thresholds
  networkThresholds: {
    slow: number;  // bytes/second
    fast: number;  // bytes/second
  };
  
  // Memory thresholds (in GB)
  memoryThresholds: {
    low: number;
    high: number;
  };
  
  // Enhancement rules
  rules: {
    disableAnimationsOnSlow: boolean;
    reduceImagesOnSlow: boolean;
    lazyLoadOnSlow: boolean;
    preloadOnFast: boolean;
    enableWebWorkersOnCapable: boolean;
  };
}

// Default configuration
const defaultConfig: ProgressiveConfig = {
  budgets: {
    initialLoad: 3000,
    interactionDelay: 100,
    renderTime: 16,
  },
  networkThresholds: {
    slow: 150000,  // 150 KB/s
    fast: 1500000, // 1.5 MB/s
  },
  memoryThresholds: {
    low: 2,   // 2 GB
    high: 8,  // 8 GB
  },
  rules: {
    disableAnimationsOnSlow: true,
    reduceImagesOnSlow: true,
    lazyLoadOnSlow: true,
    preloadOnFast: true,
    enableWebWorkersOnCapable: true,
  },
};

// Progressive enhancement context
const ProgressiveContext = createContext<{
  capabilities: DeviceCapabilities | null;
  enhancementLevel: EnhancementLevel;
  config: ProgressiveConfig;
  updateEnhancementLevel: (level: EnhancementLevel) => void;
}>({
  capabilities: null,
  enhancementLevel: EnhancementLevel.BASIC,
  config: defaultConfig,
  updateEnhancementLevel: () => {},
});

// Device capability detector
export class CapabilityDetector {
  private static instance: CapabilityDetector;
  private capabilities: DeviceCapabilities | null = null;

  static getInstance(): CapabilityDetector {
    if (!CapabilityDetector.instance) {
      CapabilityDetector.instance = new CapabilityDetector();
    }
    return CapabilityDetector.instance;
  }

  async detectCapabilities(): Promise<DeviceCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const capabilities: DeviceCapabilities = {
      connection: await this.detectConnection(),
      hardware: await this.detectHardware(),
      features: await this.detectFeatures(),
      accessibility: await this.detectAccessibility(),
    };

    this.capabilities = capabilities;
    return capabilities;
  }

  private async detectConnection(): Promise<DeviceCapabilities['connection']> {
    const nav = navigator as any;
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection;

    if (connection) {
      return {
        effectiveType: connection.effectiveType || 'unknown',
        downlink: connection.downlink || 1,
        rtt: connection.rtt || 100,
        saveData: connection.saveData || false,
      };
    }

    // Fallback network detection
    const effectiveType = await this.measureNetworkSpeed();
    
    return {
      effectiveType,
      downlink: this.estimateDownlink(effectiveType),
      rtt: this.estimateRTT(effectiveType),
      saveData: false,
    };
  }

  private async measureNetworkSpeed(): Promise<DeviceCapabilities['connection']['effectiveType']> {
    try {
      const startTime = Date.now();
      const response = await fetch('/api/speed-test', { 
        method: 'HEAD',
        cache: 'no-cache' 
      });
      const endTime = Date.now();
      
      const rtt = endTime - startTime;
      
      if (rtt > 2000) return 'slow-2g';
      if (rtt > 1400) return '2g';
      if (rtt > 700) return '3g';
      return '4g';
    } catch {
      return 'unknown';
    }
  }

  private estimateDownlink(effectiveType: string): number {
    const estimates = {
      'slow-2g': 0.025,
      '2g': 0.075,
      '3g': 0.75,
      '4g': 12,
      'unknown': 1,
    };
    return estimates[effectiveType as keyof typeof estimates] || 1;
  }

  private estimateRTT(effectiveType: string): number {
    const estimates = {
      'slow-2g': 2000,
      '2g': 1400,
      '3g': 700,
      '4g': 150,
      'unknown': 500,
    };
    return estimates[effectiveType as keyof typeof estimates] || 500;
  }

  private async detectHardware(): Promise<DeviceCapabilities['hardware']> {
    const nav = navigator as any;
    
    return {
      memory: nav.deviceMemory || 4, // Default to 4GB if not available
      cores: nav.hardwareConcurrency || 4,
      platform: nav.platform || 'unknown',
      touch: 'ontouchstart' in window || nav.maxTouchPoints > 0,
      hover: window.matchMedia('(hover: hover)').matches,
    };
  }

  private async detectFeatures(): Promise<DeviceCapabilities['features']> {
    const features: DeviceCapabilities['features'] = {
      webp: await this.supportsImageFormat('webp'),
      avif: await this.supportsImageFormat('avif'),
      webgl: this.supportsWebGL(),
      webgl2: this.supportsWebGL2(),
      serviceWorker: 'serviceWorker' in navigator,
      indexedDB: 'indexedDB' in window,
      localStorage: this.supportsLocalStorage(),
      intersection: 'IntersectionObserver' in window,
      resize: 'ResizeObserver' in window,
      mutation: 'MutationObserver' in window,
      performance: 'performance' in window && 'PerformanceObserver' in window,
      webAssembly: 'WebAssembly' in window,
      offscreenCanvas: 'OffscreenCanvas' in window,
      webWorkers: 'Worker' in window,
      sharedArrayBuffer: 'SharedArrayBuffer' in window,
    };

    return features;
  }

  private async supportsImageFormat(format: 'webp' | 'avif'): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      const testImages = {
        webp: 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA',
        avif: 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=',
      };
      
      img.src = testImages[format];
    });
  }

  private supportsWebGL(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  }

  private supportsWebGL2(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('webgl2');
    } catch {
      return false;
    }
  }

  private supportsLocalStorage(): boolean {
    try {
      const test = 'test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private async detectAccessibility(): Promise<DeviceCapabilities['accessibility']> {
    return {
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      reducedData: window.matchMedia('(prefers-reduced-data: reduce)').matches,
      highContrast: window.matchMedia('(prefers-contrast: high)').matches,
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      colorScheme: this.getColorScheme(),
    };
  }

  private getColorScheme(): 'light' | 'dark' | 'auto' {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    if (window.matchMedia('(prefers-color-scheme: light)').matches) return 'light';
    return 'auto';
  }
}

// Enhancement level calculator
export class EnhancementCalculator {
  static calculateLevel(
    capabilities: DeviceCapabilities,
    config: ProgressiveConfig
  ): EnhancementLevel {
    let score = 0;
    
    // Network scoring
    const downlinkMbps = capabilities.connection.downlink * 1000000; // Convert to bytes/second
    if (downlinkMbps >= config.networkThresholds.fast) score += 3;
    else if (downlinkMbps >= config.networkThresholds.slow) score += 2;
    else score += 1;
    
    // Hardware scoring
    if (capabilities.hardware.memory >= config.memoryThresholds.high) score += 3;
    else if (capabilities.hardware.memory >= config.memoryThresholds.low) score += 2;
    else score += 1;
    
    if (capabilities.hardware.cores >= 4) score += 2;
    else if (capabilities.hardware.cores >= 2) score += 1;
    
    // Feature scoring
    const criticalFeatures = [
      'serviceWorker', 'indexedDB', 'intersection', 'webWorkers'
    ];
    const supportedCritical = criticalFeatures.filter(
      feature => capabilities.features[feature as keyof DeviceCapabilities['features']]
    ).length;
    score += supportedCritical;
    
    // Modern format support
    if (capabilities.features.webp) score += 1;
    if (capabilities.features.avif) score += 1;
    if (capabilities.features.webgl2) score += 1;
    
    // Accessibility considerations (prioritize user preferences)
    if (capabilities.accessibility.reducedMotion) score -= 1;
    if (capabilities.accessibility.reducedData) score -= 2;
    if (capabilities.connection.saveData) score -= 2;
    
    // Calculate final level
    if (score >= 12) return EnhancementLevel.PREMIUM;
    if (score >= 8) return EnhancementLevel.ENHANCED;
    return EnhancementLevel.BASIC;
  }
}

// Progressive enhancement provider
export const ProgressiveEnhancementProvider: React.FC<{
  children: React.ReactNode;
  config?: Partial<ProgressiveConfig>;
}> = ({ children, config: customConfig = {} }) => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities | null>(null);
  const [enhancementLevel, setEnhancementLevel] = useState<EnhancementLevel>(EnhancementLevel.BASIC);
  const config = useMemo(() => ({ ...defaultConfig, ...customConfig }), [customConfig]);
  const performanceMonitor = usePerformanceMonitor();

  useEffect(() => {
    const detectAndCalculate = async () => {
      const startTime = Date.now();
      
      try {
        const detector = CapabilityDetector.getInstance();
        const caps = await detector.detectCapabilities();
        
        const level = EnhancementCalculator.calculateLevel(caps, config);
        
        setCapabilities(caps);
        setEnhancementLevel(level);
        
        // Performance tracking
        performanceMonitor?.recordMetric({
          timestamp: startTime,
          duration: Date.now() - startTime,
          operation: 'capability-detection',
          metadata: {
            level,
            networkType: caps.connection.effectiveType,
            memory: caps.hardware.memory,
            cores: caps.hardware.cores,
          },
        });
        
      } catch (error) {
        console.warn('Failed to detect capabilities:', error);
        setEnhancementLevel(EnhancementLevel.BASIC);
      }
    };

    detectAndCalculate();
  }, [config, performanceMonitor]);

  const updateEnhancementLevel = useCallback((level: EnhancementLevel) => {
    setEnhancementLevel(level);
  }, []);

  return (
    <ProgressiveContext.Provider
      value={{
        capabilities,
        enhancementLevel,
        config,
        updateEnhancementLevel,
      }}
    >
      {children}
    </ProgressiveContext.Provider>
  );
};

// Hook for using progressive enhancement
export function useProgressiveEnhancement() {
  const context = useContext(ProgressiveContext);
  
  if (!context) {
    throw new Error('useProgressiveEnhancement must be used within ProgressiveEnhancementProvider');
  }
  
  return context;
}

// Progressive component wrapper
export const Progressive: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
  level?: EnhancementLevel;
  feature?: keyof DeviceCapabilities['features'];
  condition?: (capabilities: DeviceCapabilities) => boolean;
}> = ({ children, fallback = null, level, feature, condition }) => {
  const { capabilities, enhancementLevel } = useProgressiveEnhancement();
  
  if (!capabilities) {
    return <>{fallback}</>;
  }
  
  // Check enhancement level
  if (level && !isLevelMet(enhancementLevel, level)) {
    return <>{fallback}</>;
  }
  
  // Check specific feature
  if (feature && !capabilities.features[feature]) {
    return <>{fallback}</>;
  }
  
  // Check custom condition
  if (condition && !condition(capabilities)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
};

// Helper function to check if level requirement is met
function isLevelMet(current: EnhancementLevel, required: EnhancementLevel): boolean {
  const levels = {
    [EnhancementLevel.BASIC]: 1,
    [EnhancementLevel.ENHANCED]: 2,
    [EnhancementLevel.PREMIUM]: 3,
  };
  
  return levels[current] >= levels[required];
}

// Application-specific progressive enhancement components
export const AccountingProgressive = {
  // Heavy data table with fallback to simple list
  DataTable: ({ data, fallback }: { data: any[]; fallback: React.ReactNode }) => (
    <Progressive
      level={EnhancementLevel.ENHANCED}
      fallback={fallback}
    >
      {/* Complex data table with virtualization */}
      <div>Advanced Data Table</div>
    </Progressive>
  ),

  // Chart component with canvas fallback
  Chart: ({ data, fallback }: { data: any[]; fallback: React.ReactNode }) => (
    <Progressive
      feature="webgl"
      fallback={fallback}
    >
      {/* WebGL-powered chart */}
      <div>Advanced Chart</div>
    </Progressive>
  ),

  // PDF viewer with fallback to download link
  PDFViewer: ({ src, fallback }: { src: string; fallback: React.ReactNode }) => (
    <Progressive
      condition={(caps) => caps.hardware.memory >= 2 && caps.connection.effectiveType !== 'slow-2g'}
      fallback={fallback}
    >
      {/* Complex PDF viewer */}
      <div>PDF Viewer</div>
    </Progressive>
  ),
};

export const SolanaProgressive = {
  // Real-time price chart with fallback to static prices
  PriceChart: ({ symbol, fallback }: { symbol: string; fallback: React.ReactNode }) => (
    <Progressive
      level={EnhancementLevel.ENHANCED}
      condition={(caps) => !caps.connection.saveData}
      fallback={fallback}
    >
      {/* Real-time chart with WebSocket */}
      <div>Real-time Price Chart for {symbol}</div>
    </Progressive>
  ),

  // 3D NFT viewer with fallback to image
  NFTViewer: ({ nft, fallback }: { nft: any; fallback: React.ReactNode }) => (
    <Progressive
      feature="webgl2"
      level={EnhancementLevel.PREMIUM}
      fallback={fallback}
    >
      {/* 3D NFT viewer */}
      <div>3D NFT Viewer</div>
    </Progressive>
  ),

  // Wallet integration with fallback to QR code
  WalletConnect: ({ fallback }: { fallback: React.ReactNode }) => (
    <Progressive
      condition={(caps) => caps.features.serviceWorker && !caps.accessibility.reducedData}
      fallback={fallback}
    >
      {/* Advanced wallet integration */}
      <div>Wallet Connect</div>
    </Progressive>
  ),
};

export const ChatProgressive = {
  // Rich message composer with fallback to simple textarea
  MessageComposer: ({ fallback }: { fallback: React.ReactNode }) => (
    <Progressive
      level={EnhancementLevel.ENHANCED}
      fallback={fallback}
    >
      {/* Rich text editor with media support */}
      <div>Rich Message Composer</div>
    </Progressive>
  ),

  // Voice messages with fallback to disabled state
  VoiceMessage: ({ fallback }: { fallback: React.ReactNode }) => (
    <Progressive
      condition={(caps) => 'mediaDevices' in navigator && !caps.accessibility.reducedData}
      fallback={fallback}
    >
      {/* Voice message recorder */}
      <div>Voice Message</div>
    </Progressive>
  ),

  // Video call with fallback to audio only
  VideoCall: ({ fallback }: { fallback: React.ReactNode }) => (
    <Progressive
      level={EnhancementLevel.PREMIUM}
      condition={(caps) => caps.connection.effectiveType === '4g' && caps.hardware.memory >= 4}
      fallback={fallback}
    >
      {/* Video call interface */}
      <div>Video Call</div>
    </Progressive>
  ),
};

// Performance-aware component loader
export const PerformanceAwareLoader: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
  budgetMs?: number;
}> = ({ children, fallback, budgetMs = 100 }) => {
  const [shouldRender, setShouldRender] = useState(false);
  const { capabilities } = useProgressiveEnhancement();

  useEffect(() => {
    if (!capabilities) return;

    const startTime = Date.now();
    
    // Use requestIdleCallback if available and performance allows
    const callback = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < budgetMs) {
        setShouldRender(true);
      }
    };

    if ('requestIdleCallback' in window && capabilities.hardware.cores >= 4) {
      window.requestIdleCallback(callback, { timeout: budgetMs });
    } else {
      setTimeout(callback, 0);
    }
  }, [capabilities, budgetMs]);

  return shouldRender ? <>{children}</> : <>{fallback}</>;
};

// Network-aware data loader
export const NetworkAwareLoader: React.FC<{
  children: React.ReactNode;
  fallback: React.ReactNode;
  minConnection?: '2g' | '3g' | '4g';
}> = ({ children, fallback, minConnection = '3g' }) => {
  const { capabilities } = useProgressiveEnhancement();
  
  if (!capabilities) return <>{fallback}</>;
  
  const connectionLevels = { '2g': 1, '3g': 2, '4g': 3, 'slow-2g': 0 };
  const currentLevel = (connectionLevels as any)[capabilities.connection.effectiveType] || 0;
  const requiredLevel = (connectionLevels as any)[minConnection];
  
  return currentLevel >= requiredLevel ? <>{children}</> : <>{fallback}</>;
};

// Service Worker integration for progressive enhancement
export class ProgressiveServiceWorker {
  private registration: ServiceWorkerRegistration | null = null;
  
  async register(scriptUrl: string = '/sw.js'): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptUrl);
      
      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              this.notifyUpdate();
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  private notifyUpdate(): void {
    // Dispatch custom event for app to handle
    window.dispatchEvent(new CustomEvent('sw-update-available'));
  }

  async updateServiceWorker(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }

  // Enable offline-first for capable devices
  enableOfflineFirst(): void {
    if (this.registration) {
      this.registration.active?.postMessage({ type: 'ENABLE_OFFLINE_FIRST' });
    }
  }

  // Configure caching strategy based on capabilities
  configureCaching(capabilities: DeviceCapabilities): void {
    if (!this.registration?.active) return;

    const strategy = this.determineCachingStrategy(capabilities);
    this.registration.active.postMessage({
      type: 'CONFIGURE_CACHING',
      strategy,
    });
  }

  private determineCachingStrategy(capabilities: DeviceCapabilities): string {
    if (capabilities.connection.saveData) return 'network-first';
    if (capabilities.connection.effectiveType === 'slow-2g' || capabilities.connection.effectiveType === '2g') {
      return 'cache-first';
    }
    if (capabilities.hardware.memory >= 4) return 'stale-while-revalidate';
    return 'network-first';
  }
}

// Global progressive service worker instance
export const progressiveServiceWorker = new ProgressiveServiceWorker();

// Initialize progressive enhancement
export function initializeProgressiveEnhancement(config?: Partial<ProgressiveConfig>): void {
  if (typeof window === 'undefined') return;

  // Register service worker for capable devices
  const detector = CapabilityDetector.getInstance();
  detector.detectCapabilities().then(capabilities => {
    if (capabilities.features.serviceWorker && capabilities.hardware.memory >= 2) {
      progressiveServiceWorker.register().then(success => {
        if (success) {
          progressiveServiceWorker.configureCaching(capabilities);
        }
      });
    }
  });

  // Handle service worker updates
  window.addEventListener('sw-update-available', () => {
    // App can show update notification
    console.log('App update available');
  });
}