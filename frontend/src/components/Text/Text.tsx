import React from 'react';
import { textBase, headingBase, textVariants, textSizes, textWeights } from './Text.css';

type TextVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger';
type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl';
type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
type TextElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  size?: TextSize;
  weight?: TextWeight;
  as?: TextElement;
  className?: string;
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  variant = 'primary',
  size = 'base',
  weight = 'normal',
  as: Element = 'p',
  className,
  style,
  ...props
}) => {
  // Use heading font for heading elements
  const isHeading = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(Element);
  const baseClass = isHeading ? headingBase : textBase;
  
  const classes = [
    baseClass,
    textVariants[variant],
    textSizes[size],
    textWeights[weight],
    className
  ].filter(Boolean).join(' ');

  return (
    <Element
      className={classes}
      style={style}
      {...props}
    >
      {children}
    </Element>
  );
};