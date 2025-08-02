import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

// Auth loading spinner container
export const authLoadingContainer = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.space.md,
  padding: theme.space.lg,
  fontFamily: theme.font.family,
});

// Size variants for auth loading spinner
export const authLoadingSizeVariants = styleVariants({
  sm: {
    gap: theme.space.sm,
    padding: theme.space.md,
  },
  md: {
    gap: theme.space.md,
    padding: theme.space.lg,
  },
  lg: {
    gap: theme.space.lg,
    padding: theme.space.xl,
  },
});

// Define keyframes animations
const spinAnimation = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

const dotsAnimation = keyframes({
  '0%, 20%': { content: '""' },
  '40%': { content: '"."' },
  '60%': { content: '".."' },
  '80%': { content: '"..."' },
  '90%, 100%': { content: '""' },
});

const ghibliPulseAnimation = keyframes({
  '0%': { 
    transform: 'scale(1)',
    filter: 'hue-rotate(0deg)',
  },
  '50%': { 
    transform: 'scale(1.05)',
    filter: 'hue-rotate(10deg)',
  },
  '100%': { 
    transform: 'scale(1)',
    filter: 'hue-rotate(0deg)',
  },
});

// Auth spinner styles
export const authSpinner = style({
  borderRadius: '50%',
  border: `3px solid ${theme.color.borderLight}`,
  borderTopColor: theme.color.primary,
  animation: `${spinAnimation} 1s linear infinite`,
});

// Spinner size variants
export const authSpinnerSizeVariants = styleVariants({
  sm: {
    width: '24px',
    height: '24px',
    borderWidth: '2px',
  },
  md: {
    width: '32px',
    height: '32px',
    borderWidth: '3px',
  },
  lg: {
    width: '48px',
    height: '48px',
    borderWidth: '4px',
  },
});

// Loading message styles
export const authLoadingMessage = style({
  fontWeight: theme.font.weight.medium,
  color: theme.color.text,
  textAlign: 'center',
  margin: 0,
});

// Loading message size variants
export const authLoadingMessageSizeVariants = styleVariants({
  sm: {
    fontSize: theme.font.size.sm,
  },
  md: {
    fontSize: theme.font.size.base,
  },
  lg: {
    fontSize: theme.font.size.lg,
  },
});

// Animated dots for loading message
export const loadingDots = style({
  ':after': {
    content: '""',
    display: 'inline-block',
    animation: `${dotsAnimation} 1.5s infinite`,
  },
});

// Studio Ghibli inspired pulsing animation
export const ghibliPulse = style({
  animation: `${ghibliPulseAnimation} 2s ease-in-out infinite`,
});