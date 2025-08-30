# Technical Requirements Document: OTP-Only Authentication MVP

## Executive Summary

This document outlines the technical implementation for the absolute simplest secure authentication system using only One-Time Passwords (OTP) sent via email. This approach eliminates password management complexity while maintaining security.

## System Architecture

### Design Principles
1. **Simplicity First**: No passwords, no password resets, no password policies
2. **Minimal Database**: Only essential tables and columns, no extra indexes
3. **Stateless OTP**: OTPs are generated and validated without complex state management
4. **Security by Design**: Secure despite simplicity

### High-Level Flow

```
User Login Request → Generate OTP → Send Email → User Enters OTP → Validate → Issue JWT
```

## Database Schema (Minimal)

```sql
-- Users table (minimal fields only)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTP table (temporary storage)
CREATE TABLE otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email VARCHAR(255) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table (JWT refresh tokens)
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No additional indexes beyond primary keys and the unique constraint on email
```

## API Design

### Proto Definition

```protobuf
syntax = "proto3";

package auth;

service AuthService {
  // Step 1: Request OTP
  rpc RequestOTP(RequestOTPRequest) returns (RequestOTPResponse);
  
  // Step 2: Verify OTP and get tokens
  rpc VerifyOTP(VerifyOTPRequest) returns (AuthResponse);
  
  // Token management
  rpc RefreshToken(RefreshTokenRequest) returns (AuthResponse);
  rpc Logout(LogoutRequest) returns (LogoutResponse);
}

message RequestOTPRequest {
  string email = 1;
}

message RequestOTPResponse {
  string message = 1; // "OTP sent to your email"
  int32 expires_in_seconds = 2; // 300 (5 minutes)
}

message VerifyOTPRequest {
  string email = 1;
  string otp = 2;
}

message AuthResponse {
  string access_token = 1;
  string refresh_token = 2;
  User user = 3;
}

message User {
  string id = 1;
  string email = 2;
  string full_name = 3;
}

message RefreshTokenRequest {
  string refresh_token = 1;
}

message LogoutRequest {
  string refresh_token = 1;
}

message LogoutResponse {
  bool success = 1;
}
```

## Implementation Details

### OTP Generation and Management

```rust
// Simple OTP generation
fn generate_otp() -> String {
    use rand::Rng;
    let mut rng = rand::thread_rng();
    format!("{:06}", rng.gen_range(100000..999999))
}

// OTP storage with 5-minute expiry
async fn store_otp(email: &str, code: &str, pool: &PgPool) -> Result<()> {
    sqlx::query!(
        "INSERT INTO otps (user_email, code, expires_at) 
         VALUES ($1, $2, NOW() + INTERVAL '5 minutes')",
        email,
        code
    )
    .execute(pool)
    .await?;
    Ok(())
}

// OTP validation
async fn validate_otp(email: &str, code: &str, pool: &PgPool) -> Result<bool> {
    let result = sqlx::query!(
        "UPDATE otps 
         SET used = true 
         WHERE user_email = $1 
           AND code = $2 
           AND expires_at > NOW() 
           AND used = false
         RETURNING id",
        email,
        code
    )
    .fetch_optional(pool)
    .await?;
    
    Ok(result.is_some())
}
```

### Email Service Integration

```rust
use aws_sdk_ses::Client as SesClient;

async fn send_otp_email(email: &str, otp: &str) -> Result<()> {
    let ses_client = SesClient::new(&aws_config::load_from_env().await);
    
    let subject = "Your login code";
    let body = format!(
        "Your login code is: {}\n\nThis code expires in 5 minutes.",
        otp
    );
    
    ses_client
        .send_email()
        .source("noreply@yourapp.com")
        .destination(
            Destination::builder()
                .to_addresses(email)
                .build()
        )
        .message(
            Message::builder()
                .subject(Content::builder().data(subject).build())
                .body(
                    Body::builder()
                        .text(Content::builder().data(body).build())
                        .build()
                )
                .build()
        )
        .send()
        .await?;
    
    Ok(())
}
```

### JWT Token Management

```rust
use jsonwebtoken::{encode, decode, Header, Algorithm, Validation, EncodingKey, DecodingKey};

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String, // user_id
    email: String,
    exp: usize,  // expiration
}

fn generate_tokens(user_id: &str, email: &str) -> Result<(String, String)> {
    let access_claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp: (Utc::now() + Duration::minutes(15)).timestamp() as usize,
    };
    
    let refresh_claims = Claims {
        sub: user_id.to_string(),
        email: email.to_string(),
        exp: (Utc::now() + Duration::days(30)).timestamp() as usize,
    };
    
    let access_token = encode(
        &Header::default(),
        &access_claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref())
    )?;
    
    let refresh_token = encode(
        &Header::default(),
        &refresh_claims,
        &EncodingKey::from_secret(JWT_SECRET.as_ref())
    )?;
    
    Ok((access_token, refresh_token))
}
```

### Rate Limiting

Simple in-memory rate limiting using Redis:

