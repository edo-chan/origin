import React from 'react';
import { cardBase, sizeVariants, sizeVariantsT, variantStyles } from './Card.css';

export interface CardProps {
  children: React.ReactNode;
  size?: keyof typeof sizeVariants;
  sizeT?: keyof typeof sizeVariantsT;
  variant?: keyof typeof variantStyles;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  size = 'md',
  sizeT,
  variant = 'tertiary',
  className = '',
}) => {
  const sizeClass = sizeT ? sizeVariantsT[sizeT] : sizeVariants[size];
  const classes = [cardBase, sizeClass, variantStyles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {children}
    </div>
  );
};