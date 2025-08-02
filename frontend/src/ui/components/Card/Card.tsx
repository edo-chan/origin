import React from 'react';
import { cardBase, sizeVariants, variantStyles } from './Card.css';

export interface CardProps {
  children: React.ReactNode;
  size?: keyof typeof sizeVariants;
  variant?: keyof typeof variantStyles;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  size = 'md',
  variant = 'tertiary',
  className = '',
  style,
}) => {
  const classes = [cardBase, sizeVariants[size], variantStyles[variant], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} style={style}>
      {children}
    </div>
  );
};