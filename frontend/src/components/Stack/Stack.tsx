import React from 'react';
import { 
  stackBase, 
  directionVariants, 
  alignVariants, 
  justifyVariants, 
  wrapVariants,
  gapVariants,
  paddingVariants
} from './Stack.css';

export interface StackProps {
  children: React.ReactNode;
  direction?: 'row' | 'column';
  gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'column',
  gap = 'none',
  align,
  justify,
  wrap = false,
  padding = 'none',
  className = '',
  style = {},
}) => {
  const stackClasses = [
    stackBase,
    directionVariants[direction],
    gapVariants[gap],
    paddingVariants[padding],
    align && alignVariants[align],
    justify && justifyVariants[justify],
    wrap && wrapVariants.wrap,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={stackClasses} style={style}>
      {children}
    </div>
  );
};