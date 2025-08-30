# Backend Development Guidelines

This document provides backend-specific development guidelines for the Rust backend service.

## Architecture Overview

The backend follows a clean architecture pattern with clear separation of concerns:

```
backend/
├── src/
│   ├── main.rs           # Application entry point and server setup
│   ├── handler/          # gRPC service handlers (presentation layer)
│   ├── model/            # Domain models and business logic
│   ├── adapter/          # External service integrations
│   └── logging.rs        # Structured logging configuration
├── migrations/           # SQL migrations (managed by sqlx)
└── envoy/               # Envoy proxy configuration
```

## Core Principles

### 1. Error Handling
- Use `Result<T, E>` for all fallible operations
- Define custom error types using `thiserror` when needed
- Never use `unwrap()` in production code, use `?` operator or proper error handling
- Log errors with appropriate context using `tracing`

```rust
// Good
async fn get_user(id: Uuid) -> Result<User, ApiError> {
    let user = sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_one(&pool)
        .await
        .map_err(|e| {
            tracing::error!(error = ?e, user_id = %id, "Failed to fetch user");
            ApiError::DatabaseError(e.to_string())
        })?;
    Ok(user)
}

// Bad
async fn get_user(id: Uuid) -> User {
    sqlx::query_as!(User, "SELECT * FROM users WHERE id = $1", id)
        .fetch_one(&pool)
        .await
        .unwrap() // Never do this!
}
```

### 2. Async Patterns
- Use `tokio` as the async runtime
- Prefer `async/await` over raw futures
- Use `tokio::spawn` for fire-and-forget tasks
- Implement timeouts for external service calls

```rust
use tokio::time::{timeout, Duration};

async fn call_external_service() -> Result<Response, Error> {
    timeout(Duration::from_secs(30), async {
        // External service call
    })
    .await
    .map_err(|_| Error::Timeout)?
}
```

### 3. Database Operations
- Use SQLx with compile-time checked queries
- Always use parameterized queries (never string concatenation)
- Implement connection pooling with appropriate limits
- Use transactions for multi-step operations

```rust
// Use compile-time checked queries
sqlx::query_as!(
    User,
    r#"
    SELECT id, email, created_at
    FROM users
    WHERE email = $1
    "#,
    email
)
.fetch_optional(&pool)
.await?
```

### 4. Security Best Practices
- Never log sensitive data (passwords, tokens, PII)
- Use constant-time comparison for secrets
- Implement rate limiting at the handler level
- Validate all inputs before processing
- Use prepared statements for all database queries

```rust
// Redact sensitive fields in logs
#[derive(Debug)]
struct LoginRequest {
    email: String,
    #[debug(skip)] // Skip password in Debug output
    password: String,
}
```

### 5. Configuration Management
- Use AWS Parameter Store for production secrets
- Environment variables for local development only
- Define configuration structs with serde
- Validate configuration at startup

```rust
#[derive(Deserialize, Clone)]
struct Config {
    database_url: String,
    redis_url: String,
    jwt_secret: String,
    #[serde(default = "default_port")]
    port: u16,
}

fn default_port() -> u16 {
    50051
}
```

## Testing Guidelines

### Unit Tests
- Test pure business logic in isolation
- Mock external dependencies
- Aim for >80% code coverage
- Use property-based testing for complex logic

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[tokio::test]
    async fn test_user_creation() {
        // Test implementation
    }
}
```

### Integration Tests
- Test database operations with test database
- Test external service integrations with mocks
- Clean up test data after each test

```rust
// tests/integration_test.rs
#[tokio::test]
async fn test_full_authentication_flow() {
    let app = test_app().await;
    // Test implementation
}
```

## Performance Optimization

### 1. Database Queries
- Use indexes for frequently queried columns
- Batch operations when possible
- Implement query result caching with Redis
- Monitor slow queries with logging

### 2. Memory Management
- Use `Arc` for shared immutable data
- Prefer borrowing over cloning
- Use `Cow` for potentially owned data
- Profile memory usage in production

### 3. Concurrency
- Use connection pooling for database and Redis
- Implement backpressure for high-throughput operations
- Use channels for inter-task communication
- Avoid blocking operations in async contexts

## Logging and Monitoring

### Structured Logging
Always include these fields in logs:
- `service_name`: "backend"
- `request_id`: UUID for request tracing
- `user_id`: When authenticated
- `operation`: Current operation name
- `duration_ms`: For performance tracking

```rust
use tracing::{info, instrument};

