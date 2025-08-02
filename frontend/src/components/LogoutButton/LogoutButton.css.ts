import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// Logout button specific styles (inherits from button base)
export const logoutButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderRadius: theme.radius.md,
  transition: 'all 0.2s ease-in-out',
  textDecoration: 'none',
  outline: 'none',
  gap: theme.space.xs,
  position: 'relative',
  overflow: 'hidden',
  
  // Default to tertiary variant styling for logout
  backgroundColor: 'transparent',
  borderColor: theme.color.error,
  color: theme.color.error,
  
  ':hover': {
    backgroundColor: theme.color.error,
    borderColor: theme.color.error,
    color: theme.color.background,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadow.md,
  },
  
  ':active': {
    backgroundColor: theme.color.errorActive,
    borderColor: theme.color.errorActive,
    transform: 'translateY(0px)',
    boxShadow: theme.shadow.sm,
  },
  
  ':focus': {
    outline: `${theme.border.base} solid ${theme.color.error}`,
    outlineOffset: theme.border.base,
  },
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: '0.6',
    transform: 'none',
    boxShadow: theme.shadow.none,
  },
});

// Logout icon styles
export const logoutIcon = style({
  width: '16px',
  height: '16px',
  flexShrink: 0,
});

// Loading overlay for logout button
export const logoutLoadingOverlay = style({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 'inherit',
});

// Loading spinner for logout button
export const logoutSpinner = style({
  width: '14px',
  height: '14px',
  border: `2px solid ${theme.color.borderLight}`,
  borderTop: `2px solid ${theme.color.error}`,
  borderRadius: '50%',
  animation: `${spinAnimation} 1s linear infinite`,
});

// Button text styles
export const logoutButtonText = style({
  fontWeight: theme.font.weight.medium,
  whiteSpace: 'nowrap',
  
  selectors: {
    [`${logoutButtonBase}:disabled &`]: {
      color: theme.color.textSecondary,
    },
  },
});