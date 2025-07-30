import { style, styleVariants } from '@vanilla-extract/css';
import { tokens } from '../../styles/tokens.css';

export const cardBase = style({
  backgroundColor: tokens.color.neutral['50'],
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: tokens.color.neutral['200'],
  overflow: 'hidden',
});

// Size variants (standard sizes)
export const sizeVariants = styleVariants({
  xs: {
    padding: tokens.padding.xs,
    borderRadius: tokens.radius.sm,
  },
  sm: {
    padding: tokens.padding.sm,
    borderRadius: tokens.radius.sm,
  },
  md: {
    padding: tokens.padding.md,
    borderRadius: tokens.radius.md,
  },
  lg: {
    padding: tokens.padding.lg,
    borderRadius: tokens.radius.md,
  },
  xl: {
    padding: tokens.padding.xl,
    borderRadius: tokens.radius.lg,
  },
});

// T-shirt size variants
export const sizeVariantsT = styleVariants({
  tshirtXS: {
    padding: tokens.padding.tshirtXS,
    borderRadius: tokens.radius.sm,
  },
  tshirtS: {
    padding: tokens.padding.tshirtS,
    borderRadius: tokens.radius.sm,
  },
  tshirtM: {
    padding: tokens.padding.tshirtM,
    borderRadius: tokens.radius.md,
  },
  tshirtL: {
    padding: tokens.padding.tshirtL,
    borderRadius: tokens.radius.md,
  },
  tshirtXL: {
    padding: tokens.padding.tshirtXL,
    borderRadius: tokens.radius.lg,
  },
});

// Variant styles
export const variantStyles = styleVariants({
  primary: {
    backgroundColor: tokens.color.primary['50'],
    borderColor: tokens.color.primary['500'],
  },
  secondary: {
    backgroundColor: tokens.color.secondary['50'],
    borderColor: tokens.color.secondary['500'],
  },
  tertiary: {
    backgroundColor: tokens.color.neutral['50'],
    borderColor: tokens.color.neutral['300'],
  },
});