import type { Meta, StoryObj } from '@storybook/react';
import { Stack, Button, Tag, Text, Card } from '../components';

const meta: Meta<typeof Stack> = {
  title: 'Components/Stack',
  component: Stack,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    direction: {
      control: { type: 'select' },
      options: ['row', 'column'],
    },
    gap: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    align: {
      control: { type: 'select' },
      options: ['flex-start', 'flex-end', 'center', 'baseline', 'stretch'],
    },
    justify: {
      control: { type: 'select' },
      options: ['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'],
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
    },
    wrap: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Stack>;

export const Default: Story = {
  args: {
    direction: 'column',
    gap: 'md',
  },
  render: (args) => (
    <Stack {...args}>
      <Button variant="primary">First Item</Button>
      <Button variant="secondary">Second Item</Button>
      <Button variant="tertiary">Third Item</Button>
    </Stack>
  ),
};

export const HorizontalStack: Story = {
  args: {
    direction: 'row',
    gap: 'sm',
    align: 'center',
  },
  render: (args) => (
    <Stack {...args}>
      <Tag variant="primary">Tag 1</Tag>
      <Tag variant="secondary">Tag 2</Tag>
      <Tag variant="tertiary">Tag 3</Tag>
    </Stack>
  ),
};

export const VerticalCentered: Story = {
  args: {
    direction: 'column',
    gap: 'lg',
    align: 'center',
    padding: 'xl',
  },
  render: (args) => (
    <Card variant="tertiary" style={{ height: '300px' }}>
      <Stack {...args} justify="center" style={{ height: '100%' }}>
        <Text variant="primary" size="xl" weight="bold">Centered Title</Text>
        <Text variant="secondary">This content is centered both horizontally and vertically</Text>
        <Button variant="primary">Call to Action</Button>
      </Stack>
    </Card>
  ),
};

export const SpaceBetween: Story = {
  args: {
    direction: 'row',
    justify: 'space-between',
    align: 'center',
    padding: 'md',
  },
  render: (args) => (
    <Card variant="primary" style={{ width: '400px' }}>
      <Stack {...args}>
        <Text variant="primary" weight="semibold">Left Content</Text>
        <Button variant="secondary" size="sm">Right Action</Button>
      </Stack>
    </Card>
  ),
};

export const WrappedTags: Story = {
  args: {
    direction: 'row',
    gap: 'sm',
    wrap: true,
    padding: 'md',
  },
  render: (args) => (
    <Card variant="secondary" style={{ maxWidth: '300px' }}>
      <Text variant="primary" weight="semibold" style={{ marginBottom: '12px' }}>
        Skills
      </Text>
      <Stack {...args}>
        <Tag variant="primary" size="sm">React</Tag>
        <Tag variant="secondary" size="sm">TypeScript</Tag>
        <Tag variant="tertiary" size="sm">CSS</Tag>
        <Tag variant="success" size="sm">Node.js</Tag>
        <Tag variant="warning" size="sm">GraphQL</Tag>
        <Tag variant="danger" size="sm">MongoDB</Tag>
        <Tag variant="primary" size="sm">Next.js</Tag>
        <Tag variant="secondary" size="sm">Storybook</Tag>
      </Stack>
    </Card>
  ),
};

export const ComplexLayout: Story = {
  args: {
    direction: 'column',
    gap: 'lg',
    padding: 'xl',
  },
  render: (args) => (
    <Card variant="tertiary" style={{ maxWidth: '500px' }}>
      <Stack {...args}>
        <Text variant="primary" size="xl" weight="bold">Dashboard</Text>
        
        <Stack direction="row" gap="md" justify="space-between" align="center">
          <Text variant="secondary">Overview for March 2024</Text>
          <Button variant="primary" size="sm">Export</Button>
        </Stack>
        
        <Stack direction="row" gap="md" wrap={true}>
          <Card variant="primary" size="sm" style={{ flex: '1', minWidth: '120px' }}>
            <Stack direction="column" gap="xs" align="center">
              <Text variant="primary" size="lg" weight="bold">1,234</Text>
              <Text variant="secondary" size="sm">Users</Text>
            </Stack>
          </Card>
          
          <Card variant="secondary" size="sm" style={{ flex: '1', minWidth: '120px' }}>
            <Stack direction="column" gap="xs" align="center">
              <Text variant="primary" size="lg" weight="bold">5,678</Text>
              <Text variant="secondary" size="sm">Sessions</Text>
            </Stack>
          </Card>
          
          <Card variant="tertiary" size="sm" style={{ flex: '1', minWidth: '120px' }}>
            <Stack direction="column" gap="xs" align="center">
              <Text variant="primary" size="lg" weight="bold">91.2%</Text>
              <Text variant="secondary" size="sm">Uptime</Text>
            </Stack>
          </Card>
        </Stack>
        
        <Stack direction="row" gap="sm" justify="center">
          <Button variant="tertiary" size="sm">Previous</Button>
          <Button variant="primary" size="sm">View Details</Button>
          <Button variant="tertiary" size="sm">Next</Button>
        </Stack>
      </Stack>
    </Card>
  ),
};