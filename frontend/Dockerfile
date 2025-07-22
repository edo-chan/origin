# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Install protobuf compiler
RUN apk add --no-cache protobuf

# Copy the rest of the code
COPY . .

# Build the application (includes proto generation)
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

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
