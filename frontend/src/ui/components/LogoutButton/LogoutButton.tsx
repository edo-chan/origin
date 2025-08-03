import React from 'react';

// LogoutButton component props interface
export interface LogoutButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'tertiary';
  isLoading?: boolean;
  disabled?: boolean;
  onLogout?: () => void | Promise<void>;
}
import { sizeVariants } from '../Button/Button.css';
import {
  logoutButtonBase,
  logoutIcon,
  logoutLoadingOverlay,
  logoutSpinner,
  logoutButtonText,
} from './LogoutButton.css';

// Logout icon SVG component
const LogoutIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16,17 21,12 16,7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  text = 'Sign out',
  size = 'md',
  variant = 'tertiary',
  isLoading = false,
  disabled = false,
  onLogout,
  className,
  style,
  ...props
}) => {
  const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    
    if (isLoading || disabled) {
      return;
    }


    try {
      // Call the logout callback
      if (onLogout) {
        await onLogout();
      } else {
        // Default logout behavior - clear local storage and refresh
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        
        
        // Redirect to home page or refresh
        if (typeof window !== 'undefined') {
          window.location.href = '/';
        }
      }
    } catch (error) {
    }
  };

  const classes = [
    logoutButtonBase,
    sizeVariants[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      style={style}
      onClick={handleClick}
      disabled={disabled || isLoading}
      aria-label={`${text} - Sign out of your account`}
      type="button"
      {...props}
    >
      {!isLoading && <LogoutIcon className={logoutIcon} />}
      <span className={logoutButtonText}>{text}</span>
      
      {isLoading && (
        <div className={logoutLoadingOverlay}>
          <div className={logoutSpinner} aria-label="Signing out..." />
        </div>
      )}
    </button>
  );
};