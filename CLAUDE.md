# Claude Development Guidelines

This project is a full-stack template with Rust backend and Next.js frontend. Follow these guidelines when working on the codebase.

## ⚠️ CRITICAL: Generated Files

**DO NOT MODIFY ANY GENERATED FILES**

Generated files include:
- `proto/gen/` - TypeScript types generated from Protocol Buffers
- `proto/rust/gen/` - Rust code generated from Protocol Buffers  
- Any file with `// @generated` or similar comments
- Files in `target/` directories
- `node_modules/` contents
- `dist/` or build output directories

**Why this matters:**
- Generated files are overwritten during builds
- Modifications will be lost and cause build conflicts
- Changes should be made to source `.proto` files instead
- Generated code is automatically kept in sync with schema definitions

**To modify API schemas:**
1. Edit the source `.proto` files in `proto/` directory
2. Run `cargo build` to regenerate Rust code and Envoy descriptors
3. Frontend TypeScript types are automatically updated

## Backend (Rust)

### Architecture
- **Framework**: Tonic (gRPC) with Tokio async runtime
- **Database**: PostgreSQL with SQLx for queries and migrations
- **Caching**: Redis for session storage and caching
- **Authentication**: JWT tokens with Argon2 password hashing
- **API**: gRPC with Protocol Buffers for type-safe communication
- **Protocol Buffers**: Generate Envoy proxy descriptors and Frontend TypeScript types

### Development Commands
- **Build**: `cargo build` (from backend/ directory)
- **Run**: `cargo run` (from backend/ directory)  
- **Test**: `cargo test` (from backend/ directory)
- **Format**: `cargo fmt` (from backend/ directory)
- **Lint**: `cargo clippy` (from backend/ directory)

### Code Conventions
- Use `snake_case` for variables and functions
- Use `PascalCase` for types and structs
- Implement proper error handling with `Result<T, E>`
- Use async/await for all I/O operations
- Follow Rust ownership principles
- **KISS Principle**: Keep functions small and focused on single responsibilities
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion
- **Surgical Changes**: Make minimal, targeted modifications to existing code

### Structured Logging Standards
- **Use tracing instead of println!** for all logging
- **Log Levels**: Use appropriate levels (`trace`, `debug`, `info`, `warn`, `error`)
- **Structured Fields**: Include structured data with key-value pairs
- **Span Context**: Use `#[tracing::instrument]` for function tracing
- **Error Context**: Log errors with full context and structured fields
- **Request Tracing**: Include `request_id`, `user_id`, `method`, `path` in HTTP requests
- **Database Tracing**: Log query execution time, affected rows, table names
- **Performance Metrics**: Use spans to measure execution time of critical operations

#### Logging Examples:
```rust
// Good: Structured logging with context
tracing::info!(
    user_id = user.id,
    email = %user.email,
    action = "user_login",
    "User successfully logged in"
);

// Good: Function instrumentation
#[tracing::instrument(skip(db), fields(user_id = user.id))]
async fn create_user(db: &Database, user: CreateUserRequest) -> Result<User, Error> {
    tracing::debug!(email = %user.email, "Creating new user");
    // ... implementation
}

// Good: Error logging with context
tracing::error!(
    error = %err,
    user_id = user.id,
    operation = "database_query",
    "Failed to save user to database"
);

// Bad: Unstructured logging
println!("User {} logged in", user.email);
eprintln!("Error: {}", err);
```

#### Required Log Fields:
- **Service Name**: Always include service identifier
- **Request ID**: Trace requests across service boundaries  
- **User Context**: Include user_id when available
- **Operation**: Describe what operation is being performed
- **Duration**: For performance-sensitive operations
- **Error Details**: Full error chain with structured context

### Key Files
- `src/main.rs`: Application entry point and server setup
- `src/lib.rs`: Library crate with module declarations
- `src/handler/`: gRPC service implementations
- `src/model/`: Data structures and business logic
- `src/adapter/`: Third-party service integrations (Claude AI, etc.)
- `proto/`: Protocol Buffer definitions
- `build.rs`: Build script for proto compilation

### Third-Party Integrations

