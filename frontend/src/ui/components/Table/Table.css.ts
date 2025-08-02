import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { theme } from '@/ui/styles/theme.css';

// Base table styles
export const tableBase = style({
  border: `${theme.border.thin} solid ${theme.color.border}`,
  borderRadius: theme.radius.md,
  backgroundColor: theme.color.surface,
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  overflow: 'hidden',
  fontFamily: theme.font.family,
  boxShadow: theme.shadow.sm,
});

export const tableHeader = style({
  backgroundColor: theme.color.borderLight,
  borderColor: theme.color.border,
  fontWeight: theme.font.weight.semibold,
  textAlign: 'left',
  color: theme.color.text,
});

export const tableCell = style({
  borderBottom: `${theme.border.thin} solid ${theme.color.border}`,
  color: theme.color.text,
});

// Size variants
export const sizeVariants = styleVariants({
  xs: {},
  sm: {},
  md: {},
  lg: {},
  xl: {},
});

globalStyle(`${sizeVariants.xs} th, ${sizeVariants.xs} td`, {
  padding: theme.space.xs,
  fontSize: theme.font.size.xs,
});

globalStyle(`${sizeVariants.sm} th, ${sizeVariants.sm} td`, {
  padding: theme.space.sm,
  fontSize: theme.font.size.sm,
});

globalStyle(`${sizeVariants.md} th, ${sizeVariants.md} td`, {
  padding: theme.space.md,
  fontSize: theme.font.size.base,
});

globalStyle(`${sizeVariants.lg} th, ${sizeVariants.lg} td`, {
  padding: theme.space.lg,
  fontSize: theme.font.size.lg,
});

globalStyle(`${sizeVariants.xl} th, ${sizeVariants.xl} td`, {
  padding: theme.space.xl,
  fontSize: theme.font.size.xl,
});


// Variant styles
export const variantStyles = styleVariants({
  primary: {
    borderColor: theme.color.primary,
  },
  secondary: {
    borderColor: theme.color.secondary,
  },
  tertiary: {
    borderColor: theme.color.border,
  },
});

globalStyle(`${variantStyles.primary} thead`, {
  backgroundColor: theme.color.primary,
  color: theme.color.background,
});

globalStyle(`${variantStyles.primary} tbody tr:hover`, {
  backgroundColor: theme.color.primaryHover,
  color: theme.color.background,
});

globalStyle(`${variantStyles.secondary} thead`, {
  backgroundColor: theme.color.secondary,
  color: theme.color.background,
});

globalStyle(`${variantStyles.secondary} tbody tr:hover`, {
  backgroundColor: theme.color.secondaryHover,
  color: theme.color.background,
});

globalStyle(`${variantStyles.tertiary} thead`, {
  backgroundColor: theme.color.borderLight,
  color: theme.color.text,
});

globalStyle(`${variantStyles.tertiary} tbody tr:hover`, {
  backgroundColor: theme.color.surface,
  color: theme.color.text,
});