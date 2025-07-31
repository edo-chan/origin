import type { Meta, StoryObj } from '@storybook/nextjs';
import { Switch } from '../components';
import { useState } from 'react';

const meta: Meta<typeof Switch> = {
  title: 'Components/Switch',
  component: Switch,
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
    checked: {
      control: { type: 'boolean' },
    },
    label: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  args: {
    size: 'md',
    variant: 'primary',
    label: 'Enable notifications',
  },
  render: (args) => {
    const [checked, setChecked] = useState(false);
    return (
      <Switch 
        {...args} 
        checked={checked} 
        onCheckedChange={setChecked}
      />
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [notifications, setNotifications] = useState(false);
    const [darkMode, setDarkMode] = useState(true);
    const [autoSave, setAutoSave] = useState(false);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch 
          variant="primary" 
          size="md" 
          label="Enable notifications"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
        <Switch 
          variant="secondary" 
          size="md" 
          label="Dark mode"
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
        <Switch 
          variant="tertiary" 
          size="md" 
          label="Auto-save documents"
          checked={autoSave}
          onCheckedChange={setAutoSave}
        />
        
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
          <strong>Current state:</strong>
          <ul>
            <li>Notifications: {notifications ? 'ON' : 'OFF'}</li>
            <li>Dark mode: {darkMode ? 'ON' : 'OFF'}</li>
            <li>Auto-save: {autoSave ? 'ON' : 'OFF'}</li>
          </ul>
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const [smallChecked, setSmallChecked] = useState(false);
    const [mediumChecked, setMediumChecked] = useState(true);
    const [largeChecked, setLargeChecked] = useState(false);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch 
          variant="primary" 
          size="sm" 
          label="Small switch"
          checked={smallChecked}
          onCheckedChange={setSmallChecked}
        />
        <Switch 
          variant="primary" 
          size="md" 
          label="Medium switch"
          checked={mediumChecked}
          onCheckedChange={setMediumChecked}
        />
        <Switch 
          variant="primary" 
          size="lg" 
          label="Large switch"
          checked={largeChecked}
          onCheckedChange={setLargeChecked}
        />
      </div>
    );
  },
};

export const Variants: Story = {
  render: () => {
    const [primaryChecked, setPrimaryChecked] = useState(true);
    const [secondaryChecked, setSecondaryChecked] = useState(true);
    const [tertiaryChecked, setTertiaryChecked] = useState(true);
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Switch 
          variant="primary" 
          size="md" 
          label="Primary variant"
          checked={primaryChecked}
          onCheckedChange={setPrimaryChecked}
        />
        <Switch 
          variant="secondary" 
          size="md" 
          label="Secondary variant"
          checked={secondaryChecked}
          onCheckedChange={setSecondaryChecked}
        />
        <Switch 
          variant="tertiary" 
          size="md" 
          label="Tertiary variant"
          checked={tertiaryChecked}
          onCheckedChange={setTertiaryChecked}
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Switch 
        variant="primary" 
        size="md" 
        label="Disabled (unchecked)"
        checked={false}
        disabled={true}
      />
      <Switch 
        variant="primary" 
        size="md" 
        label="Disabled (checked)"
        checked={true}
        disabled={true}
      />
    </div>
  ),
};