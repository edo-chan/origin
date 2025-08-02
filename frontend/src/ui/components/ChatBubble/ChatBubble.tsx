import React from 'react';
import { bubbleContainer, bubbleBase, bubbleTail, sizeVariants, variantStyles, positionStyles, timestampBase, timestampLeft, timestampRight, avatarLeft, avatarRight } from './ChatBubble.css';

export interface ChatBubbleProps {
  /** Bubble content */
  children: React.ReactNode;
  /** Position of the bubble */
  position?: 'left' | 'right';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary' | 'neutral';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show the tail/pointer */
  showTail?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
  /** Avatar/user info */
  avatar?: React.ReactNode;
  /** Timestamp */
  timestamp?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  children,
  position = 'left',
  variant = 'neutral',
  size = 'md',
  showTail = true,
  className = '',
  style,
  avatar,
  timestamp,
}) => {
  const containerClasses = [
    bubbleContainer,
    positionStyles[position],
    sizeVariants[size],
    className
  ].filter(Boolean).join(' ');

  const bubbleClasses = [
    bubbleBase,
    variantStyles[variant],
  ].filter(Boolean).join(' ');

  const tailClasses = [
    bubbleTail,
    variantStyles[variant],
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={style}>
      {avatar && position === 'left' && (
        <div className={avatarLeft}>
          {avatar}
        </div>
      )}
      
      <div style={{ position: 'relative', maxWidth: '100%' }}>
        <div className={bubbleClasses}>
          {children}
          {showTail && <div className={tailClasses} />}
        </div>
        {timestamp && (
          <div className={`${timestampBase} ${position === 'right' ? timestampRight : timestampLeft}`}>
            {timestamp}
          </div>
        )}
      </div>

      {avatar && position === 'right' && (
        <div className={avatarRight}>
          {avatar}
        </div>
      )}
    </div>
  );
};