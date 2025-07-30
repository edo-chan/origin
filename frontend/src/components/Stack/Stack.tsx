import React from 'react';
import { tokens } from '../../styles/tokens.css';
import { 
  stackBase, 
  directionVariants, 
  alignVariants, 
  justifyVariants, 
  wrapVariants 
} from './Stack.css';

export interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: keyof typeof tokens.padding;
  align?: keyof typeof alignVariants;
  justify?: keyof typeof justifyVariants;
  wrap?: boolean;
  padding?: keyof typeof tokens.padding;
  className?: string;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  gap,
  align,
  justify,
  wrap = false,
  padding,
  className = '',
  style = {},
}) => {
  const stackClasses = [
    stackBase,
    directionVariants[direction],
    align && alignVariants[align],
    justify && justifyVariants[justify],
    wrap && wrapVariants.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const dynamicStyle = {
    ...style,
    ...(gap && { gap: tokens.padding[gap] }),
    ...(padding && { padding: tokens.padding[padding] }),
  };

  return (
    <div className={stackClasses} style={dynamicStyle}>
      {children}
    </div>
  );
};