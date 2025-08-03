import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { loadingBase, spinnerVariants, progressBarVariants, dotsVariants, sizeVariants } from './Loading.css';

export interface LoadingProps {
  /** Loading type */
  type?: 'spinner' | 'progress' | 'dots';
  /** Color variant */
  variant?: 'primary' | 'secondary' | 'tertiary';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Progress percentage (only for progress type) */
  progress?: number;
  /** Additional CSS class */
  className?: string;
  /** Additional styles */
  style?: React.CSSProperties;
}

export const Loading: React.FC<LoadingProps> = ({
  type = 'spinner',
  variant = 'primary',
  size = 'md',
  progress = 0,
  className = '',
  style,
}) => {
  const baseClasses = [loadingBase, sizeVariants[size], className].filter(Boolean).join(' ');

  if (type === 'spinner') {
    return (
      <div className={baseClasses} style={style}>
        <div className={spinnerVariants[variant]} />
      </div>
    );
  }

  if (type === 'progress') {
    const progressValue = Math.min(Math.max(progress, 0), 100);
    return (
      <div className={baseClasses} style={style}>
        <Progress.Root 
          className={progressBarVariants.track}
          value={progressValue}
          max={100}
        >
          <Progress.Indicator 
            className={progressBarVariants[variant]}
            style={{ transform: `translateX(-${100 - progressValue}%)` }}
          />
        </Progress.Root>
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={baseClasses} style={style}>
        <div className={dotsVariants.container}>
          <div className={dotsVariants[variant]} />
          <div className={dotsVariants[variant]} />
          <div className={dotsVariants[variant]} />
        </div>
      </div>
    );
  }

  return null;
};