import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { 
  sliderRoot,
  sliderTrack,
  sliderRange,
  sliderThumb,
  sliderLabel, 
  sliderValue 
} from './Slider.css';

export interface SliderProps {
  /** Current value array (Radix expects array) */
  value?: number[];
  /** Default value array */
  defaultValue?: number[];
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step size */
  step?: number;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Callback when value changes */
  onValueChange?: (value: number[]) => void;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Label text */
  label?: string;
  /** Show value label */
  showValue?: boolean;
  /** Name for form submission */
  name?: string;
  /** Accessible label */
  'aria-label'?: string;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
}

export const CustomSlider: React.FC<SliderProps> = ({
  value = [50],
  defaultValue = [50],
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'primary',
  onValueChange,
  className = '',
  style,
  label,
  showValue = false,
  name,
  'aria-label': ariaLabel,
  orientation = 'horizontal',
}) => {
  const rootClasses = [
    sliderRoot,
    className
  ].filter(Boolean).join(' ');

  const displayValue = value[0] || defaultValue[0];

  return (
    <div style={style}>
      {label && (
        <div className={sliderLabel}>
          <span>{label}</span>
          {showValue && (
            <span className={sliderValue}>{displayValue}</span>
          )}
        </div>
      )}
      <Slider.Root
        className={rootClasses}
        value={value}
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onValueChange={onValueChange}
        name={name}
        aria-label={ariaLabel || label}
        orientation={orientation}
        data-size={size}
        data-variant={variant}
      >
        <Slider.Track className={sliderTrack}>
          <Slider.Range className={sliderRange} />
        </Slider.Track>
        <Slider.Thumb className={sliderThumb} />
      </Slider.Root>
    </div>
  );
};

// Keep backward compatibility
export { CustomSlider as Slider };

// Helper for single value usage
export const SingleSlider: React.FC<Omit<SliderProps, 'value' | 'onValueChange'> & {
  value?: number;
  onChange?: (value: number) => void;
}> = ({ value, onChange, ...props }) => {
  return (
    <CustomSlider
      {...props}
      value={value !== undefined ? [value] : undefined}
      onValueChange={onChange ? (values) => onChange(values[0]) : undefined}
    />
  );
};