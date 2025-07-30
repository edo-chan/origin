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
        destination: 'http://localhost:8081/api/:path*',
      },
      {
        source: '/ui/:path*',
        destination: 'http://localhost:6006/:path*',
      },
    ];
  },
  webpack: (config) => {
    config.resolve.alias['@/proto'] = path.resolve(__dirname, '../proto/gen/web');
    return config;
  },
};

module.exports = withVanillaExtract(nextConfig);