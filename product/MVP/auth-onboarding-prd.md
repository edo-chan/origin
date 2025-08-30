# PRD: User Authentication & Onboarding

## Feature Overview

### Purpose
Provide a secure, frictionless authentication system and guided onboarding experience that captures essential business information while building user confidence in the platform.

### Objectives
1. Achieve <2 minute signup to dashboard access
2. Capture all required tax and business information upfront
3. Establish security credentials and preferences
4. Create personalized experience based on business type
5. Ensure 95% completion rate of onboarding flow

## User Stories & Acceptance Criteria

### Epic: User Authentication

#### Story 1: User Registration
**As a** small business owner  
**I want to** create an account with my email  
**So that** I can securely access the bookkeeping platform

**Acceptance Criteria:**
- User can register with email and password
- Password must meet security requirements (min 8 chars, 1 uppercase, 1 number, 1 special)
- Email verification sent within 30 seconds
- Duplicate email addresses are rejected with clear messaging
- Registration form validates in real-time
- Success redirects to onboarding flow

#### Story 2: Secure Login
**As a** registered user  
**I want to** log in securely to my account  
**So that** I can access my financial data

**Acceptance Criteria:**
- Login with email/password combination
- "Remember me" option for 30-day sessions
- Account locks after 5 failed attempts (15-minute cooldown)
- Password reset via email link
- Session timeout after 30 minutes of inactivity
- Support for password managers (proper form attributes)

#### Story 3: Multi-Factor Authentication
**As a** security-conscious user  
**I want to** enable two-factor authentication  
**So that** my financial data has additional protection

**Acceptance Criteria:**
- Optional TOTP-based 2FA (Google Authenticator, Authy)
- Backup codes generated (set of 10)
- SMS fallback option
- 2FA can be disabled with password confirmation
- Remember device for 30 days option

### Epic: Business Onboarding

#### Story 4: Business Profile Setup
**As a** new user  
**I want to** set up my business profile  
**So that** the system can properly categorize my transactions

**Acceptance Criteria:**
- Capture business name, type (LLC, Sole Prop, Corp)
- Industry selection with smart suggestions
- Business address with validation
- EIN/SSN selection and storage (encrypted)
- Accounting method selection (Cash/Accrual)
- Fiscal year configuration

#### Story 5: Tax Configuration
**As a** business owner  
**I want to** configure my tax settings  
**So that** my books are tax-compliant from the start

**Acceptance Criteria:**
- State selection for tax rules
- Tax ID number entry (EIN or SSN)
- Quarterly vs annual filing selection
- Sales tax enablement option
- Previous year tax info (optional)
- Estimated tax payment schedule setup

#### Story 6: Chart of Accounts Initialization
**As a** user  
**I want to** have a pre-configured chart of accounts  
**So that** I can start categorizing immediately

**Acceptance Criteria:**
- Industry-specific account templates
- Ability to customize account names
- Add custom accounts during setup
- Preview of standard categories
- Skip option with default setup

## Technical Specifications

### Authentication Architecture

```
┌─────────────────────────────────────────┐
│            Frontend (Next.js)            │
│                                          │
│  ┌────────────┐      ┌────────────┐     │
│  │   Login    │      │  Register  │     │
│  │   Form     │      │    Form    │     │
│  └─────┬──────┘      └──────┬─────┘     │
│        └──────────┬──────────┘           │
│                   ↓                       │
│         ┌─────────────────┐              │
│         │  Auth Service   │              │
│         │   (Jotai Store) │              │
│         └────────┬────────┘              │
└──────────────────┼───────────────────────┘
                   ↓
         ┌─────────────────┐
         │   Envoy Proxy   │
         └────────┬────────┘
                  ↓
┌─────────────────────────────────────────┐
│         Backend (Rust/Tonic)            │
│                                          │
│  ┌──────────────────────────────┐       │
│  │    Auth Handler Service      │       │
│  │                              │       │
│  │  • register_user()           │       │
│  │  • login_user()              │       │
│  │  • verify_email()            │       │
│  │  • refresh_token()           │       │
│  │  • reset_password()          │       │
│  │  • enable_2fa()              │       │
│  └──────────┬───────────────────┘       │
│             ↓                            │
│  ┌──────────────────────────────┐       │
│  │      Security Layer          │       │
│  │                              │       │
│  │  • Argon2 hashing            │       │
│  │  • JWT generation            │       │
│  │  • Rate limiting             │       │
│  │  • Session management        │       │
│  └──────────┬───────────────────┘       │
└─────────────┼────────────────────────────┘
              ↓
    ┌──────────────────┐
    │   PostgreSQL     │
    │                  │
    │  • users         │
    │  • sessions      │
    │  • organizations │
    │  • audit_logs    │
    └──────────────────┘
```

