import React from 'react';
import { chipBase, chipVariants, chipSizes } from './Chip.css';

type ChipVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'neutral';
type ChipSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  className?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRemove?: () => void;
}

export const Chip: React.FC<ChipProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  leftIcon,
  rightIcon,
  onRemove,
  onClick,
  disabled,
  ...props
}) => {
  const classes = [
    chipBase,
    chipVariants[variant],
    chipSizes[size],
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  const handleRemove = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  return (
    <button
      type="button"
      className={classes}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {leftIcon && <span>{leftIcon}</span>}
      {children}
      {rightIcon && <span>{rightIcon}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={disabled}
          style={{
            background: 'none',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            padding: '0',
            marginLeft: '4px',
            fontSize: '12px',
            lineHeight: '1',
            color: 'currentColor',
            opacity: 0.8,
          }}
          aria-label="Remove chip"
        >
          ×
        </button>
      )}
    </button>
  );
};