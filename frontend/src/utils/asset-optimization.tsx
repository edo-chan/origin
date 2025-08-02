/**
 * Image and Asset Optimization Patterns
 * 
 * Provides comprehensive asset optimization for different application types:
 * - Responsive image loading with modern formats (WebP, AVIF)
 * - Progressive image enhancement with blur-up technique
 * - Lazy loading with intersection observer
 * - Asset preloading and prefetching strategies
 * - CDN integration and dynamic optimization
 * - Memory-efficient image handling
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import NextImage from 'next/image';
import { usePerformanceMonitor } from './performance';

// Image optimization configurations
export interface ImageConfig {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  sizes?: string;
  priority?: boolean;
  lazy?: boolean;
  placeholder?: 'blur' | 'empty' | string;
  blurDataURL?: string;
  fadeIn?: boolean;
  aspectRatio?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  loading?: 'lazy' | 'eager';
}

// Responsive breakpoints
export interface ResponsiveBreakpoints {
  xs?: number;   // 375px
  sm?: number;   // 640px
  md?: number;   // 768px
  lg?: number;   // 1024px
  xl?: number;   // 1280px
  '2xl'?: number; // 1536px
}

// Asset loading states
export enum AssetLoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  LOADED = 'loaded',
  ERROR = 'error',
}

// CDN providers
export enum CDNProvider {
  CLOUDINARY = 'cloudinary',
  IMGIX = 'imgix',
  CLOUDFLARE = 'cloudflare',
  VERCEL = 'vercel',
  CUSTOM = 'custom',
}

// CDN configuration
export interface CDNConfig {
  provider: CDNProvider;
  baseUrl: string;
  apiKey?: string;
  cloudName?: string; // Cloudinary specific
  transformations?: Record<string, any>;
}

// Image loading statistics
export interface ImageStats {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  totalBytes: number;
  avgLoadTime: number;
  cacheHits: number;
  formatDistribution: Record<string, number>;
}

// Advanced image component with optimization
export const OptimizedImage = memo<ImageConfig & {
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onLoad?: () => void;
  onError?: () => void;
}>(({
  src,
  alt,
  width,
  height,
  quality = 75,
  format = 'auto',
  sizes,
  priority = false,
  lazy = true,
  placeholder = 'blur',
  blurDataURL,
  fadeIn = true,
  aspectRatio,
  objectFit = 'cover',
  loading = 'lazy',
  className = '',
  style = {},
  onClick,
  onLoad,
  onError,
}) => {
  const [loadingState, setLoadingState] = useState<AssetLoadingState>(AssetLoadingState.IDLE);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [isVisible, setIsVisible] = useState(!lazy || priority);
  
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const performanceMonitor = usePerformanceMonitor();

  // Generate responsive srcSet
  const generateSrcSet = useCallback((baseSrc: string, baseWidth?: number): string => {
    if (!baseWidth) return baseSrc;

    const densities = [1, 1.5, 2, 3];
    const srcSet = densities.map(density => {
      const scaledWidth = Math.round(baseWidth * density);
      const optimizedSrc = optimizeImageUrl(baseSrc, {
        width: scaledWidth,
        quality,
        format,
      });
      return `${optimizedSrc} ${density}x`;
    });

    return srcSet.join(', ');
  }, [quality, format]);

  // Generate sizes attribute
  const generateSizes = useCallback((customSizes?: string): string => {
    if (customSizes) return customSizes;
    if (!width) return '100vw';

    return `(max-width: 640px) 100vw, (max-width: 768px) 50vw, ${width}px`;
  }, [width]);

  // Setup lazy loading observer
  useEffect(() => {
    if (!lazy || priority || isVisible) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.1,
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [lazy, priority, isVisible]);

  // Load image when visible
  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now();
    setLoadingState(AssetLoadingState.LOADING);

    const img = new Image();
    
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      
      setCurrentSrc(img.src);
      setLoadingState(AssetLoadingState.LOADED);
      
      // Performance tracking
      performanceMonitor?.recordMetric({
        timestamp: startTime,
        duration: loadTime,
        operation: 'image-load',
        metadata: {
          src: img.src,
          width: img.naturalWidth,
          height: img.naturalHeight,
          size: img.src.length, // Approximate
          format: getImageFormat(img.src),
        },
      });

      onLoad?.();
    };

    img.onerror = () => {
      setLoadingState(AssetLoadingState.ERROR);
      
      performanceMonitor?.recordMetric({
        timestamp: startTime,
        duration: Date.now() - startTime,
        operation: 'image-error',
        metadata: { src: img.src },
      });

      onError?.();
    };

    // Set progressive loading
    const optimizedSrc = optimizeImageUrl(src, {
      width,
      height,
      quality,
      format,
    });

    if (width) {
      img.srcset = generateSrcSet(src, width);
      img.sizes = generateSizes(sizes);
    }
    
    img.src = optimizedSrc;

  }, [isVisible, src, width, height, quality, format, sizes, generateSrcSet, generateSizes, performanceMonitor, onLoad, onError]);

  // Generate placeholder
  const renderPlaceholder = () => {
    if (placeholder === 'empty') return null;
    
    if (placeholder === 'blur' || blurDataURL) {
      return (
        <div
          className="absolute inset-0 bg-gray-200"
          style={{
            backgroundImage: blurDataURL ? `url(${blurDataURL})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(10px)',
            transform: 'scale(1.1)', // Prevent blur edges
          }}
        />
      );
    }

    if (typeof placeholder === 'string') {
      return (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center"
        >
          <span className="text-gray-500 text-sm">{placeholder}</span>
        </div>
      );
    }

    return null;
  };

  // Calculate container styles
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    overflow: 'hidden',
    ...style,
    ...(aspectRatio && {
      aspectRatio: aspectRatio.toString(),
    }),
    ...(width && height && {
      width,
      height,
    }),
  };

  // Calculate image styles
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit,
    transition: fadeIn ? 'opacity 0.3s ease-in-out' : 'none',
    opacity: loadingState === AssetLoadingState.LOADED ? 1 : 0,
  };

  return (
    <div
      className={`${className}`}
      style={containerStyle}
      onClick={onClick}
    >
      {/* Placeholder */}
      {loadingState !== AssetLoadingState.LOADED && renderPlaceholder()}
      
      {/* Main image */}
      {isVisible && (
        <NextImage
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width || 400}
          height={height || 300}
          style={imageStyle}
          loading={loading}
          decoding="async"
        />
      )}
      
      {/* Error state */}
      {loadingState === AssetLoadingState.ERROR && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

// Image format detection
function getImageFormat(src: string): string {
  const url = new URL(src, window.location.origin);
  const pathname = url.pathname.toLowerCase();
  
  if (pathname.includes('.webp')) return 'webp';
  if (pathname.includes('.avif')) return 'avif';
  if (pathname.includes('.jpg') || pathname.includes('.jpeg')) return 'jpeg';
  if (pathname.includes('.png')) return 'png';
  if (pathname.includes('.gif')) return 'gif';
  if (pathname.includes('.svg')) return 'svg';
  
  return 'unknown';
}

// CDN URL optimization
export function optimizeImageUrl(
  src: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
    cdnConfig?: CDNConfig;
  } = {}
): string {
  const { width, height, quality = 75, format = 'auto', cdnConfig } = options;

  // If no CDN config, return original (Next.js Image optimization handles this)
  if (!cdnConfig) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality !== 75) params.set('q', quality.toString());
    if (format !== 'auto') params.set('f', format);
    
    const query = params.toString();
    return query ? `${src}?${query}` : src;
  }

  switch (cdnConfig.provider) {
    case CDNProvider.CLOUDINARY:
      return optimizeCloudinaryUrl(src, { width, height, quality, format }, cdnConfig);
    case CDNProvider.IMGIX:
      return optimizeImgixUrl(src, { width, height, quality, format }, cdnConfig);
    case CDNProvider.CLOUDFLARE:
      return optimizeCloudflareUrl(src, { width, height, quality, format }, cdnConfig);
    default:
      return src;
  }
}

