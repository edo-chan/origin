import type { Meta, StoryObj } from '@storybook/react';
import { Chip } from '@/ui/components/Chip';

const meta: Meta<typeof Chip> = {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'neutral'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'md', 'lg'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    children: 'Default Chip',
  },
};

export const Primary: Story = {
  args: {
    children: 'Primary',
    variant: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const Danger: Story = {
  args: {
    children: 'Danger',
    variant: 'danger',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    variant: 'primary',
    onClick: () => alert('Chip clicked!'),
  },
};

export const WithRemove: Story = {
  args: {
    children: 'Removable Chip',
    variant: 'primary',
    onRemove: () => alert('Chip removed!'),
  },
};

export const WithIcons: Story = {
  args: {
    children: 'With Icons',
    variant: 'primary',
    leftIcon: '🚀',
    rightIcon: '✨',
  },
};

export const Disabled: Story = {
  args: {
    children: 'Disabled',
    variant: 'primary',
    disabled: true,
    onClick: () => alert('This should not fire'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip variant="primary">Primary</Chip>
      <Chip variant="secondary">Secondary</Chip>
      <Chip variant="tertiary">Tertiary</Chip>
      <Chip variant="success">Success</Chip>
      <Chip variant="warning">Warning</Chip>
      <Chip variant="danger">Danger</Chip>
      <Chip variant="neutral">Neutral</Chip>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Chip variant="primary" size="xs">XS</Chip>
      <Chip variant="primary" size="sm">SM</Chip>
      <Chip variant="primary" size="md">MD</Chip>
      <Chip variant="primary" size="lg">LG</Chip>
    </div>
  ),
};

export const InteractiveChips: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Chip variant="primary" onClick={() => alert('Clicked!')}>Clickable</Chip>
      <Chip variant="secondary" onRemove={() => alert('Removed!')}>Removable</Chip>
      <Chip 
        variant="tertiary" 
        onClick={() => alert('Clicked!')} 
        onRemove={() => alert('Removed!')}
      >
        Both
      </Chip>
      <Chip variant="success" leftIcon="👍">With Icon</Chip>
      <Chip variant="warning" rightIcon="⚠️">Warning Icon</Chip>
      <Chip variant="neutral" disabled>Disabled</Chip>
    </div>
  ),
};