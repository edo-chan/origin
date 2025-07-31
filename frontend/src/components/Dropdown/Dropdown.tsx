import React from 'react';
import * as Popover from '@radix-ui/react-popover';
import { 
  dropdownContent, 
  dropdownItem, 
  dropdownTrigger,
  dropdownSeparator,
  dropdownArrow
} from './Dropdown.css';

export interface DropdownOption {
  /** Option value */
  value: string;
  /** Option label */
  label: string;
  /** Whether option is disabled */
  disabled?: boolean;
  /** Whether to show separator after this option */
  separator?: boolean;
}

export interface DropdownProps {
  /** Dropdown trigger content */
  trigger: React.ReactNode;
  /** Dropdown options */
  options: DropdownOption[];
  /** Callback when option is selected */
  onSelect?: (value: string) => void;
  /** Whether dropdown is open (controlled) */
  open?: boolean;
  /** Default open state */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Placement of dropdown */
  side?: 'top' | 'bottom' | 'left' | 'right';
  /** Alignment of dropdown */
  align?: 'start' | 'center' | 'end';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const CustomDropdown: React.FC<DropdownProps> = ({
  trigger,
  options,
  onSelect,
  open,
  defaultOpen,
  onOpenChange,
  side = 'bottom',
  align = 'start',
  variant = 'neutral',
  size = 'md',
  className = '',
  style,
}) => {
  const triggerClasses = [
    dropdownTrigger,
    className
  ].filter(Boolean).join(' ');

  const contentClasses = [
    dropdownContent
  ].filter(Boolean).join(' ');

  const handleOptionClick = (value: string) => {
    onSelect?.(value);
    onOpenChange?.(false);
  };

  return (
    <Popover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Popover.Trigger asChild>
        <button 
          className={triggerClasses}
          style={style}
          data-variant={variant}
          data-size={size}
        >
          {trigger}
        </button>
      </Popover.Trigger>
      
      <Popover.Portal>
        <Popover.Content
          className={contentClasses}
          side={side}
          align={align}
          sideOffset={4}
          data-variant={variant}
          data-size={size}
        >
          {options.map((option, index) => (
            <React.Fragment key={option.value}>
              <button
                className={dropdownItem}
                disabled={option.disabled}
                onClick={() => handleOptionClick(option.value)}
                data-variant={variant}
                data-size={size}
                type="button"
              >
                {option.label}
              </button>
              {option.separator && <div className={dropdownSeparator} />}
            </React.Fragment>
          ))}
          <Popover.Arrow className={dropdownArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

// Keep backward compatibility
export { CustomDropdown as Dropdown };