import React from 'react';
import * as Checkbox from '@radix-ui/react-checkbox';
import * as Label from '@radix-ui/react-label';
import { 
  checkboxRoot, 
  checkboxIndicator,
  checkboxLabel
} from './Checkbox.css';

export interface CheckboxProps {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Default checked state */
  defaultChecked?: boolean;
  /** Whether the checkbox is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Callback when checked state changes */
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
  /** ID for the checkbox */
  id?: string;
  /** Required field indicator */
  required?: boolean;
}

export const CustomCheckbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
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
  required = false,
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  const rootClasses = [
    checkboxRoot,
    className
  ].filter(Boolean).join(' ');

  const checkboxComponent = (
    <Checkbox.Root
      className={rootClasses}
      checked={checked}
      defaultChecked={defaultChecked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      name={name}
      value={value}
      id={checkboxId}
      aria-label={ariaLabel}
      style={style}
      data-size={size}
      data-variant={variant}
      required={required}
    >
      <Checkbox.Indicator className={checkboxIndicator}>
        <svg
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m11.4669 3.72684c.7086.7074.7086 1.85462 0 2.56201l-4.5 4.48124c-.7086.7074-1.8578.7074-2.5664 0l-2.5-2.4812c-.70858-.7074-.70858-1.85465 0-2.56204.7086-.7074 1.8578-.7074 2.5664 0l1.2334 1.22504 3.2334-3.22004c.7086-.70739 1.8578-.70739 2.5664 0z"
            fill="currentColor"
            fillRule="evenodd"
            clipRule="evenodd"
          />
        </svg>
      </Checkbox.Indicator>
    </Checkbox.Root>
  );

  if (label) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {checkboxComponent}
        <Label.Root htmlFor={checkboxId} className={checkboxLabel}>
          {label}
          {required && <span style={{ color: 'red', marginLeft: '2px' }}>*</span>}
        </Label.Root>
      </div>
    );
  }

  return checkboxComponent;
};

// Keep backward compatibility
export { CustomCheckbox as Checkbox };