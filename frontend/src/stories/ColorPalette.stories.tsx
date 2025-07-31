import type { Meta, StoryObj } from '@storybook/nextjs';
import { ColorPalette } from '../components/ColorPalette';

const meta: Meta<typeof ColorPalette> = {
  title: 'Components/ColorPalette',
  component: ColorPalette,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    palette: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'neutral'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    palette: 'primary',
  },
};

export const Secondary: Story = {
  args: {
    palette: 'secondary',
  },
};

export const Tertiary: Story = {
  args: {
    palette: 'tertiary',
  },
};

export const Neutral: Story = {
  args: {
    palette: 'neutral',
  },
};

export const AllPalettes: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
      <ColorPalette palette="primary" />
      <ColorPalette palette="secondary" />
      <ColorPalette palette="tertiary" />
      <ColorPalette palette="neutral" />
    </div>
  ),
};