### API Requirements

#### Authentication Endpoints (gRPC)

```protobuf
// auth.proto
syntax = "proto3";

package auth;

service AuthService {
  rpc RegisterUser(RegisterRequest) returns (AuthResponse);
  rpc LoginUser(LoginRequest) returns (AuthResponse);
  rpc VerifyEmail(VerifyEmailRequest) returns (StatusResponse);
  rpc RefreshToken(RefreshTokenRequest) returns (AuthResponse);
  rpc ResetPassword(ResetPasswordRequest) returns (StatusResponse);
  rpc Enable2FA(Enable2FARequest) returns (TwoFactorResponse);
  rpc Verify2FA(Verify2FARequest) returns (AuthResponse);
  rpc LogoutUser(LogoutRequest) returns (StatusResponse);
}

message RegisterRequest {
  string email = 1;
  string password = 2;
  string full_name = 3;
  string timezone = 4;
}

message LoginRequest {
  string email = 1;
  string password = 2;
  bool remember_me = 3;
  optional string totp_code = 4;
}

message AuthResponse {
  string access_token = 1;
  string refresh_token = 2;
  User user = 3;
  int64 expires_at = 4;
}

message User {
  string id = 1;
  string email = 2;
  string full_name = 3;
  bool email_verified = 4;
  bool two_factor_enabled = 5;
  string role = 6;
  int64 created_at = 7;
}
```

#### Onboarding Endpoints (gRPC)

```protobuf
// onboarding.proto
syntax = "proto3";

package onboarding;

service OnboardingService {
  rpc CreateOrganization(CreateOrgRequest) returns (Organization);
  rpc UpdateTaxSettings(TaxSettingsRequest) returns (TaxSettings);
  rpc InitializeChartOfAccounts(ChartInitRequest) returns (ChartOfAccounts);
  rpc CompleteOnboarding(CompleteRequest) returns (OnboardingStatus);
  rpc GetOnboardingProgress(ProgressRequest) returns (ProgressResponse);
}

message CreateOrgRequest {
  string business_name = 1;
  string business_type = 2; // LLC, SOLE_PROP, CORP, etc.
  string industry = 3;
  Address address = 4;
  string ein_or_ssn = 5;
  string accounting_method = 6; // CASH, ACCRUAL
  int32 fiscal_year_end_month = 7;
}

message Organization {
  string id = 1;
  string business_name = 2;
  string business_type = 3;
  string industry = 4;
  Address address = 5;
  string tax_id = 6; // Encrypted
  string accounting_method = 7;
  int32 fiscal_year_end_month = 8;
  int64 created_at = 9;
}
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMPTZ,
    two_factor_secret VARCHAR(255),
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    failed_login_attempts INT DEFAULT 0,
    locked_until TIMESTAMPTZ,
    timezone VARCHAR(50) DEFAULT 'America/New_York',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sessions table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    device_info JSONB,
    ip_address INET,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organizations table
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    business_type VARCHAR(50) NOT NULL,
    industry VARCHAR(100),
    address JSONB,
    tax_id_encrypted TEXT, -- Encrypted EIN/SSN
    accounting_method VARCHAR(20) NOT NULL,
    fiscal_year_end_month INT NOT NULL,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tax settings table
CREATE TABLE tax_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    state VARCHAR(2) NOT NULL,
    filing_frequency VARCHAR(20), -- QUARTERLY, ANNUAL
    sales_tax_enabled BOOLEAN DEFAULT FALSE,
    sales_tax_rate DECIMAL(5,4),
    estimated_tax_payments BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

## UI/UX Requirements

### Registration Flow

```
┌─────────────────────────────────┐
│      Create Your Account        │
│                                  │
│  ┌────────────────────────┐     │
│  │  Email                 │     │
│  └────────────────────────┘     │
│                                  │
│  ┌────────────────────────┐     │
│  │  Password              │     │
│  └────────────────────────┘     │
│  Password strength: ████░       │
│                                  │
│  ┌────────────────────────┐     │
│  │  Confirm Password      │     │
│  └────────────────────────┘     │
│                                  │
│  ┌────────────────────────┐     │
│  │  Full Name             │     │
│  └────────────────────────┘     │
│                                  │
│  □ I agree to Terms & Privacy   │
│                                  │
│  ┌────────────────────────┐     │
│  │   Create Account       │     │
│  └────────────────────────┘     │
│                                  │
│  Already have an account? Login │
└─────────────────────────────────┘
```

### Onboarding Wizard

```
Step 1: Business Profile
┌─────────────────────────────────┐
│   Tell us about your business   │
│                                  │
│  Business Name *                │
│  ┌────────────────────────┐     │
│  │                        │     │
│  └────────────────────────┘     │
│                                  │
│  Business Type *                │
│  ┌────────────────────────┐     │
│  │ ▼ Select Type         │     │
│  └────────────────────────┘     │
│  • LLC                          │
│  • Sole Proprietorship          │
│  • Corporation                  │
│  • Partnership                  │
│                                  │
│  Industry *                     │
│  ┌────────────────────────┐     │
│  │ 🔍 Search industries  │     │
│  └────────────────────────┘     │
│                                  │
│  [Skip] [Save & Continue →]     │
└─────────────────────────────────┘

