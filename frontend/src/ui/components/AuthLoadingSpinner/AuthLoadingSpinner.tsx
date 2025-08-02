import React from 'react';
import { AuthLoadingSpinnerProps } from '../../../types/auth';
import {
  authLoadingContainer,
  authLoadingSizeVariants,
  authSpinner,
  authSpinnerSizeVariants,
  authLoadingMessage,
  authLoadingMessageSizeVariants,
  loadingDots,
  ghibliPulse,
} from './AuthLoadingSpinner.css';

export const AuthLoadingSpinner: React.FC<AuthLoadingSpinnerProps> = ({
  message = 'Authenticating',
  size = 'md',
  className,
  style,
  ...props
}) => {
  const containerClasses = [
    authLoadingContainer,
    authLoadingSizeVariants[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const spinnerClasses = [
    authSpinner,
    authSpinnerSizeVariants[size],
    ghibliPulse,
  ].join(' ');

  const messageClasses = [
    authLoadingMessage,
    authLoadingMessageSizeVariants[size],
    loadingDots,
  ].join(' ');

  return (
    <div className={containerClasses} style={style} {...props}>
      <div 
        className={spinnerClasses}
        role="status"
        aria-label="Loading authentication"
      />
      
      {message && (
        <p className={messageClasses} aria-live="polite">
          {message}
        </p>
      )}
    </div>
  );
};