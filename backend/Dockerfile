# Multi-stage build for optimized Docker image
FROM rust:1.88-slim as base

# Install all build dependencies in a single layer with cleanup
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    protobuf-compiler \
    curl \
    lld \
    clang \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Install cargo-chef for dependency caching
RUN cargo install cargo-chef --locked

# Configure Rust for optimal builds
ENV CARGO_NET_GIT_FETCH_WITH_CLI=true \
    CARGO_REGISTRIES_CRATES_IO_PROTOCOL=sparse \
    RUSTFLAGS="-C link-arg=-fuse-ld=lld"

# Dependency planner stage
FROM base as planner
WORKDIR /app

# Copy only manifest files for dependency analysis
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/build.rs ./

# Create minimal source structure for cargo-chef
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Create minimal proto structure for build.rs
RUN mkdir -p ../proto && \
    echo 'syntax = "proto3"; package greeter;' > ../proto/greeter.proto && \
    echo 'syntax = "proto3"; package auth;' > ../proto/auth.proto

# Create minimal googleapis structure
RUN mkdir -p ../googleapis/google/api && \
    touch ../googleapis/google/api/annotations.proto ../googleapis/google/api/http.proto

# Create minimal frontend package.json for build.rs
RUN mkdir -p ../frontend && echo '{"name":"frontend"}' > ../frontend/package.json

# Generate dependency recipe
RUN cargo chef prepare --recipe-path recipe.json

# Dependencies build stage
FROM base as deps
WORKDIR /app

# Copy recipe from planner
COPY --from=planner /app/recipe.json ./

# Create same minimal structure as planner
RUN mkdir -p ../proto ../googleapis/google/api ../frontend && \
    echo 'syntax = "proto3"; package greeter;' > ../proto/greeter.proto && \
    echo 'syntax = "proto3"; package auth;' > ../proto/auth.proto && \
    touch ../googleapis/google/api/annotations.proto ../googleapis/google/api/http.proto && \
    echo '{"name":"frontend"}' > ../frontend/package.json

# Build dependencies with cache mounts
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=target \
    cargo chef cook --release --recipe-path recipe.json

# Final build stage
FROM deps as builder
WORKDIR /app

# Copy source code
COPY backend/src ./src
COPY backend/Cargo.toml backend/Cargo.lock backend/build.rs ./

# Copy complete proto files and dependencies for build
COPY proto ../proto
COPY googleapis ../googleapis
COPY frontend/package.json ../frontend/

# Build application with cache mounts and copy binary out
RUN --mount=type=cache,target=/usr/local/cargo/registry \
    --mount=type=cache,target=/usr/local/cargo/git \
    --mount=type=cache,target=target \
    cargo build --release --bin template && \
    cp target/release/template /usr/local/bin/template && \
    strip /usr/local/bin/template

# Runtime stage - minimal distroless image
FROM gcr.io/distroless/cc-debian12

# Copy the stripped binary from builder
COPY --from=builder /usr/local/bin/template /usr/local/bin/template

# Set optimal runtime environment
ENV RUST_LOG=info \
    RUST_BACKTRACE=0 \
    MALLOC_ARENA_MAX=2

# Expose gRPC port
EXPOSE 50051

# Use non-root user for security
USER 65532:65532

# Run the application
ENTRYPOINT ["/usr/local/bin/template"]
