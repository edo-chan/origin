import { style, keyframes } from '@vanilla-extract/css';
import { theme } from '@/styles/theme.css';

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

export const container = style({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.color.background
});

export const loadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: theme.space.xl,
  textAlign: 'center'
});

export const loadingSpinner = style({
  width: '48px',
  height: '48px',
  border: `4px solid ${theme.color.borderLight}`,
  borderTop: `4px solid ${theme.color.primary}`,
  borderRadius: '50%',
  animation: `${spinAnimation} 1s linear infinite`,
  marginBottom: theme.space.lg,
});

export const loadingText = style({
  fontSize: theme.font.size.lg,
  fontFamily: theme.font.headingFamily,
  fontWeight: theme.font.weight.semibold,
  color: theme.color.text,
  marginBottom: theme.space.sm
});

export const loadingSubtext = style({
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  color: theme.color.textSecondary,
  maxWidth: '400px',
  lineHeight: 1.5
});

export const loginPromptContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: theme.space.xl,
  textAlign: 'center'
});

export const loginPromptTitle = style({
  fontSize: theme.font.size['2xl'],
  fontFamily: theme.font.headingFamily,
  fontWeight: theme.font.weight.bold,
  color: theme.color.text,
  marginBottom: theme.space.md
});

export const loginPromptSubtitle = style({
  fontSize: theme.font.size.lg,
  fontFamily: theme.font.family,
  color: theme.color.textSecondary,
  marginBottom: theme.space.xl,
  maxWidth: '500px',
  lineHeight: 1.6
});

export const loginPromptActions = style({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.space.md,
  alignItems: 'center',
  width: '100%',
  maxWidth: '320px'
});

export const alternativeLink = style({
  fontSize: theme.font.size.sm,
  fontFamily: theme.font.family,
  color: theme.color.primary,
  textDecoration: 'none',
  padding: theme.space.sm,
  borderRadius: theme.radius.sm,
  transition: 'all 0.2s ease',
  
  ':hover': {
    backgroundColor: theme.color.surface,
    textDecoration: 'underline'
  },
  
  ':focus': {
    outline: `2px solid ${theme.color.primary}`,
    outlineOffset: '2px'
  }
});

export const errorContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
  padding: theme.space.xl,
  textAlign: 'center'
});

export const errorIcon = style({
  width: '64px',
  height: '64px',
  marginBottom: theme.space.lg,
  color: theme.color.error
});

export const errorTitle = style({
  fontSize: theme.font.size['2xl'],
  fontFamily: theme.font.headingFamily,
  fontWeight: theme.font.weight.bold,
  color: theme.color.error,
  marginBottom: theme.space.md
});

export const errorMessage = style({
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  color: theme.color.textSecondary,
  marginBottom: theme.space.xl,
  maxWidth: '500px',
  lineHeight: 1.6
});

export const errorActions = style({
  display: 'flex',
  gap: theme.space.md,
  alignItems: 'center',
  flexWrap: 'wrap',
  justifyContent: 'center'
});

export const retryButton = style({
  padding: `${theme.space.sm} ${theme.space.md}`,
  backgroundColor: theme.color.primary,
  color: '#fff',
  border: 'none',
  borderRadius: theme.radius.md,
  fontSize: theme.font.size.base,
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  ':hover': {
    backgroundColor: theme.color.primaryHover
  },
  
  ':active': {
    backgroundColor: theme.color.primaryActive
  },
  
  ':focus': {
    outline: `2px solid ${theme.color.primary}`,
    outlineOffset: '2px'
  }
});