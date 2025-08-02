import type { Meta, StoryObj } from '@storybook/react';
import { AuthErrorMessage } from '@/components/AuthErrorMessage/AuthErrorMessage';
import { AuthError } from '@/types/auth';

const meta: Meta<typeof AuthErrorMessage> = {
  title: 'Authentication/AuthErrorMessage',
  component: AuthErrorMessage,
  args: {
    error: 'Default error message',
    showRetry: false,
    dismissible: false,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
The AuthErrorMessage component displays authentication errors in a user-friendly way with optional retry functionality.

**Features:**
- Supports both string and structured AuthError objects  
- Categorizes errors by type (network, auth, validation, server)
- Provides retry functionality with customizable callbacks
- Dismissible with optional onDismiss callback
- Shows technical details in development mode
- Studio Ghibli-inspired warm, approachable styling
- Fully accessible with proper ARIA labels

**Usage:**
Use this component to display authentication-related errors throughout your OAuth flow, from login failures to token refresh issues.
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    error: {
      control: 'select',
      options: ['string', 'network-error', 'auth-error', 'validation-error', 'server-error'],
      mapping: {
        'string': 'Something went wrong. Please try again.',
        'network-error': {
          message: 'Unable to connect to the server',
          details: { message: 'Please check your internet connection and try again.' },
          code: 'NETWORK_ERROR',
        },
        'auth-error': {
          message: 'Authentication failed',
          details: { message: 'Invalid credentials or expired session.' },
          code: 'AUTH_FAILED',
        },
        'validation-error': {
          message: 'Invalid input provided',
          details: { message: 'Please check your email format and try again.' },
          code: 'VALIDATION_ERROR',
        },
        'server-error': {
          message: 'Server temporarily unavailable',
          details: { message: 'Our servers are experiencing high load. Please try again in a few minutes.' },
          code: 'SERVER_ERROR',
        },
      },
      description: 'The error to display (string or AuthError object)',
    },
    onRetry: {
      action: 'retry',
      description: 'Callback function called when retry button is clicked',
    },
    onDismiss: {
      action: 'dismiss',
      description: 'Callback function called when dismiss button is clicked',
    },
    showRetry: {
      control: 'boolean',
      description: 'Whether to show the retry button',
    },
    dismissible: {
      control: 'boolean',
      description: 'Whether the error can be dismissed',
    },
    className: {
      control: 'text',
      description: 'Additional CSS class names',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Examples
export const Default: Story = {
  args: {
    error: 'Something went wrong. Please try again.',
    showRetry: true,
    dismissible: true,
  },
};

export const SimpleMessage: Story = {
  args: {
    error: 'Login failed. Please check your credentials.',
    showRetry: false,
    dismissible: true,
  },
};

// Error Type Examples
export const NetworkError: Story = {
  args: {
    error: {
      message: 'Unable to connect to authentication server',
      details: { message: 'Please check your internet connection and try again.' },
      code: 'NETWORK_ERROR',
    },
    showRetry: true,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Network connectivity errors with retry functionality.',
      },
    },
  },
};

export const AuthenticationError: Story = {
  args: {
    error: {
      message: 'Google authentication failed',
      details: { message: 'Your session has expired or credentials are invalid.' },
      code: 'GOOGLE_AUTH_FAILED',
    },
    showRetry: true,
    dismissible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Authentication failures requiring user action to retry.',
      },
    },
  },
};

export const ValidationError: Story = {
  args: {
    error: {
      message: 'Invalid email format',
      details: { message: 'Please enter a valid email address (e.g., user@example.com).' },
      code: 'EMAIL_VALIDATION_ERROR',
    },
    showRetry: false,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Input validation errors that require user correction.',
      },
    },
  },
};

export const ServerError: Story = {
  args: {
    error: {
      message: 'Authentication service temporarily unavailable',
      details: { message: 'Our servers are experiencing high load. Please try again in a few minutes.' },
      code: 'SERVICE_UNAVAILABLE',
    },
    showRetry: true,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Server-side errors that may resolve with retry.',
      },
    },
  },
};

