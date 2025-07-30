import type { Meta, StoryObj } from '@storybook/nextjs';
import React from 'react';
import { Card } from '../components/Card';

const meta: Meta<typeof Card> = {
  title: 'Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'This is a card component with some content inside.',
  },
};

export const AllVariations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '600px' }}>
      {(['primary', 'secondary', 'tertiary'] as const).map(variant => (
        <div key={variant} style={{ display: 'flex', gap: '16px' }}>
          <strong style={{ width: '80px', textTransform: 'capitalize' }}>{variant}:</strong>
          <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
            {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map(size => (
              <Card key={size} variant={variant} size={size}>
                {size.toUpperCase()} Card
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};