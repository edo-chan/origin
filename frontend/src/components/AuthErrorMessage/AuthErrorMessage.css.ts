import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Auth error message container
export const authErrorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.md,
  padding: theme.space.md,
  backgroundColor: theme.color.surface,
  borderRadius: theme.radius.md,
  border: `${theme.border.thin} solid ${theme.color.error}`,
  boxShadow: theme.shadow.sm,
  fontFamily: theme.font.family,
  position: 'relative',
});

// Error message content area
export const errorContent = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.space.sm,
});

// Error icon styles
export const errorIcon = style({
  width: '20px',
  height: '20px',
  color: theme.color.error,
  flexShrink: 0,
  marginTop: '2px', // Align with first line of text
});

// Error text container
export const errorTextContainer = style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.xs,
  flex: 1,
  minWidth: 0,
});

// Error title styles
export const errorTitle = style({
  fontFamily: theme.font.headingFamily,
  fontSize: theme.font.size.base,
  fontWeight: theme.font.weight.semibold,
  color: theme.color.error,
  margin: 0,
  lineHeight: 1.4,
});

// Error message text styles
export const errorMessage = style({
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.normal,
  color: theme.color.text,
  margin: 0,
  lineHeight: 1.5,
  wordBreak: 'break-word',
});

// Error details (technical info)
export const errorDetails = style({
  fontSize: theme.font.size.xs,
  fontFamily: theme.font.monoFamily,
  color: theme.color.textSecondary,
  backgroundColor: theme.color.background,
  padding: theme.space.sm,
  borderRadius: theme.radius.sm,
  border: `${theme.border.thin} solid ${theme.color.borderLight}`,
  margin: 0,
  whiteSpace: 'pre-wrap',
  overflow: 'auto',
  maxHeight: '120px',
});

// Action buttons container
export const errorActions = style({
  display: 'flex',
  gap: theme.space.sm,
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexWrap: 'wrap',
});

// Dismiss button styles
export const dismissButton = style({
  position: 'absolute',
  top: theme.space.sm,
  right: theme.space.sm,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: theme.space.xs,
  borderRadius: theme.radius.sm,
  color: theme.color.textSecondary,
  transition: 'all 0.2s ease-in-out',
  
  ':hover': {
    backgroundColor: theme.color.background,
    color: theme.color.text,
  },
  
  ':focus': {
    outline: `${theme.border.thin} solid ${theme.color.error}`,
    outlineOffset: '1px',
  },
});

// Dismiss icon
export const dismissIcon = style({
  width: '16px',
  height: '16px',
});

// Retry button styles  
export const retryButton = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.xs,
  padding: `${theme.space.sm} ${theme.space.md}`,
  backgroundColor: theme.color.error,
  borderColor: theme.color.error,
  color: theme.color.background,
  border: `${theme.border.thin} solid`,
  borderRadius: theme.radius.sm,
  fontSize: theme.font.size.sm,
  fontWeight: theme.font.weight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease-in-out',
  textDecoration: 'none',
  
  ':hover': {
    backgroundColor: theme.color.errorHover,
    borderColor: theme.color.errorHover,
    transform: 'translateY(-1px)',
    boxShadow: theme.shadow.sm,
  },
  
  ':active': {
    backgroundColor: theme.color.errorActive,
    borderColor: theme.color.errorActive,
    transform: 'translateY(0px)',
  },
  
  ':focus': {
    outline: `${theme.border.base} solid ${theme.color.error}`,
    outlineOffset: theme.border.base,
  },
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: '0.6',
    transform: 'none',
    boxShadow: 'none',
  },
});

// Retry icon
export const retryIcon = style({
  width: '14px',
  height: '14px',
});