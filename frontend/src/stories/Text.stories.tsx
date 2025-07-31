import type { Meta, StoryObj } from '@storybook/nextjs';
import { Text } from '../components/Text';

const meta: Meta<typeof Text> = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'success', 'warning', 'danger'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'base', 'lg', 'xl', '2xl'],
    },
    weight: {
      control: { type: 'select' },
      options: ['normal', 'medium', 'semibold', 'bold'],
    },
    as: {
      control: { type: 'select' },
      options: ['p', 'span', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'This is default text',
  },
};

export const Heading: Story = {
  args: {
    children: 'Main Heading',
    as: 'h1',
    size: '2xl',
    weight: 'bold',
  },
};

export const Subheading: Story = {
  args: {
    children: 'Subheading',
    as: 'h2',
    size: 'xl',
    weight: 'semibold',
    variant: 'secondary',
  },
};

export const SmallText: Story = {
  args: {
    children: 'Small text for captions',
    size: 'sm',
    variant: 'tertiary',
  },
};

export const Success: Story = {
  args: {
    children: 'Success message',
    variant: 'success',
    weight: 'medium',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning message',
    variant: 'warning',
    weight: 'medium',
  },
};

export const Danger: Story = {
  args: {
    children: 'Error message',
    variant: 'danger',
    weight: 'medium',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Text variant="primary" size="2xl" weight="bold">Primary Text</Text>
      <Text variant="secondary" size="lg">Secondary Text</Text>
      <Text variant="tertiary" size="base">Tertiary Text</Text>
      <Text variant="success" size="base" weight="medium">Success Text</Text>
      <Text variant="warning" size="base" weight="medium">Warning Text</Text>
      <Text variant="danger" size="base" weight="medium">Danger Text</Text>
    </div>
  ),
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Text size="2xl" weight="bold">2XL Size - Heading</Text>
      <Text size="xl" weight="semibold">XL Size - Large</Text>
      <Text size="lg">LG Size - Medium</Text>
      <Text size="base">Base Size - Default</Text>
      <Text size="sm">SM Size - Small</Text>
      <Text size="xs">XS Size - Extra Small</Text>
    </div>
  ),
};