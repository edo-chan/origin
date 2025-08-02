import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { GoogleLoginButton } from '@/ui/components/GoogleLoginButton';
import { GoogleLoginResponse, AuthError } from '../../types/auth';

const meta: Meta<typeof GoogleLoginButton> = {
  title: 'Auth/GoogleLoginButton',
  component: GoogleLoginButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A Google OAuth login button with Studio Ghibli aesthetic. Handles Google sign-in flow with proper loading and error states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    text: {
      control: { type: 'text' },
      description: 'Button text content',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button size variant',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    onSuccess: {
      action: 'success',
      description: 'Callback function for successful login',
    },
    onError: {
      action: 'error',
      description: 'Callback function for login error',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers for actions
const handleSuccess = (response: GoogleLoginResponse) => {
  console.log('Login successful:', response);
};

const handleError = (error: AuthError) => {
  console.error('Login error:', error);
};

export const Default: Story = {
  args: {
    text: 'Continue with Google',
    size: 'md',
    isLoading: false,
    disabled: false,
    onSuccess: handleSuccess,
    onError: handleError,
  },
};

export const Loading: Story = {
  args: {
    ...Default.args,
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
    text: 'Sign in',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    text: 'Sign in with Google',
  },
};

export const CustomText: Story = {
  args: {
    ...Default.args,
    text: 'Get started with Google',
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <GoogleLoginButton size="sm" text="Small" onSuccess={handleSuccess} onError={handleError} />
      <GoogleLoginButton size="md" text="Medium" onSuccess={handleSuccess} onError={handleError} />
      <GoogleLoginButton size="lg" text="Large" onSuccess={handleSuccess} onError={handleError} />
    </div>
  ),
};

// All states comparison
export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <GoogleLoginButton text="Default" onSuccess={handleSuccess} onError={handleError} />
      <GoogleLoginButton text="Loading" isLoading onSuccess={handleSuccess} onError={handleError} />
      <GoogleLoginButton text="Disabled" disabled onSuccess={handleSuccess} onError={handleError} />
    </div>
  ),
};

// Interactive demo
export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleInteractiveSuccess = (response: GoogleLoginResponse) => {
      setIsLoading(false);
      setMessage(`Success! Welcome ${response.user.name}`);
    };

    const handleInteractiveError = (error: AuthError) => {
      setIsLoading(false);
      setMessage(`Error: ${error.message}`);
    };

    const handleClick = () => {
      setIsLoading(true);
      setMessage('Authenticating...');
      
      // Simulate async operation
      setTimeout(() => {
        handleInteractiveSuccess({
          user: {
            id: 'demo-user',
            email: 'demo@example.com',
            name: 'Demo User',
            picture: 'https://via.placeholder.com/96x96',
          },
          accessToken: 'demo-token',
          expiresIn: 3600,
        });
      }, 2000);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <GoogleLoginButton
          text="Try Login Demo"
          isLoading={isLoading}
          onSuccess={handleInteractiveSuccess}
          onError={handleInteractiveError}
        />
        {message && (
          <p style={{ 
            margin: 0, 
            padding: '8px 16px', 
            backgroundColor: '#f0f9ff', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#0369a1',
          }}>
            {message}
          </p>
        )}
      </div>
    );
  },
};