// Cloudinary optimization
function optimizeCloudinaryUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number; format?: string },
  config: CDNConfig
): string {
  const { width, height, quality, format } = options;
  const transformations = [];

  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (quality) transformations.push(`q_${quality}`);
  if (format && format !== 'auto') transformations.push(`f_${format}`);
  
  // Add automatic format selection
  transformations.push('f_auto');
  
  const transformation = transformations.join(',');
  return `${config.baseUrl}/${transformation}/${src}`;
}

// Imgix optimization
function optimizeImgixUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number; format?: string },
  config: CDNConfig
): string {
  const { width, height, quality, format } = options;
  const params = new URLSearchParams();

  if (width) params.set('w', width.toString());
  if (height) params.set('h', height.toString());
  if (quality) params.set('q', quality.toString());
  if (format && format !== 'auto') params.set('fm', format);
  
  // Add automatic format selection
  params.set('auto', 'format,compress');
  
  return `${config.baseUrl}/${src}?${params.toString()}`;
}

// Cloudflare optimization
function optimizeCloudflareUrl(
  src: string,
  options: { width?: number; height?: number; quality?: number; format?: string },
  config: CDNConfig
): string {
  const { width, height, quality, format } = options;
  const params = new URLSearchParams();

  if (width) params.set('width', width.toString());
  if (height) params.set('height', height.toString());
  if (quality) params.set('quality', quality.toString());
  if (format && format !== 'auto') params.set('f', format);
  
  return `${config.baseUrl}/cdn-cgi/image/${params.toString()}/${src}`;
}

