import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AuthLoadingSpinner } from '../components/AuthLoadingSpinner';

const meta: Meta<typeof AuthLoadingSpinner> = {
  title: 'Auth/AuthLoadingSpinner',
  component: AuthLoadingSpinner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A loading spinner specifically designed for authentication flows with Studio Ghibli aesthetic.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    message: {
      control: { type: 'text' },
      description: 'Loading message to display',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '40px', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Authenticating',
    size: 'md',
  },
};

export const Small: Story = {
  args: {
    message: 'Loading',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    message: 'Please wait while we sign you in',
    size: 'lg',
  },
};

export const NoMessage: Story = {
  args: {
    size: 'md',
  },
};

export const CustomMessages: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      <AuthLoadingSpinner message="Signing in" size="sm" />
      <AuthLoadingSpinner message="Verifying credentials" size="md" />
      <AuthLoadingSpinner message="Setting up your account" size="lg" />
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '60px', alignItems: 'center' }}>
      <AuthLoadingSpinner message="Small" size="sm" />
      <AuthLoadingSpinner message="Medium" size="md" />
      <AuthLoadingSpinner message="Large" size="lg" />
    </div>
  ),
};