#### ClaudeAI Client (`src/adapter/claude_ai.rs`)
The backend includes a comprehensive Claude AI client for integrating with Anthropic's Claude API:

**Features:**
- **Full API Support**: Complete implementation of Claude's Messages API with conversation support
- **Error Handling**: Robust retry logic with exponential backoff for failed requests
- **Structured Logging**: Comprehensive tracing with token usage metrics and performance monitoring
- **Configuration**: Flexible configuration through environment variables or direct instantiation
- **Type Safety**: Full Rust type definitions for requests, responses, and error handling

**Configuration:**
```rust
// From environment variables
let client = ClaudeAIClient::from_env()?;

// Or with custom configuration
let config = ClaudeAIConfig {
    api_key: "your-api-key".to_string(),
    base_url: "https://api.anthropic.com".to_string(),
    default_model: "claude-3-sonnet-20240229".to_string(),
    timeout_seconds: 60,
    max_retries: 3,
};
let client = ClaudeAIClient::new(config)?;
```

**Environment Variables:**
- `CLAUDE_API_KEY`: Your Anthropic API key (required)
- `CLAUDE_BASE_URL`: API base URL (default: https://api.anthropic.com)
- `CLAUDE_DEFAULT_MODEL`: Default model (default: claude-3-sonnet-20240229)
- `CLAUDE_TIMEOUT_SECONDS`: Request timeout (default: 60)
- `CLAUDE_MAX_RETRIES`: Max retry attempts (default: 3)

**Usage Examples:**
```rust
// Simple text message
let response = client.send_text_message(
    "Hello, Claude!", 
    Some("You are a helpful assistant.")
).await?;

// Multi-turn conversation
let messages = vec![
    ClaudeAIClient::user_message("What is 2+2?"),
    ClaudeAIClient::assistant_message("2+2 equals 4."),
    ClaudeAIClient::user_message("And what about 4+4?"),
];

let response = client.send_conversation(
    messages,
    Some("You are a math tutor."),
    Some(1000), // max_tokens
    Some(0.7),  // temperature
).await?;
```

**Testing:**
- Integration tests available in `tests/integration_claude_ai.rs`
- Tests require `CLAUDE_API_KEY` environment variable
- Comprehensive test coverage for configuration, message creation, and API interactions

## Frontend (Next.js)

### Architecture
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript for type safety
- **Styling**: Vanilla Extract (CSS-in-JS) with Sprinkles utility system
- **State Management**: Jotai for atomic state management
- **API Communication**: Generated TypeScript clients from Protocol Buffers
- **Component Library**: Custom components with Storybook documentation

### Development Commands
- **Dev Server**: `npm run dev` (from frontend/ directory)
- **Build**: `npm run build` (from frontend/ directory)
- **Lint**: `npm run lint` (from frontend/ directory)
- **Storybook**: `npm run storybook` (from frontend/ directory)

### Code Conventions
- Use functional components with hooks
- Implement TypeScript interfaces for all props and data
- Use Vanilla Extract for styling with design tokens
- Follow atomic design principles for components
- Use Jotai atoms for state management
- Implement proper error boundaries
- **KISS Principle**: Keep components simple and focused on single concerns
- **SOLID Principles**: Single responsibility, open/closed, dependency inversion

### Frontend Structured Logging Standards
- **Use structured console logging** for development and debugging
- **Log Levels**: Organize logs by severity (`console.debug`, `console.info`, `console.warn`, `console.error`)
- **Structured Objects**: Always log objects with consistent field names
- **User Actions**: Track user interactions with context
- **API Calls**: Log request/response data with timing
- **Error Boundaries**: Capture and log React errors with component stack
- **Performance**: Log component render times and state changes

#### Frontend Logging Examples:
```typescript
// Good: Structured user action logging
console.info('User Action', {
  action: 'button_click',
  component: 'LoginForm',
  userId: user?.id,
  timestamp: new Date().toISOString(),
  metadata: { buttonType: 'submit' }
});

// Good: API call logging
console.debug('API Request', {
  method: 'POST',
  endpoint: '/api/users',
  requestId: generateRequestId(),
  payload: { email: user.email }, // sanitized
  timestamp: new Date().toISOString()
});

// Good: Error logging with context
console.error('Component Error', {
  error: error.message,
  stack: error.stack,
  component: 'UserProfile',
  userId: user?.id,
  props: sanitizeProps(props),
  timestamp: new Date().toISOString()
});

// Good: Performance logging
console.debug('Component Performance', {
  component: 'DataTable',
  operation: 'render',
  duration: performance.now() - startTime,
  recordCount: data.length,
  timestamp: new Date().toISOString()
});

// Bad: Unstructured logging
console.log('User clicked button');
console.log(error);
```

#### Required Frontend Log Fields:
- **Component**: Name of React component
- **Action**: User action or system operation
- **Timestamp**: ISO 8601 timestamp
- **User Context**: userId when available
- **Request ID**: For API calls and error correlation
- **Session Info**: Browser, viewport, user agent (when relevant)

### Project Structure
- `src/components/`: Reusable UI components
- `src/domain/`: Feature-specific logic and components
- `src/pages/`: Next.js pages and API routes
- `src/styles/`: Global styles, themes, and design tokens
- `src/stories/`: Storybook stories for components

### Design System & Theming

#### Current Theme Architecture
- **Single Theme System**: Clean, centralized theme definition in `src/styles/theme.css.ts`
- **Studio Ghibli Aesthetic**: Warm, organic colors and fonts inspired by Studio Ghibli films
- **Theme Contract**: Well-defined structure using Vanilla Extract's `createThemeContract`
- **CSS Custom Properties**: All design tokens available as CSS variables for maximum flexibility

#### Creating Additional Themes
To create new themes beyond the current Studio Ghibli light theme:

1. **Define Theme Tokens**: Create new theme file in `src/styles/` (e.g., `darkTheme.css.ts`)
```typescript
import { createGlobalTheme } from '@vanilla-extract/css';
import { themeContract } from './theme.css';

export const darkTheme = createGlobalTheme('[data-theme="dark"]', themeContract, {
  color: {
    primary: '#60a5fa',           // Your primary color
    primaryHover: '#3b82f6',      // Hover state
    primaryActive: '#2563eb',     // Active state
    secondary: '#a78bfa',         // Secondary color
    secondaryHover: '#8b5cf6',    // Hover state
    secondaryActive: '#7c3aed',   // Active state
    tertiary: '#34d399',          // Tertiary color
    tertiaryHover: '#10b981',     // Hover state
    tertiaryActive: '#059669',    // Active state
    background: '#0f172a',        // Dark background
    surface: '#1e293b',           // Card/surface color
    text: '#f1f5f9',              // Primary text
    textSecondary: '#cbd5e1',     // Secondary text
    border: '#334155',            // Border color
    borderLight: '#475569',       // Light border
  },
  font: {
    family: '"Inter", sans-serif',           // Body font
    headingFamily: '"Poppins", sans-serif',  // Heading font
    monoFamily: '"Fira Code", monospace',    // Monospace font
    size: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '20px',
      xl: '24px',
      '2xl': '30px',
    },
    weight: {
      normal: '400',
      medium: '500', 
      semibold: '600',
      bold: '700',
    },
  },
  space: {
    xs: '4px',
    sm: '8px', 
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  radius: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px', 
    xl: '16px',
    full: '9999px',
  },
  border: {
    none: '0px',
    thin: '1px',
    base: '2px', 
    thick: '4px',
  },
});
```

2. **Update Theme Context**: Modify `src/styles/ThemeContext.tsx` to support multiple themes
```typescript
export interface ThemeContextType {
  currentTheme: 'light' | 'dark' | 'custom';
  setTheme: (theme: 'light' | 'dark' | 'custom') => void;
  availableThemes: ('light' | 'dark' | 'custom')[];
}
```

3. **Theme Application**: Update theme switching logic to apply data attributes
```typescript
// Apply theme via data attribute on document root
useEffect(() => {
  document.documentElement.setAttribute('data-theme', currentTheme);
}, [currentTheme]);
```

4. **Import Theme**: Add theme import to Storybook and app
```typescript
// In .storybook/preview.tsx and src/pages/_app.tsx
import '../src/styles/theme.css';
import '../src/styles/darkTheme.css'; // Your new theme
```

#### Theme Design Guidelines
- **Color Harmony**: Choose colors that work well together across primary/secondary/tertiary
- **Accessibility**: Ensure sufficient contrast ratios (4.5:1 for normal text, 3:1 for large text)
- **Font Pairing**: Select fonts that complement each other (readable body + distinctive headings)
- **Semantic Consistency**: Keep hover/active states darker than base colors for light themes, lighter for dark themes
- **Border & Radius**: Maintain consistent border widths and radius values for visual harmony

#### Component Compliance
All components automatically inherit theme tokens:
- **Colors**: `theme.color.*` - Primary, secondary, tertiary, background, text, borders
- **Typography**: `theme.font.*` - Family, sizes, weights applied consistently
- **Spacing**: `theme.space.*` - Consistent padding and margins
- **Borders**: `theme.border.*` and `theme.radius.*` - Uniform border styles
- **CSS Variables**: All tokens available as `--color-primary`, `--font-family`, etc.

This architecture ensures any new theme will automatically apply to all components without requiring individual component updates.

## Development Workflow

### Local Development
1. Use `tilt up` for full-stack development environment
2. Services available at:
   - Frontend: http://localhost:3000
   - Backend gRPC: localhost:50051
   - Envoy Proxy: http://localhost:8080
   - PostgreSQL: localhost:5432
   - Redis: localhost:6379

### Container Debugging
- **View all logs**: `tilt logs`
- **View specific service logs**: `tilt logs <service-name>` (e.g., `tilt logs backend`)
- **Follow logs in real-time**: `tilt logs -f <service-name>`
- **Check container status**: Access Tilt web UI at http://localhost:10350
- **Restart a service**: Use Tilt UI or `tilt trigger <service-name>`

### Database Changes
- Create migrations in `backend/migrations/`
- Run migrations with `sqlx migrate run`
- Update model structs in `src/model/`

### API Changes
1. Update `.proto` files in `proto/`
2. Rebuild backend with `cargo build` to regenerate:
   - Rust gRPC server/client code
   - Envoy proxy descriptor (`proto.pb`)
   - Frontend TypeScript types
   - **Automatic**: Copies `proto.pb` to `envoy/` directory for Docker builds
3. Update handlers and client code accordingly

### Testing Strategy
- Backend: Unit tests with `cargo test`
- Frontend: Component testing with Storybook
- Integration: Test gRPC endpoints with proper clients
- E2E: Test full user workflows

## Observability & Monitoring

### Log Aggregation
- **Format**: All services output JSON structured logs
- **Collection**: Use centralized logging (ELK, Grafana Loki, or similar)
- **Correlation**: Include `trace_id` and `span_id` for distributed tracing
- **Retention**: Configure appropriate log retention policies
- **Sampling**: Use log sampling for high-traffic endpoints

### Metrics & Monitoring
- **Backend Metrics**: Request duration, error rates, database query times
- **Frontend Metrics**: Page load times, user interactions, error rates
- **Infrastructure**: CPU, memory, disk usage, network latency
- **Business Metrics**: User actions, conversion rates, feature usage

### Tracing Configuration
```rust
// Backend: Initialize tracing subscriber
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

tracing_subscriber::registry()
    .with(tracing_subscriber::EnvFilter::new(
        std::env::var("RUST_LOG").unwrap_or_else(|_| "info".into()),
    ))
    .with(tracing_subscriber::fmt::layer().json())
    .init();
```

### Environment-Specific Logging
- **Development**: Human-readable format with debug level
- **Staging**: JSON format with info level
- **Production**: JSON format with warn level, structured sampling

## Security Guidelines
- Never commit secrets or API keys
- Use environment variables for configuration
- Implement proper authentication and authorization
- Validate all inputs on both client and server
- Use HTTPS in production environments
- Follow OWASP security best practices
- **Logging Security**: Never log sensitive data (passwords, tokens, PII)