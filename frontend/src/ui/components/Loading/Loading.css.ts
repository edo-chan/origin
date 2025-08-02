import { style, styleVariants, keyframes } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Base loading container
export const loadingBase = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: theme.font.family,
});

// Size variants
export const sizeVariants = styleVariants({
  sm: {
    fontSize: theme.font.size.sm,
    minHeight: '20px',
  },
  md: {
    fontSize: theme.font.size.base,
    minHeight: '24px',
  },
  lg: {
    fontSize: theme.font.size.lg,
    minHeight: '32px',
  },
});

// Spinner animations
const spin = keyframes({
  '0%': { transform: 'rotate(0deg)' },
  '100%': { transform: 'rotate(360deg)' },
});

// Spinner variants
export const spinnerVariants = styleVariants({
  primary: {
    width: '1.5em',
    height: '1.5em',
    border: `${theme.border.base} solid ${theme.color.borderLight}`,
    borderTop: `${theme.border.base} solid ${theme.color.primary}`,
    borderRadius: theme.radius.full,
    animation: `${spin} 1s linear infinite`,
  },
  secondary: {
    width: '1.5em',
    height: '1.5em',
    border: `${theme.border.base} solid ${theme.color.borderLight}`,
    borderTop: `${theme.border.base} solid ${theme.color.secondary}`,
    borderRadius: theme.radius.full,
    animation: `${spin} 1s linear infinite`,
  },
  tertiary: {
    width: '1.5em',
    height: '1.5em',
    border: `${theme.border.base} solid ${theme.color.borderLight}`,
    borderTop: `${theme.border.base} solid ${theme.color.tertiary}`,
    borderRadius: theme.radius.full,
    animation: `${spin} 1s linear infinite`,
  },
});

// Progress bar variants
export const progressBarVariants = styleVariants({
  track: {
    width: '100%',
    height: '6px',
    backgroundColor: theme.color.borderLight,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
    position: 'relative',
    border: `${theme.border.thin} solid ${theme.color.border}`,
  },
  primary: {
    height: '100%',
    backgroundColor: theme.color.primary,
    borderRadius: theme.radius.full,
    transition: 'width 0.3s ease-in-out',
  },
  secondary: {
    height: '100%',
    backgroundColor: theme.color.secondary,
    borderRadius: theme.radius.full,
    transition: 'width 0.3s ease-in-out',
  },
  tertiary: {
    height: '100%',
    backgroundColor: theme.color.tertiary,
    borderRadius: theme.radius.full,
    transition: 'width 0.3s ease-in-out',
  },
});

// Dots animation
const bounce = keyframes({
  '0%, 80%, 100%': {
    transform: 'scale(0.8)',
    opacity: '0.6',
  },
  '40%': {
    transform: 'scale(1)',
    opacity: '1',
  },
});

// Dots variants
export const dotsVariants = styleVariants({
  container: {
    display: 'flex',
    gap: theme.space.xs,
    alignItems: 'center',
  },
  primary: {
    width: '6px',
    height: '6px',
    backgroundColor: theme.color.primary,
    borderRadius: theme.radius.full,
    animation: `${bounce} 1.4s ease-in-out infinite both`,
    ':nth-child(1)': {
      animationDelay: '-0.32s',
    },
    ':nth-child(2)': {
      animationDelay: '-0.16s',
    },
    ':nth-child(3)': {
      animationDelay: '0s',
    },
  },
  secondary: {
    width: '6px',
    height: '6px',
    backgroundColor: theme.color.secondary,
    borderRadius: theme.radius.full,
    animation: `${bounce} 1.4s ease-in-out infinite both`,
    ':nth-child(1)': {
      animationDelay: '-0.32s',
    },
    ':nth-child(2)': {
      animationDelay: '-0.16s',
    },
    ':nth-child(3)': {
      animationDelay: '0s',
    },
  },
  tertiary: {
    width: '6px',
    height: '6px',
    backgroundColor: theme.color.tertiary,
    borderRadius: theme.radius.full,
    animation: `${bounce} 1.4s ease-in-out infinite both`,
    ':nth-child(1)': {
      animationDelay: '-0.32s',
    },
    ':nth-child(2)': {
      animationDelay: '-0.16s',
    },
    ':nth-child(3)': {
      animationDelay: '0s',
    },
  },
});