Step 2: Tax Configuration
┌─────────────────────────────────┐
│     Set up tax preferences      │
│                                  │
│  Tax ID Type *                  │
│  ○ EIN (Employer ID Number)     │
│  ○ SSN (Social Security Number) │
│                                  │
│  Tax ID Number *                │
│  ┌────────────────────────┐     │
│  │ XX-XXXXXXX            │     │
│  └────────────────────────┘     │
│  🔒 Encrypted & Secure          │
│                                  │
│  Business State *               │
│  ┌────────────────────────┐     │
│  │ ▼ Select State        │     │
│  └────────────────────────┘     │
│                                  │
│  Filing Frequency               │
│  ○ Quarterly                    │
│  ○ Annual                       │
│                                  │
│  [← Back] [Save & Continue →]   │
└─────────────────────────────────┘

Step 3: Chart of Accounts
┌─────────────────────────────────┐
│   Customize your categories     │
│                                  │
│  We've set up categories based  │
│  on your industry. You can      │
│  customize these anytime.       │
│                                  │
│  Income Accounts                │
│  ┌────────────────────────┐     │
│  │ ✓ Service Revenue     │     │
│  │ ✓ Product Sales       │     │
│  │ + Add custom          │     │
│  └────────────────────────┘     │
│                                  │
│  Expense Accounts               │
│  ┌────────────────────────┐     │
│  │ ✓ Office Supplies     │     │
│  │ ✓ Software & Tools    │     │
│  │ ✓ Travel              │     │
│  │ ✓ Meals               │     │
│  │ + Add custom          │     │
│  └────────────────────────┘     │
│                                  │
│  [← Back] [Complete Setup ✓]    │
└─────────────────────────────────┘
```

### Visual Design Requirements

#### Color Palette
- Primary: #2563EB (Blue)
- Success: #10B981 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Neutral: #6B7280 (Gray)

#### Typography
- Headers: Inter, 600 weight
- Body: Inter, 400 weight
- Input fields: 16px minimum (mobile zoom prevention)

#### Components
- Input fields with floating labels
- Real-time validation with inline errors
- Progress indicator for multi-step forms
- Loading states for async operations
- Success animations on step completion

## Security Requirements

### Authentication Security
1. **Password Security**
   - Argon2id hashing with salt
   - Minimum complexity requirements enforced
   - Password history (prevent reuse of last 5)
   - Secure password reset tokens (expire in 1 hour)

2. **Session Management**
   - JWT tokens with 15-minute access token lifetime
   - Refresh tokens with 30-day lifetime
   - Secure httpOnly cookies for web
   - Token rotation on refresh

3. **Rate Limiting**
   - 5 login attempts per 15 minutes per IP
   - 3 password reset requests per hour per email
   - 10 API requests per second per user

4. **Data Protection**
   - TLS 1.3 for all connections
   - AES-256-GCM encryption for sensitive data at rest
   - PII data encryption in database
   - Audit logging for all auth events

### Compliance Requirements
- GDPR compliance for EU users
- CCPA compliance for California users
- SOC 2 Type I preparation
- PCI DSS compliance roadmap

## Success Metrics

### Key Performance Indicators

| Metric | Target | Measurement |
|--------|--------|-------------|
| Registration Conversion | >40% | Visitors who complete signup |
| Email Verification Rate | >90% | Users who verify within 24h |
| Onboarding Completion | >95% | Users who complete all steps |
| Time to Complete | <3 min | Average onboarding duration |
| Drop-off Rate | <5% | Users who abandon onboarding |
| Password Reset Rate | <2% | Monthly password resets/MAU |
| 2FA Adoption | >30% | Users who enable 2FA |
| Session Duration | >10 min | Average first session length |

### User Satisfaction Metrics
- Onboarding NPS: >50
- Setup clarity rating: >4.5/5
- Support tickets: <5% of new users

## Dependencies & Risks

### External Dependencies
| Dependency | Purpose | Risk Level | Mitigation |
|------------|---------|------------|------------|
| SendGrid | Email delivery | Medium | Backup SMTP provider |
| Redis | Session storage | High | Cluster with failover |
| PostgreSQL | User data | High | Replication & backups |

### Technical Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email delivery failures | High | Medium | Multiple providers, retry logic |
| Brute force attacks | High | Medium | Rate limiting, CAPTCHA |
| Session hijacking | High | Low | Secure cookies, IP validation |
| Database breach | Critical | Low | Encryption, access controls |

## Testing Requirements

### Unit Testing
- Auth service: 90% coverage
- Password validation: 100% coverage
- JWT generation/validation: 100% coverage
- Input sanitization: 100% coverage

### Integration Testing
- Full registration flow
- Login with 2FA
- Password reset flow
- Session refresh
- Onboarding completion

### E2E Testing
```javascript
// Example E2E test scenarios
describe('Authentication Flow', () => {
  test('User can register and access dashboard', async () => {
    // 1. Navigate to signup
    // 2. Fill registration form
    // 3. Submit and verify email sent
    // 4. Click verification link
    // 5. Complete onboarding
    // 6. Verify dashboard access
  });
  
  test('User cannot register with duplicate email', async () => {
    // Test duplicate email handling
  });
  
  test('Account locks after failed attempts', async () => {
    // Test brute force protection
  });
});
```

### Security Testing
- Penetration testing by third party
- OWASP Top 10 vulnerability scan
- SQL injection testing
- XSS vulnerability testing
- CSRF protection validation

### Performance Testing
- 1000 concurrent registrations
- 5000 concurrent logins
- <500ms response time at p95
- Database connection pooling limits

## Implementation Timeline

### Week 1: Backend Foundation
- Day 1-2: Database schema and migrations
- Day 3-4: Auth service implementation
- Day 5: JWT and session management

### Week 2: Frontend & Integration
- Day 1-2: Registration/login UI
- Day 3-4: Onboarding wizard UI
- Day 5: Integration and testing

### Milestones
- [ ] Database schema deployed
- [ ] Auth endpoints functional
- [ ] Email verification working
- [ ] Frontend forms complete
- [ ] Onboarding flow complete
- [ ] Security testing passed
- [ ] Performance benchmarks met

## Post-MVP Enhancements

### Phase 2 Features
1. Social authentication (Google, Microsoft)
2. Single Sign-On (SSO) for enterprises
3. Advanced 2FA methods (biometric, hardware keys)
4. Team invitations and multi-user support
5. Role-based access control (RBAC)

### Phase 3 Features
1. Passwordless authentication (magic links)
2. Account recovery without email
3. Compliance certifications (SOC 2)
4. Advanced audit logging and reporting
5. White-label customization options