```rust
use deadpool_redis::{Pool, Connection};

async fn check_rate_limit(email: &str, redis: &Pool) -> Result<bool> {
    let mut conn = redis.get().await?;
    let key = format!("rate_limit:otp:{}", email);
    
    // Allow 3 OTP requests per 15 minutes
    let count: i32 = conn.incr(&key, 1).await?;
    
    if count == 1 {
        conn.expire(&key, 900).await?; // 15 minutes
    }
    
    Ok(count <= 3)
}
```

## Security Considerations

### OTP Security
1. **6-digit numeric code**: Simple for users, sufficient entropy for 5-minute window
2. **Single use**: OTP is marked as used immediately upon successful validation
3. **Time-bound**: 5-minute expiration reduces attack window
4. **Rate limiting**: Maximum 3 OTP requests per 15 minutes per email

### Token Security
1. **Short-lived access tokens**: 15-minute expiration
2. **Secure refresh tokens**: 30-day expiration, rotated on use
3. **HTTP-only cookies**: Tokens stored in secure, HTTP-only cookies
4. **Token rotation**: New tokens issued on refresh

### Email Security
1. **No sensitive data**: OTP codes are temporary and single-use
2. **Clear messaging**: Email clearly states code expiration
3. **Sender verification**: SPF/DKIM configured for email domain

## Frontend Implementation

### Login Flow UI

```typescript
// Simple login component
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  
  const requestOTP = async () => {
    await api.requestOTP(email);
    setStep('otp');
  };
  
  const verifyOTP = async () => {
    const response = await api.verifyOTP(email, otp);
    // Store tokens and redirect
  };
  
  return (
    <div>
      {step === 'email' ? (
        <form onSubmit={requestOTP}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
          <button type="submit">Send Login Code</button>
        </form>
      ) : (
        <form onSubmit={verifyOTP}>
          <p>Enter the 6-digit code sent to {email}</p>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="000000"
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
          <button type="submit">Verify & Login</button>
          <button onClick={() => setStep('email')}>Use different email</button>
        </form>
      )}
    </div>
  );
};
```

## Deployment Configuration

### Environment Variables (via AWS Parameter Store)

```yaml
# Required parameters in Parameter Store
/app/prod/database_url
/app/prod/redis_url
/app/prod/jwt_secret
/app/prod/ses_region
/app/prod/from_email
```

### Local Development

```env
# .env file for local development only
DATABASE_URL=postgres://localhost/origin_dev
REDIS_URL=redis://localhost:6379
JWT_SECRET=local-development-secret-change-in-production
AWS_REGION=us-east-1
FROM_EMAIL=noreply@localhost
```

## Testing Strategy

### Unit Tests

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_otp_generation() {
        let otp = generate_otp();
        assert_eq!(otp.len(), 6);
        assert!(otp.chars().all(|c| c.is_numeric()));
    }
    
    #[tokio::test]
    async fn test_otp_validation() {
        // Test OTP validation logic
    }
}
```

### Integration Tests

```rust
#[tokio::test]
async fn test_complete_auth_flow() {
    let app = test_app().await;
    
    // 1. Request OTP
    let response = app.request_otp("user@example.com").await;
    assert!(response.is_ok());
    
    // 2. Get OTP from test database
    let otp = get_test_otp("user@example.com").await;
    
    // 3. Verify OTP
    let auth_response = app.verify_otp("user@example.com", &otp).await;
    assert!(auth_response.is_ok());
    assert!(!auth_response.access_token.is_empty());
}
```

## Performance Targets

- OTP generation: <10ms
- Email sending: <1s (async, non-blocking)
- OTP validation: <50ms
- Token generation: <5ms
- Complete login flow: <2s

## Migration Path

### From Current System
1. Deploy OTP system alongside existing auth
2. Add feature flag for OTP-only mode
3. Gradually migrate users
4. Remove password-based auth

### Future Enhancements (Post-MVP)
- SMS delivery option for OTP
- Backup codes for account recovery
- Trusted device management
- Biometric authentication support
- Magic link alternative

## Success Metrics

- Login success rate: >95%
- OTP delivery rate: >99%
- Average login time: <30 seconds
- Support tickets for login issues: <1% of MAU
- User satisfaction: >4.5/5

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|---------|------------|
| Email delivery failure | High | Retry logic, multiple email providers |
| OTP brute force | Medium | Rate limiting, account lockout |
| Token theft | High | Short expiration, secure storage |
| Database outage | Critical | Read replicas, connection pooling |

## Implementation Checklist

- [ ] Database migrations created
- [ ] OTP generation service implemented
- [ ] Email service integrated with AWS SES
- [ ] Rate limiting with Redis
- [ ] JWT service implemented
- [ ] gRPC endpoints created
- [ ] Frontend login flow
- [ ] Error handling and logging
- [ ] Unit tests (>80% coverage)
- [ ] Integration tests
- [ ] Security review
- [ ] Performance testing
- [ ] Documentation updated

## Conclusion

This OTP-only authentication system provides the simplest possible secure authentication by:
- Eliminating password complexity
- Reducing database requirements
- Minimizing attack surface
- Providing clear user experience
- Maintaining security standards

The system can be implemented in 3-5 days and provides a solid foundation for future authentication enhancements.