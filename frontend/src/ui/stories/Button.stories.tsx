import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Button } from '@/ui/components/Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg', 'xl', 'icon'],
    },
    sizeT: {
      control: { type: 'select' },
      options: ['tshirtXS', 'tshirtS', 'tshirtM', 'tshirtL', 'tshirtXL'],
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'link', 'destructive'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',  
    children: 'Secondary Button',
  },
};

export const Tertiary: Story = {
  args: {
    variant: 'tertiary',
    children: 'Tertiary Button',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Delete',
  },
};

// Size variations
export const Sizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button size="xs">XS</Button>
      <Button size="sm">SM</Button>
      <Button size="md">MD</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
};

// T-shirt sizes
export const TSizes: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button sizeT="tshirtXS">XS</Button>
      <Button sizeT="tshirtS">S</Button>
      <Button sizeT="tshirtM">M</Button>
      <Button sizeT="tshirtL">L</Button>
      <Button sizeT="tshirtXL">XL</Button>
    </div>
  ),
};

// Loading state
export const Loading: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button loading>Loading</Button>
      <Button loading variant="secondary">Processing</Button>
      <Button loading variant="outline" size="lg">Please wait...</Button>
    </div>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button leftIcon={<span>👈</span>}>With Left Icon</Button>
      <Button rightIcon={<span>👉</span>}>With Right Icon</Button>
      <Button leftIcon={<span>🚀</span>} rightIcon={<span>✨</span>}>
        Both Icons
      </Button>
      <Button size="icon">
        <span>❤️</span>
      </Button>
    </div>
  ),
};

// Full Width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md space-y-4">
      <Button fullWidth>Full Width Button</Button>
      <Button fullWidth variant="secondary">Full Width Secondary</Button>
      <Button fullWidth variant="outline">Full Width Outline</Button>
    </div>
  ),
};

// Disabled states
export const Disabled: Story = {
  render: () => (
    <div className="flex gap-4 items-center">
      <Button disabled>Disabled</Button>
      <Button disabled variant="secondary">Disabled</Button>
      <Button disabled variant="outline">Disabled</Button>
      <Button disabled variant="ghost">Disabled</Button>
    </div>
  ),
};

// All variants and sizes
export const AllVariations: Story = {
  render: () => (
    <div className="space-y-4">
      {(['primary', 'secondary', 'tertiary', 'outline', 'ghost', 'link', 'destructive'] as const).map(variant => (
        <div key={variant} className="flex gap-2 items-center">
          <span className="w-24 text-sm font-medium capitalize">{variant}:</span>
          {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
            <Button key={size} variant={variant} size={size}>
              {size.toUpperCase()}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
};