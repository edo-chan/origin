# Origin Infrastructure

Pulumi configuration for AWS resources using Go:
- SES (Simple Email Service) for email sending
- Parameter Store for secure configuration management

## Setup

1. Initialize Go modules:
```bash
cd pulumi
go mod tidy
```

2. Configure Pulumi:
```bash
pulumi config set domain your-domain.com
pulumi config set --secret databaseUrl postgresql://user:pass@host:5432/db
pulumi config set --secret jwtSecret your-jwt-secret
pulumi config set --secret claudeApiKey your-claude-api-key
```

3. Deploy:
```bash
pulumi up
```

## Resources Created

- **SES Domain Identity**: Email domain verification
- **SES DKIM**: Domain authentication
- **SES Configuration Set**: Email sending configuration
- **Parameter Store**: Secure configuration storage
  - Database URL
  - Redis URL  
  - JWT secret
  - Claude API key

## Using Parameter Store in Your Application

### Backend (Rust)

The backend automatically loads configuration from Parameter Store:

```rust
use template::adapter::AppConfig;

// Loads from Parameter Store (falls back to env vars for local dev)
let config = AppConfig::load().await;

// Use config values
let db_pool = PgPool::connect(&config.database_url).await?;
```

### Frontend (Next.js with Vercel)

The frontend uses Vercel environment variables instead of Parameter Store:

```typescript
// In your Next.js application
const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  // Other public config...
};

// For server-side secrets in API routes
const jwtSecret = process.env.JWT_SECRET;
```

**Vercel Environment Variables:**
- Set environment variables in Vercel dashboard
- Use `NEXT_PUBLIC_` prefix for client-side variables
- Keep secrets without prefix for server-side only

### Local Development

Deploy local development parameters:

```bash
./deploy-local.sh
```

This creates parameters under `/origin/local/` that you can use for local development.

### Environment Setup

Set the environment for your application:

```bash
# For backend
export ENVIRONMENT=local  # or dev, staging, prod

# The application will load from /origin/{ENVIRONMENT}/*
```

## DNS Records Required

After deployment, add these DNS records to verify your domain:

1. TXT record for domain verification (see `sesDomainVerificationToken` output)
2. CNAME records for DKIM (see `sesDkimTokens` output)