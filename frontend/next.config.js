const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const path = require('path');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
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
  webpack: (config) => {
    // Try Docker path first, fall back to local path
    const dockerProtoPath = path.resolve(__dirname, './proto/gen/web');
    const localProtoPath = path.resolve(__dirname, '../proto/gen/web');
    const fs = require('fs');
    
    const protoPath = fs.existsSync(dockerProtoPath) ? dockerProtoPath : localProtoPath;
    config.resolve.alias['@/proto'] = protoPath;
    
    // Fix protobufjs module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
    };
    
    // Add protobufjs alias to handle imports correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      'protobufjs/minimal': path.resolve(__dirname, 'node_modules/protobufjs/minimal.js'),
      'protobufjs': path.resolve(__dirname, 'node_modules/protobufjs/index.js')
    };
    
    return config;
  },
};

module.exports = withVanillaExtract(nextConfig);