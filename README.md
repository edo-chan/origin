# Template Project

A full-stack application template for building modern web applications with a Rust backend and Next.js frontend.

![Rust Backend CI](https://github.com/edo-chan/origin/actions/workflows/rust.yml/badge.svg?branch=main)

## Overview

This template provides a starting point for building full-stack applications with:

- Rust backend with gRPC API
- Next.js frontend with TypeScript
- PostgreSQL database
- Envoy proxy for HTTP/gRPC translation
- Docker for containerization
- Terraform for infrastructure provisioning
- Tilt for local development

## Project Structure

```
.
├── backend/                 # Rust backend service
│   ├── proto/               # Protocol Buffers definitions
│   ├── src/                 # Rust source code
│   ├── envoy/               # Envoy proxy configuration
│   └── build.rs             # Custom build script
├── frontend/                # Next.js frontend
│   ├── src/                 # TypeScript source code
│   └── proto/               # Generated TypeScript from Protocol Buffers
├── terraform/               # Infrastructure as code
├── docker-compose.yml       # Docker Compose configuration
└── Tiltfile                 # Tilt configuration for local development
```

## Technologies

### Backend
- Rust
- Tonic (gRPC)
- Protocol Buffers
- SQLx (PostgreSQL)
- Tokio (async runtime)

### Frontend
- Next.js
- React
- TypeScript
- Vanilla Extract (CSS-in-JS)
- Jotai (state management)

### Infrastructure
- Docker
- Envoy Proxy
- PostgreSQL
- Terraform
- Tilt

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install)
- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Protocol Buffers Compiler](https://grpc.io/docs/protoc-installation/)
- [Tilt](https://docs.tilt.dev/install.html) (optional, for local development)
- [Terraform](https://learn.hashicorp.com/tutorials/terraform/install-cli) (optional, for infrastructure provisioning)

## Getting Started

### Local Development with Tilt

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/template.git
   cd template
   ```

2. Start the development environment with Tilt:
   ```bash
   tilt up
   ```

3. Access the services:
   - Frontend: http://localhost:3000
   - Backend gRPC: localhost:50051
   - Envoy Proxy (HTTP to gRPC): http://localhost:8080
   - PostgreSQL: localhost:5432

### Manual Setup

1. Start the PostgreSQL database:
   ```bash
   docker-compose up -d postgres
   ```

2. Build and run the backend:
   ```bash
   cd backend
   cargo build
   cargo run
   ```

3. Build and run the frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. Start the Envoy proxy:
   ```bash
   docker-compose up -d envoy
   ```

## Deployment

### Using Docker Compose

```bash
docker-compose up -d
```

### Using Terraform

```bash
cd terraform
terraform init
terraform apply
```

## Development Workflow

1. Make changes to the backend or frontend code
2. If using Tilt, changes will be automatically detected and services will be rebuilt
3. If not using Tilt, rebuild and restart the affected services manually

## License

[MIT](LICENSE)
