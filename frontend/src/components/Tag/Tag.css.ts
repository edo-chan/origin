import { style, styleVariants } from '@vanilla-extract/css';
import { themeContract } from '../../styles/theme.css';

export const tagBase = style({
  display: 'inline-flex',
  alignItems: 'center',
  gap: themeContract.space.xs,
  fontFamily: themeContract.font.family,
  fontWeight: themeContract.font.weight.medium,
  border: themeContract.border.thin,
  borderStyle: 'solid',
  borderRadius: themeContract.radius.md,
  cursor: 'default',
  userSelect: 'none',
});

export const tagVariants = styleVariants({
  primary: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.primary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.primary} 40%, transparent)`,
    color: themeContract.color.primary,
  },
  secondary: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.secondary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.secondary} 40%, transparent)`,
    color: themeContract.color.secondary,
  },
  tertiary: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.tertiary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.tertiary} 40%, transparent)`,
    color: themeContract.color.tertiary,
  },
  success: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.tertiary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.tertiary} 40%, transparent)`,
    color: themeContract.color.tertiary,
  },
  warning: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.secondary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.secondary} 40%, transparent)`,
    color: themeContract.color.secondary,
  },
  danger: {
    backgroundColor: `color-mix(in srgb, ${themeContract.color.primary} 15%, transparent)`,
    borderColor: `color-mix(in srgb, ${themeContract.color.primary} 40%, transparent)`,
    color: themeContract.color.primary,
  },
  neutral: {
    backgroundColor: themeContract.color.surface,
    borderColor: themeContract.color.border,
    color: themeContract.color.textSecondary,
  },
});

export const tagSizes = styleVariants({
  xs: {
    padding: `${themeContract.space.xs} ${themeContract.space.sm}`,
    fontSize: themeContract.font.size.xs,
    minHeight: '20px',
  },
  sm: {
    padding: `${themeContract.space.sm} ${themeContract.space.md}`,
    fontSize: themeContract.font.size.sm,
    minHeight: '24px',
  },
  md: {
    padding: `${themeContract.space.sm} ${themeContract.space.lg}`,
    fontSize: themeContract.font.size.base,
    minHeight: '32px',
  },
  lg: {
    padding: `${themeContract.space.md} ${themeContract.space.xl}`,
    fontSize: themeContract.font.size.lg,
    minHeight: '40px',
  },
});

