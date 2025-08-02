const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Enable experimental features for better performance
  experimental: {
    // Enable optimistic client cache
    optimisticClientCache: true,
    // Enable faster refresh
    webVitalsAttribution: ['CLS', 'LCP'],
  },

  // Compiler optimizations
  compiler: {
    // Remove React DevTools in production
    reactRemoveProperties: process.env.NODE_ENV === 'production',
    // Remove console statements in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for better caching
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*.{jpg,jpeg,png,gif,ico,svg,webp,avif}',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://envoy:8080/api/:path*',
      },
      {
        source: '/ui/:path*',
        destination: 'http://storybook:6006/:path*',
      },
    ];
  },

  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Try Docker path first, fall back to local path
    const dockerProtoPath = path.resolve(__dirname, './proto/gen/web');
    const localProtoPath = path.resolve(__dirname, '../proto/gen/web');
    const fs = require('fs');
    
    const protoPath = fs.existsSync(dockerProtoPath) ? dockerProtoPath : localProtoPath;
    config.resolve.alias['@/proto'] = protoPath;
    
    // Performance and bundle size optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Bundle size optimizations
      'lodash': 'lodash-es',
      'date-fns': 'date-fns/esm',
      
      // Protobuf optimizations
      'protobufjs/minimal': path.resolve(__dirname, 'node_modules/protobufjs/minimal.js'),
      'protobufjs': path.resolve(__dirname, 'node_modules/protobufjs/index.js'),
      
      // Application-specific optimizations
      '@/utils/performance': path.resolve(__dirname, 'src/utils/performance.ts'),
      '@/utils/lazy-loading': path.resolve(__dirname, 'src/utils/lazy-loading.tsx'),
      '@/utils/jotai-optimizations': path.resolve(__dirname, 'src/utils/jotai-optimizations.ts'),
    };
    
    // Fix protobufjs module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      buffer: false,
    };

    // Tree shaking optimizations
    config.optimization = {
      ...config.optimization,
      usedExports: true,
      sideEffects: false,
      
      // Split chunks for better caching
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          // Framework chunk (React, Next.js)
          framework: {
            chunks: 'all',
            name: 'framework',
            test: /(?:react|react-dom|scheduler|prop-types|use-subscription)/,
            priority: 40,
            enforce: true,
          },
          
          // Vendor chunk (node_modules)
          vendor: {
            chunks: 'all',
            name: 'vendor',
            test: /[\\/]node_modules[\\/]/,
            priority: 30,
            enforce: true,
            maxSize: 244000, // 244KB max chunk size
          },

          // UI Library chunk (Radix UI components)
          ui: {
            chunks: 'all',
            name: 'ui',
            test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
            priority: 35,
            enforce: true,
          },

          // State management chunk (Jotai)
          state: {
            chunks: 'all',
            name: 'state',
            test: /[\\/]node_modules[\\/]jotai[\\/]/,
            priority: 33,
            enforce: true,
          },

          // Styling chunk (Vanilla Extract)
          styling: {
            chunks: 'all',
            name: 'styling',
            test: /[\\/]node_modules[\\/]@vanilla-extract[\\/]/,
            priority: 32,
            enforce: true,
          },

          // Application-specific chunks
          accounting: {
            chunks: 'all',
            name: 'accounting',
            test: /[\\/]src[\\/](components|domain)[\\/]accounting[\\/]/,
            priority: 25,
            minChunks: 2,
          },

          solana: {
            chunks: 'all',
            name: 'solana',
            test: /[\\/]src[\\/](components|domain)[\\/]solana[\\/]/,
            priority: 25,
            minChunks: 2,
          },

          chat: {
            chunks: 'all',
            name: 'chat',
            test: /[\\/]src[\\/](components|domain)[\\/]chat[\\/]/,
            priority: 25,
            minChunks: 2,
          },

          // Shared components
          components: {
            chunks: 'all',
            name: 'components',
            test: /[\\/]src[\\/]components[\\/]/,
            priority: 20,
            minChunks: 3,
          },

          // Utils and helpers
          utils: {
            chunks: 'all',
            name: 'utils',
            test: /[\\/]src[\\/]utils[\\/]/,
            priority: 15,
            minChunks: 2,
          },
        },
      },
    };

    // Bundle analyzer (only in development or when ANALYZE=true)
    if (process.env.ANALYZE === 'true') {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }

    // Exclude heavy libraries from server-side bundles
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    // Webpack plugins for performance
    config.plugins.push(
      // Define environment variables for tree shaking
      new webpack.DefinePlugin({
        __DEV__: JSON.stringify(dev),
        __PROD__: JSON.stringify(!dev),
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      }),

      // Ignore moment.js locales (if using moment.js)
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      })
    );

    // Module rules for better tree shaking
    config.module.rules.push(

      // Optimize SVG imports
      {
        test: /\.svg$/,
        use: [
          {
            loader: '@svgr/webpack',
            options: {
              svgo: true,
              svgoConfig: {
                plugins: [
                  {
                    name: 'removeViewBox',
                    active: false,
                  },
                  {
                    name: 'removeUselessStrokeAndFill',
                    active: false,
                  },
                ],
              },
            },
          },
        ],
      }
    );

    // Performance hints
    config.performance = {
      ...config.performance,
      maxAssetSize: 250000, // 250KB
      maxEntrypointSize: 250000, // 250KB
      hints: dev ? false : 'warning',
    };

    return config;
  },
};

module.exports = withVanillaExtract(nextConfig);