import type { Meta, StoryObj } from '@storybook/react';
import GreeterExample from './GreeterExample';

const meta: Meta<typeof GreeterExample> = {
  title: 'Domain/Greeter/GreeterExample',
  component: GreeterExample,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMockBackend: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/echo',
        method: 'POST',
        status: 200,
        response: { message: 'This is a mocked response!' },
      },
    ],
  },
};