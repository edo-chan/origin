import React from 'react';
import { buttonGroupBase, sizeVariants, orientationStyles, verticalButtonGroup } from './ButtonGroup.css';

export interface ButtonGroupProps {
  /** Children buttons */
  children: React.ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  children,
  size = 'md',
  orientation = 'horizontal',
  className = '',
  style,
}) => {
  const containerClasses = [
    buttonGroupBase,
    sizeVariants[size],
    orientation === 'vertical' ? verticalButtonGroup : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      {children}
    </div>
  );
};