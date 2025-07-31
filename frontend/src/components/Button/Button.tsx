import React from 'react';
import { buttonBase, sizeVariants, variantStyles } from './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size (overrides size if provided) */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Button content */
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  size = 'md',
  sizeT,
  variant = 'primary',
  children,
  className,
  ...props
}) => {
  // Use sizeT if provided, otherwise use size
  const finalSize = sizeT || size;
  
  const classes = [
    buttonBase,
    sizeVariants[finalSize as keyof typeof sizeVariants],
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};