import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { LogoutButton } from '../components/LogoutButton';

const meta: Meta<typeof LogoutButton> = {
  title: 'Auth/LogoutButton',
  component: LogoutButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A logout button with proper styling and loading states for signing out users.',
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
      description: 'Button size',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
      description: 'Button variant (color scheme)',
    },
    isLoading: {
      control: { type: 'boolean' },
      description: 'Whether the button is in loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    onLogout: {
      action: 'logout',
      description: 'Callback function for logout',
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

export const Default: Story = {
  args: {
    text: 'Sign out',
    size: 'md',
    variant: 'tertiary',
    isLoading: false,
    disabled: false,
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
    text: 'Logout',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
    text: 'Sign Out',
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <LogoutButton size="sm" text="Small" />
      <LogoutButton size="md" text="Medium" />
      <LogoutButton size="lg" text="Large" />
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
      <LogoutButton text="Default" />
      <LogoutButton text="Loading" isLoading />
      <LogoutButton text="Disabled" disabled />
    </div>
  ),
};

export const Interactive: Story = {
  render: () => {
    const [isLoading, setIsLoading] = React.useState(false);
    const [message, setMessage] = React.useState('');

    const handleLogout = async () => {
      setIsLoading(true);
      setMessage('Signing out...');
      
      // Simulate logout process
      setTimeout(() => {
        setIsLoading(false);
        setMessage('Successfully signed out!');
        
        // Reset after 2 seconds
        setTimeout(() => {
          setMessage('');
        }, 2000);
      }, 1500);
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <LogoutButton
          text="Try Logout Demo"
          isLoading={isLoading}
          onLogout={handleLogout}
        />
        {message && (
          <p style={{ 
            margin: 0, 
            padding: '8px 16px', 
            backgroundColor: '#fef3c7', 
            borderRadius: '8px',
            fontSize: '14px',
            color: '#92400e',
          }}>
            {message}
          </p>
        )}
      </div>
    );
  },
};