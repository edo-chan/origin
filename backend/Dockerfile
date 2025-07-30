FROM rust:1.88 as builder

WORKDIR /usr/src/app
COPY . .

RUN apt-get update && apt-get install -y protobuf-compiler curl && rm -rf /var/lib/apt/lists/*
# Install Node.js and npm
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Change to backend directory for cargo build
WORKDIR /usr/src/app/backend
RUN cargo build --release

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/src/app/backend/target/release/template /usr/local/bin/template

EXPOSE 50051 8081

CMD ["template"]
