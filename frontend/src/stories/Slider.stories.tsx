import type { Meta, StoryObj } from '@storybook/nextjs';
import { SingleSlider as Slider } from '../components';
import { useState } from 'react';

const meta: Meta<typeof Slider> = {
  title: 'Components/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
    showValue: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
    min: {
      control: { type: 'number' },
    },
    max: {
      control: { type: 'number' },
    },
    step: {
      control: { type: 'number' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    label: 'Volume',
    showValue: true,
    min: 0,
    max: 100,
    step: 1,
  },
  render: (args) => {
    const [value, setValue] = useState(50);
    return (
      <Slider 
        {...args} 
        value={value} 
        onChange={setValue}
      />
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [volume, setVolume] = useState(75);
    const [brightness, setBrightness] = useState(60);
    const [temperature, setTemperature] = useState(22);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <Slider 
          variant="primary" 
          size="md" 
          label="Volume"
          value={volume}
          onChange={setVolume}
          min={0}
          max={100}
          showValue={true}
        />
        <Slider 
          variant="secondary" 
          size="md" 
          label="Screen Brightness"
          value={brightness}
          onChange={setBrightness}
          min={0}
          max={100}
          showValue={true}
        />
        <Slider 
          variant="tertiary" 
          size="md" 
          label="Temperature (°C)"
          value={temperature}
          onChange={setTemperature}
          min={16}
          max={30}
          step={0.5}
          showValue={true}
        />
        
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Current values:</strong>
          <ul>
            <li>Volume: {volume}%</li>
            <li>Brightness: {brightness}%</li>
            <li>Temperature: {temperature}°C</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smallValue, setSmallValue] = useState(25);
    const [mediumValue, setMediumValue] = useState(50);
    const [largeValue, setLargeValue] = useState(75);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <Slider 
          variant="primary" 
          size="sm" 
          label="Small slider"
          value={smallValue}
          onChange={setSmallValue}
          showValue={true}
        />
        <Slider 
          variant="primary" 
          size="md" 
          label="Medium slider"
          value={mediumValue}
          onChange={setMediumValue}
          showValue={true}
        />
        <Slider 
          variant="primary" 
          size="lg" 
          label="Large slider"
          value={largeValue}
          onChange={setLargeValue}
          showValue={true}
        />
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [primaryValue, setPrimaryValue] = useState(30);
    const [secondaryValue, setSecondaryValue] = useState(60);
    const [tertiaryValue, setTertiaryValue] = useState(90);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <Slider 
          variant="primary" 
          size="md" 
          label="Primary variant"
          value={primaryValue}
          onChange={setPrimaryValue}
          showValue={true}
        />
        <Slider 
          variant="secondary" 
          size="md" 
          label="Secondary variant"
          value={secondaryValue}
          onChange={setSecondaryValue}
          showValue={true}
        />
        <Slider 
          variant="tertiary" 
          size="md" 
          label="Tertiary variant"
          value={tertiaryValue}
          onChange={setTertiaryValue}
          showValue={true}
        />
      </div>
    );
  },
};

export const CustomRanges: Story = {
  render: () => {
    const [percentage, setPercentage] = useState(50);
    const [rating, setRating] = useState(3.5);
    const [price, setPrice] = useState(250);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
        <Slider 
          variant="primary" 
          size="md" 
          label="Percentage (0-100%)"
          value={percentage}
          onChange={setPercentage}
          min={0}
          max={100}
          step={1}
          showValue={true}
        />
        <Slider 
          variant="secondary" 
          size="md" 
          label="Rating (1-5 stars)"
          value={rating}
          onChange={setRating}
          min={1}
          max={5}
          step={0.1}
          showValue={true}
        />
        <Slider 
          variant="tertiary" 
          size="md" 
          label="Price ($50-$500)"
          value={price}
          onChange={setPrice}
          min={50}
          max={500}
          step={10}
          showValue={true}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '400px' }}>
      <Slider 
        variant="primary" 
        size="md" 
        label="Disabled slider"
        value={45}
        disabled={true}
        showValue={true}
      />
      <Slider 
        variant="secondary" 
        size="md" 
        label="Another disabled slider"
        value={80}
        disabled={true}
        showValue={true}
      />
    </div>
  ),
};