// Progressive image component with blur-up technique
export const ProgressiveImage: React.FC<ImageConfig & {
  lowQualitySrc?: string;
  className?: string;
}> = ({ src, lowQualitySrc, alt, className, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(lowQualitySrc || '');

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCurrentSrc(src);
      setIsLoaded(true);
    };
    img.src = src;
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {lowQualitySrc && !isLoaded && (
        <OptimizedImage
          src={lowQualitySrc}
          alt={alt}
          className="absolute inset-0 scale-110 filter blur-sm"
          quality={10}
          {...props}
        />
      )}
      
      <OptimizedImage
        src={currentSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        {...props}
      />
    </div>
  );
};

// Image gallery with virtual scrolling
export const ImageGallery: React.FC<{
  images: Array<ImageConfig & { id: string }>;
  columns?: number;
  gap?: number;
  className?: string;
}> = ({ images, columns = 3, gap = 16, className = '' }) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Virtual scrolling implementation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, clientHeight } = container;
      const itemHeight = 200; // Approximate item height
      const itemsPerRow = columns;
      const rowHeight = itemHeight + gap;
      
      const startRow = Math.floor(scrollTop / rowHeight);
      const endRow = startRow + Math.ceil(clientHeight / rowHeight) + 2;
      
      const start = startRow * itemsPerRow;
      const end = Math.min(endRow * itemsPerRow, images.length);
      
      setVisibleRange({ start, end });
    };

    container.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial calculation

    return () => container.removeEventListener('scroll', handleScroll);
  }, [images.length, columns, gap]);

  const visibleImages = images.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-auto ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: `${gap}px`,
        padding: `${gap}px`,
      }}
    >
      {/* Spacer for items before visible range */}
      {visibleRange.start > 0 && (
        <div
          style={{
            gridColumn: `1 / -1`,
            height: Math.floor(visibleRange.start / columns) * (200 + gap),
          }}
        />
      )}
      
      {visibleImages.map((image) => (
        <OptimizedImage
          key={image.id}
          {...image}
          className="w-full h-48 rounded-lg"
          aspectRatio={1}
        />
      ))}
      
      {/* Spacer for items after visible range */}
      {visibleRange.end < images.length && (
        <div
          style={{
            gridColumn: `1 / -1`,
            height: Math.ceil((images.length - visibleRange.end) / columns) * (200 + gap),
          }}
        />
      )}
    </div>
  );
};

// Asset preloader for critical resources
export class AssetPreloader {
  private preloadedAssets = new Set<string>();
  private loadingAssets = new Map<string, Promise<void>>();
  private stats: ImageStats = {
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    totalBytes: 0,
    avgLoadTime: 0,
    cacheHits: 0,
    formatDistribution: {},
  };

  // Preload single image
  async preloadImage(src: string, options: {
    priority?: 'high' | 'normal' | 'low';
    crossOrigin?: string;
  } = {}): Promise<void> {
    if (this.preloadedAssets.has(src)) {
      this.stats.cacheHits++;
      return;
    }

    // Return existing loading promise if already loading
    if (this.loadingAssets.has(src)) {
      return this.loadingAssets.get(src)!;
    }

    const startTime = Date.now();
    this.stats.totalImages++;

    const loadPromise = new Promise<void>((resolve, reject) => {
      const img = new Image();
      
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }

      img.onload = () => {
        const loadTime = Date.now() - startTime;
        this.stats.loadedImages++;
        this.stats.avgLoadTime = (this.stats.avgLoadTime + loadTime) / this.stats.loadedImages;
        
        const format = getImageFormat(src);
        this.stats.formatDistribution[format] = (this.stats.formatDistribution[format] || 0) + 1;
        
        this.preloadedAssets.add(src);
        this.loadingAssets.delete(src);
        resolve();
      };

      img.onerror = () => {
        this.stats.failedImages++;
        this.loadingAssets.delete(src);
        reject(new Error(`Failed to preload image: ${src}`));
      };

      img.src = src;
    });

