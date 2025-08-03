import React from 'react';
import { AuthError, AuthErrorCode } from '../../../domain/auth/atoms';

// AuthErrorMessage component props interface
export interface AuthErrorMessageProps extends React.HTMLAttributes<HTMLDivElement> {
  error: AuthError | string;
  showRetry?: boolean;
  onRetry?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
}

import {
  authErrorContainer,
  errorContent,
  errorIcon,
  errorTextContainer,
  errorTitle,
  errorMessage,
  errorDetails,
  errorActions,
  dismissButton,
  dismissIcon,
  retryButton,
  retryIcon,
} from './AuthErrorMessage.css';

// Error icon SVG
const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

// Retry icon SVG
const RetryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="23,4 23,10 17,10" />
    <polyline points="1,20 1,14 7,14" />
    <path d="M20.49,9A9,9,0,0,0,5.64,5.64L1,10m22,4L18.36,18.36A9,9,0,0,1,3.51,15" />
  </svg>
);

// Dismiss icon SVG
const DismissIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const AuthErrorMessage: React.FC<AuthErrorMessageProps> = ({
  error,
  showRetry = false,
  onRetry,
  dismissible = true,
  onDismiss,
  className,
  style,
  ...props
}) => {
  const isAuthError = typeof error === 'object' && error !== null && 'code' in error;
  const errorObj = isAuthError ? error as AuthError : null;
  const errorString = typeof error === 'string' ? error : errorObj?.message || 'An error occurred';

  const getErrorTitle = (): string => {
    if (errorObj) {
      switch (errorObj.code) {
        case AuthErrorCode.INVALID_TOKEN:
        case AuthErrorCode.TOKEN_EXPIRED:
        case AuthErrorCode.INVALID_REFRESH_TOKEN:
          return 'Authentication Expired';
        case AuthErrorCode.INVALID_CODE:
        case AuthErrorCode.OAUTH_SERVICE_ERROR:
          return 'Authentication Failed';
        case AuthErrorCode.NETWORK_ERROR:
          return 'Connection Error';
        case AuthErrorCode.INVALID_CREDENTIALS:
        case AuthErrorCode.USER_NOT_FOUND:
          return 'Invalid Credentials';
        case AuthErrorCode.SESSION_NOT_FOUND:
        case AuthErrorCode.SESSION_EXPIRED:
          return 'Session Expired';
        default:
          return 'Authentication Error';
      }
    }
    return 'Error';
  };

  const handleRetry = () => {
    onRetry?.();
  };

  const handleDismiss = () => {
    onDismiss?.();
  };

  const classes = [authErrorContainer, className].filter(Boolean).join(' ');

  return (
    <div 
      className={classes} 
      style={style} 
      role="alert"
      aria-live="assertive"
      {...props}
    >
      {/* Dismiss button */}
      {dismissible && (
        <button
          className={dismissButton}
          onClick={handleDismiss}
          aria-label="Dismiss error message"
          type="button"
        >
          <DismissIcon className={dismissIcon} />
        </button>
      )}

      {/* Error content */}
      <div className={errorContent}>
        <ErrorIcon className={errorIcon} />
        
        <div className={errorTextContainer}>
          <h4 className={errorTitle}>{getErrorTitle()}</h4>
          <p className={errorMessage}>{errorString}</p>
          
          {/* Show technical details for AuthError objects */}
          {errorObj?.details && (
            <pre className={errorDetails}>
              Error Code: {errorObj.code}
              {errorObj.details && `\nDetails: ${errorObj.details}`}
            </pre>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {showRetry && onRetry && (
        <div className={errorActions}>
          <button
            className={retryButton}
            onClick={handleRetry}
            type="button"
            aria-label="Retry authentication"
          >
            <RetryIcon className={retryIcon} />
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};