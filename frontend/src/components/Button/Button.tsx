import React from 'react';
import { buttonBase, sizeVariants, sizeVariantsT, variantStyles } from './Button.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
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
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  
  const classes = [
    buttonBase,
    sizeClass,
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