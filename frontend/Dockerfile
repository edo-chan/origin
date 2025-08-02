# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    protobuf \
    py3-pip

# Copy package files and .npmrc
COPY frontend/package*.json ./
COPY frontend/.npmrc ./

# Set npm configuration for Alpine build
ENV npm_config_target_platform=linux
ENV npm_config_target_arch=arm64
ENV npm_config_python=/usr/bin/python3

# Install dependencies using npm ci for faster, reliable builds
RUN npm ci --legacy-peer-deps --ignore-scripts

# Rebuild native modules for the current platform
RUN npm rebuild

# Copy the frontend code
COPY frontend/ .

# Copy proto files from root directory
COPY proto/gen/web ./proto/gen/web

# Build the application (includes proto generation)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from the build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/proto/gen ./proto/gen

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