    this.loadingAssets.set(src, loadPromise);
    return loadPromise;
  }

  // Preload multiple images
  async preloadImages(
    sources: string[],
    options: {
      concurrent?: number;
      priority?: 'high' | 'normal' | 'low';
    } = {}
  ): Promise<void> {
    const { concurrent = 4 } = options;
    
    // Process images in batches
    for (let i = 0; i < sources.length; i += concurrent) {
      const batch = sources.slice(i, i + concurrent);
      await Promise.allSettled(
        batch.map(src => this.preloadImage(src, options))
      );
    }
  }

  // Preload critical above-the-fold images
  preloadCriticalImages(selector: string = 'img[data-priority="high"]'): void {
    const criticalImages = document.querySelectorAll(selector);
    const sources = Array.from(criticalImages)
      .map(img => (img as HTMLImageElement).src)
      .filter(Boolean);

    this.preloadImages(sources, { priority: 'high', concurrent: 6 });
  }

  // Get preloader statistics
  getStats(): ImageStats {
    return { ...this.stats };
  }

  // Clear preload cache
  clearCache(): void {
    this.preloadedAssets.clear();
    this.stats = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalBytes: 0,
      avgLoadTime: 0,
      cacheHits: 0,
      formatDistribution: {},
    };
  }
}

// Application-specific image optimization strategies
export const AccountingImageOptimizer = {
  // Document and receipt images with OCR optimization
  optimizeDocumentImage: (src: string, options: {
    enhance?: boolean;
    compress?: boolean;
    maxWidth?: number;
  } = {}) => {
    const { enhance = true, compress = true, maxWidth = 1200 } = options;
    
    return optimizeImageUrl(src, {
      width: maxWidth,
      quality: compress ? 85 : 95,
      format: enhance ? 'webp' : 'jpeg',
    });
  },

  // Chart and graph images for reports
  optimizeChartImage: (src: string, retina: boolean = true) => {
    return optimizeImageUrl(src, {
      width: retina ? 800 : 400,
      height: retina ? 600 : 300,
      quality: 90, // High quality for charts
      format: 'png', // Better for charts with text
    });
  },
};

export const SolanaImageOptimizer = {
  // NFT images with metadata preservation
  optimizeNFTImage: (src: string, size: 'thumbnail' | 'medium' | 'large' = 'medium') => {
    const dimensions = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
    };

    return optimizeImageUrl(src, {
      ...dimensions[size],
      quality: 90,
      format: 'webp',
    });
  },

  // Token logos and icons
  optimizeTokenIcon: (src: string, size: number = 32) => {
    return optimizeImageUrl(src, {
      width: size,
      height: size,
      quality: 95,
      format: 'png', // Better for icons
    });
  },
};

export const ChatImageOptimizer = {
  // Message attachments with progressive loading
  optimizeMessageImage: (src: string, options: {
    thumbnail?: boolean;
    quality?: number;
  } = {}) => {
    const { thumbnail = false, quality = 80 } = options;
    
    return optimizeImageUrl(src, {
      width: thumbnail ? 200 : 800,
      height: thumbnail ? 200 : 600,
      quality,
      format: 'webp',
    });
  },

  // Avatar images
  optimizeAvatar: (src: string, size: number = 40) => {
    return optimizeImageUrl(src, {
      width: size,
      height: size,
      quality: 85,
      format: 'webp',
    });
  },

  // Media previews in chat
  optimizeMediaPreview: (src: string) => {
    return optimizeImageUrl(src, {
      width: 300,
      height: 200,
      quality: 75,
      format: 'webp',
    });
  },
};

// Global asset preloader instance
export const globalAssetPreloader = new AssetPreloader();

// React hook for asset preloading
export function useAssetPreloader() {
  const preloadImage = useCallback((src: string, options?: any) => {
    return globalAssetPreloader.preloadImage(src, options);
  }, []);

  const preloadImages = useCallback((sources: string[], options?: any) => {
    return globalAssetPreloader.preloadImages(sources, options);
  }, []);

  const getStats = useCallback(() => {
    return globalAssetPreloader.getStats();
  }, []);

  return {
    preloadImage,
    preloadImages,
    getStats,
  };
}

// Initialize critical asset preloading
if (typeof window !== 'undefined') {
  // Preload critical images when page loads
  window.addEventListener('load', () => {
    globalAssetPreloader.preloadCriticalImages();
  });
}