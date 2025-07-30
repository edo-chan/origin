import React from 'react';
import { cardBase, sizeVariants, sizeVariantsT, variantStyles } from './Card.css';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Standard size */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /** T-shirt size */
  sizeT?: 'tshirtXS' | 'tshirtS' | 'tshirtM' | 'tshirtL' | 'tshirtXL';
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Card content */
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  size = 'md',
  sizeT,
  variant = 'tertiary',
  children,
  className,
  ...props
}) => {
  // Use sizeT if provided, otherwise use size
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  
  const classes = [
    cardBase,
    sizeClass,
    variantStyles[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};