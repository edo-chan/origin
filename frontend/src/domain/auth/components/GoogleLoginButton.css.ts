import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const googleLoginButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.sm,
  padding: `${theme.space.sm} ${theme.space.md}`,
  backgroundColor: '#fff',
  border: `${theme.border.thin} solid #dadce0`,
  borderRadius: theme.radius.md,
  color: '#3c4043',
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minHeight: '44px',
  minWidth: '240px',
  
  ':hover': {
    backgroundColor: '#f8f9fa',
    boxShadow: theme.shadow.md,
    borderColor: '#dadce0'
  },
  
  ':active': {
    backgroundColor: '#f1f3f4',
    boxShadow: theme.shadow.sm
  },
  
  ':focus': {
    outline: `2px solid ${theme.color.primary}`,
    outlineOffset: '2px'
  },
  
  ':disabled': {
    backgroundColor: '#f8f9fa',
    color: '#5f6368',
    cursor: 'not-allowed',
    opacity: 0.6
  }
});

export const googleIcon = style({
  width: '20px',
  height: '20px',
  flexShrink: 0
});

export const buttonText = style({
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.medium,
  color: '#3c4043'
});

export const loadingSpinner = style({
  width: '20px',
  height: '20px',
  border: '2px solid #f3f3f3',
  borderTop: '2px solid #4285f4',
  borderRadius: '50%',
  animation: `${spinAnimation} 1s linear infinite`,
});

export const errorMessage = style({
  marginTop: theme.space.sm,
  padding: theme.space.sm,
  backgroundColor: '#fce8e6',
  color: '#d93025',
  border: `${theme.border.thin} solid #f9ab00`,
  borderRadius: theme.radius.sm,
  fontSize: theme.font.size.sm,
  fontFamily: theme.font.family
});

export const compactButton = style({
  minWidth: 'auto',
  padding: theme.space.sm
});

export const fullWidthButton = style({
  width: '100%',
  minWidth: 'auto'
});