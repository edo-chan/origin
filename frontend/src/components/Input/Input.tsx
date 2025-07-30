import React from 'react';
import { inputBase, sizeVariants, sizeVariantsT, variantStyles } from './Input.css';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
}

export const Input: React.FC<InputProps> = ({
  size = 'md',
  sizeT,
  variant = 'tertiary',
  className,
  ...props
}) => {
  // Use sizeT if provided, otherwise use size
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  
  const classes = [
    inputBase,
    sizeClass,
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <input className={classes} {...props} />
  );
};