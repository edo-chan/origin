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
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
    },
    sizeT: {
      control: { type: 'select' },
      options: ['tshirtXS', 'tshirtS', 'tshirtM', 'tshirtL', 'tshirtXL'],
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
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

// Size variations
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
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
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button sizeT="tshirtXS">XS</Button>
      <Button sizeT="tshirtS">S</Button>
      <Button sizeT="tshirtM">M</Button>
      <Button sizeT="tshirtL">L</Button>
      <Button sizeT="tshirtXL">XL</Button>
    </div>
  ),
};

// All variants and sizes
export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['primary', 'secondary', 'tertiary'] as const).map(variant => (
        <div key={variant} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <strong style={{ width: '80px', textTransform: 'capitalize' }}>{variant}:</strong>
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