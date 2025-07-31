import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '../../styles/theme.css';

export const textBase = style({
  fontFamily: theme.font.family,
  margin: 0,
  padding: 0,
});

export const headingBase = style({
  fontFamily: theme.font.headingFamily,
  margin: 0,
  padding: 0,
});

export const textVariants = styleVariants({
  primary: {
    color: theme.color.text,
  },
  secondary: {
    color: theme.color.textSecondary,
  },
  tertiary: {
    color: theme.color.border,
  },
  success: {
    color: theme.color.tertiary,
  },
  warning: {
    color: theme.color.secondary,
  },
  danger: {
    color: '#dc2626', // Keep red for danger
  },
});

export const textSizes = styleVariants({
  xs: {
    fontSize: theme.font.size.xs,
    lineHeight: '1.4',
  },
  sm: {
    fontSize: theme.font.size.sm,
    lineHeight: '1.4',
  },
  base: {
    fontSize: theme.font.size.base,
    lineHeight: '1.5',
  },
  lg: {
    fontSize: theme.font.size.lg,
    lineHeight: '1.5',
  },
  xl: {
    fontSize: theme.font.size.xl,
    lineHeight: '1.4',
  },
  '2xl': {
    fontSize: theme.font.size['2xl'],
    lineHeight: '1.3',
  },
});

export const textWeights = styleVariants({
  normal: {
    fontWeight: theme.font.weight.normal,
  },
  medium: {
    fontWeight: theme.font.weight.medium,
  },
  semibold: {
    fontWeight: theme.font.weight.semibold,
  },
  bold: {
    fontWeight: theme.font.weight.bold,
  },
});