import type { Meta, StoryObj } from '@storybook/react';
import { Tag } from '../components/Tag';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
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
  },
};

export default meta;
type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  args: {
    children: 'Default Tag',
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

export const WithRemove: Story = {
  args: {
    children: 'Removable Tag',
    variant: 'primary',
    onRemove: () => alert('Tag removed!'),
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Tag variant="primary">Primary</Tag>
      <Tag variant="secondary">Secondary</Tag>
      <Tag variant="tertiary">Tertiary</Tag>
      <Tag variant="success">Success</Tag>
      <Tag variant="warning">Warning</Tag>
      <Tag variant="danger">Danger</Tag>
      <Tag variant="neutral">Neutral</Tag>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Tag variant="primary" size="xs">XS</Tag>
      <Tag variant="primary" size="sm">SM</Tag>
      <Tag variant="primary" size="md">MD</Tag>
      <Tag variant="primary" size="lg">LG</Tag>
    </div>
  ),
};

export const WithRemoveOptions: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      <Tag variant="primary" onRemove={() => alert('Primary removed!')}>Primary</Tag>
      <Tag variant="secondary" onRemove={() => alert('Secondary removed!')}>Secondary</Tag>
      <Tag variant="success" onRemove={() => alert('Success removed!')}>Success</Tag>
      <Tag variant="warning" onRemove={() => alert('Warning removed!')}>Warning</Tag>
      <Tag variant="danger" onRemove={() => alert('Danger removed!')}>Danger</Tag>
    </div>
  ),
};