import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// Base Google login button styles
export const googleLoginButtonBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  fontFamily: theme.font.family,
  fontWeight: theme.font.weight.medium,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderColor: theme.color.border,
  backgroundColor: theme.color.background,
  color: theme.color.text,
  borderRadius: theme.radius.md,
  transition: 'all 0.2s ease-in-out',
  textDecoration: 'none',
  outline: 'none',
  gap: theme.space.sm,
  position: 'relative',
  overflow: 'hidden',
  
  // Studio Ghibli-inspired gradient background
  background: `linear-gradient(135deg, ${theme.color.background} 0%, ${theme.color.surface} 100%)`,
  boxShadow: theme.shadow.sm,
  
  ':hover': {
    backgroundColor: theme.color.surface,
    borderColor: theme.color.borderLight,
    boxShadow: theme.shadow.md,
    transform: 'translateY(-1px)',
  },
  
  ':active': {
    transform: 'translateY(0px)',
    boxShadow: theme.shadow.sm,
  },
  
  ':focus': {
    outline: `${theme.border.base} solid ${theme.color.primary}`,
    outlineOffset: theme.border.base,
  },
  
  ':disabled': {
    cursor: 'not-allowed',
    opacity: '0.6',
    transform: 'none',
    boxShadow: theme.shadow.none,
  },
});

// Size variants for Google login button
export const googleButtonSizeVariants = styleVariants({
  sm: {
    paddingLeft: theme.space.md,
    paddingRight: theme.space.md,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.sm,
    fontSize: theme.font.size.sm,
    minHeight: '36px',
  },
  md: {
    paddingLeft: theme.space.lg,
    paddingRight: theme.space.lg,
    paddingTop: theme.space.sm,
    paddingBottom: theme.space.sm,
    fontSize: theme.font.size.base,
    minHeight: '44px',
  },
  lg: {
    paddingLeft: theme.space.xl,
    paddingRight: theme.space.xl,
    paddingTop: theme.space.md,
    paddingBottom: theme.space.md,
    fontSize: theme.font.size.lg,
    minHeight: '52px',
  },
});

// Google logo icon styles
export const googleLogoIcon = style({
  width: '18px',
  height: '18px',
  flexShrink: 0,
});

// Loading state overlay
export const loadingOverlay = style({
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

// Loading spinner for the button
export const buttonSpinner = style({
  width: '16px',
  height: '16px',
  border: `2px solid ${theme.color.borderLight}`,
  borderTop: `2px solid ${theme.color.primary}`,
  borderRadius: '50%',
  animation: `${spinAnimation} 1s linear infinite`,
});

// Text content styles
export const buttonText = style({
  fontWeight: theme.font.weight.medium,
  whiteSpace: 'nowrap',
  
  selectors: {
    [`${googleLoginButtonBase}:disabled &`]: {
      color: theme.color.textSecondary,
    },
  },
});