# Claude Development Guidelines

Full-stack template: Rust backend + Next.js frontend.

## CODE PRINCIPLES
- **Simplicity**: Keep code simple and readable.

## ⚠️ CRITICAL: Generated Files

**DO NOT MODIFY GENERATED FILES**: `proto/gen/`, `proto/rust/gen/`, `target/`, `node_modules/`, `dist/`
**IGNORE ERROR IN CODE GEN**
**DO NOT INSTALL PROTOBUF ON FRONTEND**: DO NOT install `@bufbuild/protobuf` for JS/TS

**To modify APIs**: Edit `.proto` files → Run `cargo check`

## Backend (Rust)

**Stack**: Tonic gRPC, PostgreSQL/SQLx, Redis, JWT/Argon2
**Commands**: `cargo fmt|clippy` (from backend/)
**Structure**: `src/main.rs`, `src/handler/`, `src/model/`, `src/adapter/`

**Code Style**:
- Use `snake_case` functions, `PascalCase` types
- `Result<T, E>` error handling
- `async/await` for I/O
- `tracing::info!()` not `println!()`

**Logging Required Fields**: service_name, request_id, user_id, operation

## Frontend (Next.js)

**Stack**: Next.js 14, TypeScript, Vanilla Extract, Jotai, Storybook
**Commands**: `npm run dev|build|lint|storybook` (from frontend/)
**Structure**: `src/components/`, `src/domain/`, `src/pages/`, `src/styles/`

**Code Style**:
- Functional components + hooks
- TypeScript interfaces for props
- Atomic design patterns
- Structured console logging

## Development Workflow

**Local Dev**: `tilt up`
**Services**: Frontend (3000), Backend gRPC (50051), Envoy (49999), PostgreSQL (5432), Redis (6379)
**Debugging**: `tilt logs <service-name>`

**Database**: Create migrations in `backend/migrations/`, run `sqlx migrate run`
**API Changes**: Edit `.proto` → `cargo check` → Update handlers

**Testing**: `cargo test` (backend), Storybook (frontend)

## Security
- Never commit secrets
- Use environment variables
- Validate all inputs
- No sensitive data in logs