#[instrument(skip(pool))]
async fn get_user(
    pool: &PgPool,
    user_id: Uuid,
) -> Result<User, Error> {
    let start = std::time::Instant::now();
    
    let user = // ... fetch user
    
    info!(
        user_id = %user_id,
        duration_ms = start.elapsed().as_millis(),
        "User fetched successfully"
    );
    
    Ok(user)
}
```

### Metrics
- Request latency (p50, p95, p99)
- Error rates by endpoint
- Database connection pool utilization
- External service call latency

## Code Style

### Naming Conventions
- `snake_case` for functions and variables
- `PascalCase` for types and traits
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names over abbreviations

### Module Organization
- Keep modules focused and cohesive
- Export only what's necessary
- Use `pub(crate)` for internal visibility
- Document public APIs with doc comments

### Documentation
- Document all public functions and types
- Include examples in doc comments
- Explain "why" not just "what"
- Keep comments up-to-date with code

```rust
/// Authenticates a user with email and OTP.
///
/// # Arguments
/// * `email` - The user's email address
/// * `otp` - The one-time password
///
/// # Returns
/// * `Ok(AuthToken)` - JWT token on successful authentication
/// * `Err(AuthError)` - Various authentication errors
///
/// # Example
/// ```
/// let token = authenticate_otp("user@example.com", "123456").await?;
/// ```
pub async fn authenticate_otp(
    email: &str,
    otp: &str,
) -> Result<AuthToken, AuthError> {
    // Implementation
}
```

## Deployment

### Health Checks
Implement health check endpoints:
- `/health/live` - Basic liveness check
- `/health/ready` - Readiness check (database, Redis connectivity)

### Graceful Shutdown
- Handle SIGTERM signal
- Complete in-flight requests
- Close database connections
- Flush logs and metrics

### Environment Variables
Required for production:
- `AWS_REGION` - AWS region for Parameter Store
- `ENVIRONMENT` - Deployment environment (dev/staging/prod)
- `SERVICE_NAME` - For logging and monitoring

## Security Checklist

- [ ] All inputs validated and sanitized
- [ ] SQL injection prevention via parameterized queries
- [ ] Rate limiting implemented
- [ ] Authentication required for protected endpoints
- [ ] Sensitive data encrypted at rest
- [ ] TLS for all external communications
- [ ] Secrets managed via AWS Parameter Store
- [ ] Audit logging for sensitive operations
- [ ] CORS properly configured
- [ ] Security headers implemented

## Common Patterns

### Repository Pattern
```rust
pub struct UserRepository {
    pool: Arc<PgPool>,
}

impl UserRepository {
    pub async fn find_by_email(&self, email: &str) -> Result<Option<User>, Error> {
        // Implementation
    }
    
    pub async fn create(&self, user: CreateUser) -> Result<User, Error> {
        // Implementation
    }
}
```

### Service Layer
```rust
pub struct AuthService {
    user_repo: UserRepository,
    otp_service: OtpService,
    jwt_service: JwtService,
}

impl AuthService {
    pub async fn login_with_otp(&self, email: &str, otp: &str) -> Result<AuthToken, Error> {
        // Business logic here
    }
}
```

### Handler Layer
```rust
#[tonic::async_trait]
impl AuthServiceServer for AuthHandler {
    async fn login(
        &self,
        request: Request<LoginRequest>,
    ) -> Result<Response<LoginResponse>, Status> {
        let req = request.into_inner();
        
        self.auth_service
            .login_with_otp(&req.email, &req.otp)
            .await
            .map(|token| Response::new(LoginResponse { token }))
            .map_err(|e| Status::unauthenticated(e.to_string()))
    }
}
```

## Development Workflow

1. **Write tests first** - TDD approach for business logic
2. **Run checks locally** - `cargo fmt && cargo clippy && cargo test`
3. **Document as you code** - Don't leave documentation for later
4. **Profile before optimizing** - Measure, don't guess
5. **Review your own PR** - Self-review before requesting reviews