// Button Configurations
export const WithRetryOnly: Story = {
  args: {
    error: 'OAuth token refresh failed',
    showRetry: true,
    dismissible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Error message with only retry functionality (no dismiss).',
      },
    },
  },
};

export const WithDismissOnly: Story = {
  args: {
    error: 'Account verification email sent successfully',
    showRetry: false,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Informational message with only dismiss functionality.',
      },
    },
  },
};

export const NoButtons: Story = {
  args: {
    error: 'Please complete the authentication process',
    showRetry: false,
    dismissible: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Informational message without any action buttons.',
      },
    },
  },
};

// Complex Examples
export const LongErrorMessage: Story = {
  args: {
    error: {
      message: 'Google OAuth authentication service is currently experiencing intermittent connectivity issues',
      details: { message: 'This is likely a temporary issue on Google\'s end. Please wait a few minutes and try signing in again. If the problem persists, you can try clearing your browser cache or using a different browser.' },
      code: 'GOOGLE_OAUTH_SERVICE_ERROR',
    },
    showRetry: true,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Handling longer error messages with proper text wrapping.',
      },
    },
  },
};

export const WithCustomClassName: Story = {
  args: {
    error: 'Custom styled error message',
    showRetry: true,
    dismissible: true,
    className: 'custom-error-styling',
  },
  parameters: {
    docs: {
      description: {
        story: 'Error message with additional custom CSS classes applied.',
      },
    },
  },
};

// Interactive Demo
export const InteractiveDemo: Story = {
  args: {
    error: {
      message: 'Login session expired',
      details: { message: 'Your authentication session has expired. Please sign in again.' },
      code: 'SESSION_EXPIRED',
    },
    showRetry: true,
    dismissible: true,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive demo showing all functionality. Try clicking the retry and dismiss buttons to see the callbacks in action.',
      },
    },
  },
  render: (args) => {
    return (
      <div style={{ maxWidth: '400px' }}>
        <AuthErrorMessage
          error={args.error}
          showRetry={args.showRetry}
          dismissible={args.dismissible}
          onRetry={() => {
            console.log('Retry clicked - would typically trigger auth retry logic');
            alert('Retry functionality triggered! Check the Actions tab for details.');
          }}
          onDismiss={() => {
            console.log('Dismiss clicked - would typically hide the error');
            alert('Dismiss functionality triggered! Check the Actions tab for details.');
          }}
        />
      </div>
    );
  },
};

// Error States Showcase
export const ErrorTypesShowcase: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all error types side by side for comparison.',
      },
    },
  },
  render: () => {
    const networkError: AuthError = {
      message: 'Connection failed',
      details: { message: 'Unable to reach authentication server' },
      code: 'NETWORK_ERROR',
    };

    const authError: AuthError = {
      message: 'Authentication failed',
      details: { message: 'Invalid Google OAuth credentials' },
      code: 'AUTH_FAILED',
    };

    const validationError: AuthError = {
      message: 'Invalid input',
      details: { message: 'Email format is incorrect' },
      code: 'VALIDATION_ERROR',
    };

    const serverError: AuthError = {
      message: 'Server error',
      details: { message: 'Internal server error occurred' },
      code: 'SERVER_ERROR',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '400px' }}>
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Network Error</h4>
          <AuthErrorMessage error={networkError} showRetry={true} dismissible={true} />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Authentication Error</h4>
          <AuthErrorMessage error={authError} showRetry={true} dismissible={false} />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Validation Error</h4>
          <AuthErrorMessage error={validationError} showRetry={false} dismissible={true} />
        </div>
        
        <div>
          <h4 style={{ marginBottom: '8px', fontSize: '14px', fontWeight: '600' }}>Server Error</h4>
          <AuthErrorMessage error={serverError} showRetry={true} dismissible={true} />
        </div>
      </div>
    );
  },
};