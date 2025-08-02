import { style, styleVariants } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

export const cardBase = style({
  backgroundColor: theme.color.surface,
  borderWidth: theme.border.thin,
  borderStyle: 'solid',
  borderColor: theme.color.border,
  overflow: 'hidden',
  color: theme.color.text,
});

// Size variants
export const sizeVariants = styleVariants({
  xs: {
    padding: theme.space.xs,
    borderRadius: theme.radius.sm,
  },
  sm: {
    padding: theme.space.sm,
    borderRadius: theme.radius.sm,
  },
  md: {
    padding: theme.space.md,
    borderRadius: theme.radius.md,
  },
  lg: {
    padding: theme.space.lg,
    borderRadius: theme.radius.md,
  },
  xl: {
    padding: theme.space.xl,
    borderRadius: theme.radius.lg,
  },
});

// Variant styles
export const variantStyles = styleVariants({
  primary: {
    backgroundColor: theme.color.background,
    borderColor: theme.color.primary,
    borderWidth: theme.border.base,
  },
  secondary: {
    backgroundColor: theme.color.background,
    borderColor: theme.color.secondary,
    borderWidth: theme.border.base,
  },
  tertiary: {
    backgroundColor: theme.color.surface,
    borderColor: theme.color.borderLight,
    borderWidth: theme.border.thin,
  },
});