import React from 'react';
import { tagBase, tagVariants, tagSizes } from './Tag.css';

type TagVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'warning' | 'danger' | 'neutral';
type TagSize = 'xs' | 'sm' | 'md' | 'lg';

export interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  size?: TagSize;
  className?: string;
  style?: React.CSSProperties;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className,
  style,
  onRemove,
  ...props
}) => {
  const classes = [
    tagBase,
    tagVariants[variant],
    tagSizes[size],
    className
  ].filter(Boolean).join(' ');

  return (
    <span
      className={classes}
      style={style}
      {...props}
    >
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0',
            marginLeft: '4px',
            fontSize: '12px',
            lineHeight: '1',
            color: 'currentColor',
            opacity: 0.7,
          }}
          aria-label="Remove tag"
        >
          ×
        </button>
      )}
    </span>
  );
};