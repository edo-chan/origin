import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { UserProfile } from '@/ui/components/UserProfile';
import { User } from '../../types/auth';

const meta: Meta<typeof UserProfile> = {
  title: 'Auth/UserProfile',
  component: UserProfile,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Displays authenticated user information with avatar, name, and email. Supports various sizes and configurations.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    user: {
      control: { type: 'object' },
      description: 'User data to display',
    },
    showAvatar: {
      control: { type: 'boolean' },
      description: 'Whether to show the user avatar',
    },
    showEmail: {
      control: { type: 'boolean' },
      description: 'Whether to show the user email',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size variant',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '20px', maxWidth: '400px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock user data
const mockUser: User = {
  id: 'user-123',
  email: 'john.doe@example.com',
  name: 'John Doe',
  givenName: 'John',
  familyName: 'Doe',
  picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&fit=crop&crop=face',
};

const mockUserWithoutAvatar: User = {
  ...mockUser,
  picture: '',
};

const mockUserLongName: User = {
  ...mockUser,
  name: 'Dr. Alexandria Catherine Rodriguez-Hamilton',
  email: 'alexandria.rodriguez.hamilton@verylongdomainname.com',
};

export const Default: Story = {
  args: {
    user: mockUser,
    showAvatar: true,
    showEmail: true,
    size: 'md',
  },
};

export const WithoutAvatar: Story = {
  args: {
    ...Default.args,
    showAvatar: false,
  },
};

export const WithoutEmail: Story = {
  args: {
    ...Default.args,
    showEmail: false,
  },
};

export const AvatarFallback: Story = {
  args: {
    ...Default.args,
    user: mockUserWithoutAvatar,
  },
};

export const Small: Story = {
  args: {
    ...Default.args,
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    ...Default.args,
    size: 'lg',
  },
};

export const LongNames: Story = {
  args: {
    ...Default.args,
    user: mockUserLongName,
  },
};

// All sizes comparison
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Small</h4>
        <UserProfile user={mockUser} size="sm" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Medium</h4>
        <UserProfile user={mockUser} size="md" />
      </div>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Large</h4>
        <UserProfile user={mockUser} size="lg" />
      </div>
    </div>
  ),
};

// Different configurations
export const Configurations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Full Profile</h4>
        <UserProfile user={mockUser} showAvatar showEmail />
      </div>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Name Only</h4>
        <UserProfile user={mockUser} showAvatar={false} showEmail={false} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>With Avatar, No Email</h4>
        <UserProfile user={mockUser} showAvatar showEmail={false} />
      </div>
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#666' }}>Avatar Fallback</h4>
        <UserProfile user={mockUserWithoutAvatar} showAvatar showEmail />
      </div>
    </div>
  ),
};

// Multiple users
export const MultipleUsers: Story = {
  render: () => {
    const users: User[] = [
      mockUser,
      {
        ...mockUser,
        id: 'user-456',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        picture: 'https://images.unsplash.com/photo-1494790108755-2616b72d3e16?w=96&h=96&fit=crop&crop=face',
      },
      {
        ...mockUser,
        id: 'user-789',
        name: 'Mike Chen',
        email: 'mike.chen@example.com',
        picture: '',
      },
      {
        ...mockUser,
        id: 'user-101',
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        picture: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&crop=face',
      },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {users.map((user) => (
          <UserProfile key={user.id} user={user} />
        ))}
      </div>
    );
  },
};

// Responsive layout
export const ResponsiveLayout: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      <UserProfile user={mockUser} />
      <UserProfile user={{
        ...mockUser,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        picture: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=96&h=96&fit=crop&crop=face',
      }} />
      <UserProfile user={{
        ...mockUser,
        name: 'Bob Smith',
        email: 'bob@example.com',
        picture: '',
      }} />
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};