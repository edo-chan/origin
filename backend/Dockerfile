# Use cargo-chef for better dependency caching
FROM rust:1.88 as chef
RUN cargo install cargo-chef

# Plan stage - analyze dependencies
FROM chef as planner
WORKDIR /usr/src/app

# Install system dependencies first (this layer rarely changes)
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    curl \
    lld \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm (this layer rarely changes)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy project files for dependency analysis
COPY backend/Cargo.toml backend/Cargo.lock ./backend/
COPY backend/build.rs ./backend/
COPY backend/src ./backend/src
COPY proto ./proto
COPY googleapis ./googleapis
COPY frontend/package*.json ./frontend/

WORKDIR /usr/src/app/backend
RUN cargo chef prepare --recipe-path recipe.json

# Build dependencies stage
FROM chef as dependencies
WORKDIR /usr/src/app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    protobuf-compiler \
    curl \
    lld \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Copy proto files, googleapis, and frontend package.json (needed for build.rs)
COPY proto ./proto
COPY googleapis ./googleapis
COPY frontend/package*.json ./frontend/

# Copy the recipe and build dependencies
COPY --from=planner /usr/src/app/backend/recipe.json ./backend/recipe.json
WORKDIR /usr/src/app/backend
RUN CARGO_BUILD_JOBS=$(nproc) cargo chef cook --release --recipe-path recipe.json

# Build stage - build the actual application
FROM dependencies as builder

# Copy the source code
COPY backend/src ./src
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/build.rs ./

# Build the application (dependencies are already built)
# Use all available CPU cores for compilation
RUN CARGO_BUILD_JOBS=$(nproc) cargo build --release

# Runtime stage - minimal image for running the application
FROM debian:bookworm-slim as runtime

# Install only runtime dependencies
RUN apt-get update && \
    apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Create a non-root user for security
RUN groupadd -r appuser && useradd -r -g appuser appuser

# Copy the binary from builder stage
COPY --from=builder /usr/src/app/backend/target/release/template /usr/local/bin/template

# Change ownership to appuser
RUN chown appuser:appuser /usr/local/bin/template

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 50051 8081

# Set environment variables for better performance
ENV RUST_LOG=info
ENV RUST_BACKTRACE=1


# Run the application
CMD ["template"]
