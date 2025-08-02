import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { Input } from '@/ui/components/Input';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '400px' }}>
      {(['primary', 'secondary', 'tertiary'] as const).map(variant => (
        <div key={variant}>
          <strong style={{ textTransform: 'capitalize', marginBottom: '8px', display: 'block' }}>
            {variant}:
          </strong>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
              <Input 
                key={size} 
                variant={variant} 
                size={size}
                placeholder={`${size.toUpperCase()} ${variant} input`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};