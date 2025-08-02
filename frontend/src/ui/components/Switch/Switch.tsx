import React from 'react';
import * as Switch from '@radix-ui/react-switch';
import { 
  switchRoot, 
  switchThumb,
  switchLabel
} from './Switch.css';

export interface SwitchProps {
  /** Whether the switch is checked */
  checked?: boolean;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Callback when switch value changes */
  onCheckedChange?: (checked: boolean) => void;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Label text */
  label?: string;
  /** Accessible name */
  'aria-label'?: string;
  /** Name for form submission */
  name?: string;
  /** Value for form submission */
  value?: string;
  /** ID for the switch */
  id?: string;
}

export const CustomSwitch: React.FC<SwitchProps> = ({
  checked = false,
  disabled = false,
  size = 'md',
  variant = 'primary',
  onCheckedChange,
  className = '',
  style,
  label,
  'aria-label': ariaLabel,
  name,
  value,
  id,
}) => {
  const rootClasses = [
    switchRoot,
    className
  ].filter(Boolean).join(' ');

  const switchComponent = (
    <Switch.Root
      className={rootClasses}
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      name={name}
      value={value}
      id={id}
      aria-label={ariaLabel}
      style={style}
      data-size={size}
      data-variant={variant}
    >
      <Switch.Thumb className={switchThumb} />
    </Switch.Root>
  );

  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {switchComponent}
        <label htmlFor={id} className={switchLabel}>
          {label}
        </label>
      </div>
    );
  }

  return switchComponent;
};

// Keep backward compatibility
export { CustomSwitch as Switch };